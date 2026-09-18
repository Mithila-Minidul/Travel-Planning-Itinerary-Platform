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
    {}
}
