using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ITripService
    {
        Task<IEnumerable<TripResponseDto>> GetByTravelerAsync(Guid travelerId);
        Task<IEnumerable<TripResponseDto>> GetAllForAdminAsync();
        Task<TripResponseDto> GetByIdAsync(Guid id, Guid travelerId, bool isAdmin = false);
        Task<TripResponseDto> CreateAsync(Guid travelerId, TripCreateDto dto);
        Task<TripResponseDto> UpdateAsync(Guid travelerId, Guid id, TripUpdateDto dto);
        Task DeleteAsync(Guid travelerId, Guid id);
        Task DeleteByAdminAsync(Guid id);
    }

    public interface ITripStopService
       {
           Task<IEnumerable<TripStopResponseDto>> GetByTripAsync(Guid tripId, Guid travelerId, bool isAdmin = false);
           Task<TripStopResponseDto> GetByIdAsync(Guid stopId, Guid travelerId, bool isAdmin = false);
           Task<TripStopResponseDto> CreateAsync(Guid tripId, Guid travelerId, TripStopCreateDto dto);
           Task<TripStopResponseDto> UpdateAsync(Guid stopId, Guid travelerId, TripStopUpdateDto dto);
           Task DeleteAsync(Guid stopId, Guid travelerId);
       }

    public interface ITripValidationService
     {
            Task<TripValidationResult> ValidateTripAsync(Guid tripId);
     }

    public interface ITravelTimeService
        {
            Task<TravelTimeResponseDto> GetTravelTimeAsync(TravelTimeRequestDto request);
        }
}
