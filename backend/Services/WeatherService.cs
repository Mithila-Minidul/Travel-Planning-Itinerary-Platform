using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WeatherService> _logger;

        public WeatherService(HttpClient httpClient, ILogger<WeatherService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<WeatherResponseDto> GetWeatherForDestinationAsync(Destination destination)
        {
            var apiKey = Environment.GetEnvironmentVariable("WEATHER_API_KEY");
            var baseUrl = Environment.GetEnvironmentVariable("WEATHER_BASE_URL") ?? "https://api.openweathermap.org/data/2.5";

            // Fallback mock weather if no API key is provided during testing
            if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_OPENWEATHERMAP_API_KEY")
            {
                return GetMockWeather(destination.Name);
            }

            try
            {
                var url = $"{baseUrl}/weather?lat={destination.Latitude}&lon={destination.Longitude}&appid={apiKey}&units=metric";
                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Weather API returned {response.StatusCode}. Falling back to default data.");
                    return GetMockWeather(destination.Name);
                }

                var content = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(content);
                var root = jsonDoc.RootElement;

                var temp = root.GetProperty("main").GetProperty("temp").GetDouble();
                var humidity = root.GetProperty("main").GetProperty("humidity").GetInt32();
                var wind = root.GetProperty("wind").GetProperty("speed").GetDouble() * 3.6; // m/s to km/h
                var condition = root.GetProperty("weather")[0].GetProperty("main").GetString() ?? "Clear";
                var description = root.GetProperty("weather")[0].GetProperty("description").GetString() ?? "Clear sky";

                string suitability = condition.ToLower().Contains("rain") 
                    ? "Rain expected: Indoor activities or waterproof gear recommended." 
                    : "Excellent conditions for outdoor activities and hikes.";

                return new WeatherResponseDto
                {
                    DestinationName = destination.Name,
                    TemperatureCelsius = Math.Round(temp, 1),
                    Condition = condition,
                    Description = description,
                    Humidity = humidity,
                    WindSpeedKmh = Math.Round(wind, 1),
                    WeatherSuitability = suitability
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching live weather.");
                return GetMockWeather(destination.Name);
            }
        }

        private static WeatherResponseDto GetMockWeather(string destinationName)
        {
            return new WeatherResponseDto
            {
                DestinationName = destinationName,
                TemperatureCelsius = 23.5,
                Condition = "Sunny",
                Description = "Clear skies with light breeze",
                Humidity = 65,
                WindSpeedKmh = 12.0,
                WeatherSuitability = "Perfect weather for sightseeing, hiking, and outdoor photography."
            };
        }
    }
}