using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Interfaces
{
    public interface IWeatherService
    {
        Task<WeatherResponseDto> GetWeatherForDestinationAsync(Destination destination);
    }
}