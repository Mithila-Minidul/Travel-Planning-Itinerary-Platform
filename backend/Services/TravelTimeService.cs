using System;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    /// <summary>
    /// Calls the Google Maps Distance Matrix API to obtain travel time and distance
    /// between two coordinate pairs.
    ///
    /// Architecture:
    ///   React → ASP.NET Core API → ITravelTimeService → Google Maps API
    ///
    /// The Google Maps API key is read from the GOOGLE_MAPS_API_KEY environment
    /// variable (same pattern as WEATHER_API_KEY in WeatherService).
    /// It is never returned to the caller.
    ///
    /// Fallback: when the key is absent or the API call fails, the service
    /// returns IsAvailable = false with a FallbackMessage rather than throwing.
    /// This lets the frontend degrade gracefully without crashing.
    /// </summary>
    public class TravelTimeService : ITravelTimeService
     {
            private readonly HttpClient _httpClient;
            private readonly ILogger<TravelTimeService> _logger;

            // Google Maps Distance Matrix API base URL.
            // Overridable via GOOGLE_MAPS_BASE_URL env var for testing / mocking.
            private const string DefaultBaseUrl =
                "https://maps.googleapis.com/maps/api/distancematrix/json";

            // Request timeout — same conservative value used implicitly by WeatherService.
            private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(10);

            public TravelTimeService(HttpClient httpClient, ILogger<TravelTimeService> logger)
            {
                _httpClient = httpClient;
                _logger = logger;
            }

            public async Task<TravelTimeResponseDto> GetTravelTimeAsync(TravelTimeRequestDto request)
            {
                // ── Step 1: Resolve configuration from environment (never hard-coded) ──
                var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
                var baseUrl = Environment.GetEnvironmentVariable("GOOGLE_MAPS_BASE_URL")
                              ?? DefaultBaseUrl;

                // ── Step 2: Fallback when API key is absent ────────────────────────
                if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GOOGLE_MAPS_API_KEY")
                {
                    _logger.LogWarning(
                        "GOOGLE_MAPS_API_KEY is not configured. Returning unavailable travel-time response.");

                    return Unavailable(request.Mode, "Travel time data is unavailable: Google Maps API key is not configured.");
                }

                // ── Step 3: Build the Distance Matrix API URL ──────────────────────
                // Format: ?origins=lat,lng&destinations=lat,lng&mode=driving&key=...
                var origins      = FormatCoord(request.OriginLatitude,      request.OriginLongitude);
                var destinations = FormatCoord(request.DestinationLatitude, request.DestinationLongitude);
                var mode         = string.IsNullOrWhiteSpace(request.Mode) ? "driving" : request.Mode.ToLower();

                var url = $"{baseUrl}?origins={origins}&destinations={destinations}&mode={mode}&key={apiKey}";

                // ── Step 4: HTTP call with timeout ─────────────────────────────────
                try
                {
                    using var cts = new CancellationTokenSource(RequestTimeout);
                    var response = await _httpClient.GetAsync(url, cts.Token);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning(
                            "Google Maps Distance Matrix API returned HTTP {StatusCode}. Falling back.",
                            response.StatusCode);

                        return Unavailable(mode, "Travel time data is temporarily unavailable.");
                    }

                    var content = await response.Content.ReadAsStringAsync();

                    // ── Step 5: Parse the Distance Matrix JSON response ────────────
                    // Response structure:
                    //   { "status": "OK",
                    //     "rows": [{ "elements": [{ "status": "OK",
                    //                               "duration": { "value": 1234, "text": "20 mins" },
                    //                               "distance": { "value": 5678, "text": "5.6 km" } }] }] }
                    return ParseDistanceMatrixResponse(content, mode);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogWarning(
                        "Google Maps Distance Matrix API request timed out after {Timeout}s.",
                        RequestTimeout.TotalSeconds);

                    return Unavailable(mode, "Travel time data is temporarily unavailable: request timed out.");
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogError(ex, "Network error calling Google Maps Distance Matrix API.");
                    return Unavailable(mode, "Travel time data is temporarily unavailable: network error.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error calling Google Maps Distance Matrix API.");
                    return Unavailable(mode, "Travel time data is temporarily unavailable.");
                }
            }

            // ── Private helpers ────────────────────────────────────────────────────

            /// <summary>
            /// Parses the Google Maps Distance Matrix JSON response.
            /// Returns Unavailable on any structural issue so the caller never crashes.
            /// </summary>
            private TravelTimeResponseDto ParseDistanceMatrixResponse(string json, string mode)
            {
                try
                {
                    using var doc = JsonDocument.Parse(json);
                    var root = doc.RootElement;

                    // Top-level status check
                    var topStatus = root.GetProperty("status").GetString();
                    if (topStatus != "OK")
                    {
                        _logger.LogWarning(
                            "Google Maps Distance Matrix returned top-level status '{Status}'.", topStatus);
                        return Unavailable(mode, "Travel time data is unavailable for these locations.");
                    }

                    // Navigate to rows[0].elements[0]
                    var element = root
                        .GetProperty("rows")[0]
                        .GetProperty("elements")[0];

                    var elementStatus = element.GetProperty("status").GetString();
                    if (elementStatus != "OK")
                    {
                        _logger.LogWarning(
                            "Google Maps Distance Matrix element status: '{Status}'.", elementStatus);
                        return Unavailable(mode, "Travel time data is unavailable for these locations.");
                    }

                    var durationSeconds = element.GetProperty("duration").GetProperty("value").GetInt32();
                    var durationText    = element.GetProperty("duration").GetProperty("text").GetString() ?? string.Empty;
                    var distanceMetres  = element.GetProperty("distance").GetProperty("value").GetInt32();
                    var distanceText    = element.GetProperty("distance").GetProperty("text").GetString() ?? string.Empty;

                    return new TravelTimeResponseDto
                    {
                        IsAvailable     = true,
                        DurationSeconds = durationSeconds,
                        DurationText    = durationText,
                        DistanceMetres  = distanceMetres,
                        DistanceText    = distanceText,
                        Mode            = mode
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to parse Google Maps Distance Matrix response.");
                    return Unavailable(mode, "Travel time data is temporarily unavailable: unexpected response format.");
                }
            }

            /// <summary>
            /// Formats a coordinate pair as "lat,lng" using InvariantCulture so that
            /// decimal points are always "." regardless of the server's locale.
            /// </summary>
            private static string FormatCoord(double lat, double lng) =>
                $"{lat.ToString(CultureInfo.InvariantCulture)},{lng.ToString(CultureInfo.InvariantCulture)}";

            /// <summary>
            /// Creates a graceful-degradation response when real data is unavailable.
            /// IsAvailable = false signals the frontend to show an advisory notice.
            /// The API key is never included in this or any other response.
            /// </summary>
            private static TravelTimeResponseDto Unavailable(string mode, string reason) =>
                new TravelTimeResponseDto
                {
                    IsAvailable     = false,
                    DurationSeconds = 0,
                    DurationText    = string.Empty,
                    DistanceMetres  = 0,
                    DistanceText    = string.Empty,
                    Mode            = mode,
                    FallbackMessage = reason
                };
        }
}
