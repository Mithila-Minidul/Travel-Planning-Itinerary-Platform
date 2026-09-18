using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ITripService
    {
 /// <summary>Returns all active trips owned by the specified traveler.</summary>
        Task<IEnumerable<TripResponseDto>> GetByTravelerAsync(Guid travelerId);

        /// <summary>Returns all active trips (admin view — all travelers).</summary>
        Task<IEnumerable<TripResponseDto>> GetAllForAdminAsync();

        /// <summary>
        /// Returns a single trip with its stops.
        /// Throws KeyNotFoundException if not found.
        /// Throws UnauthorizedAccessException if travelerId does not own the trip
        /// and isAdmin is false.
        /// </summary>
        Task<TripResponseDto> GetByIdAsync(Guid id, Guid travelerId, bool isAdmin = false);

        /// <summary>
        /// Creates a new trip for the given traveler.
        /// Throws InvalidOperationException on invalid date range.
        /// </summary>
        Task<TripResponseDto> CreateAsync(Guid travelerId, TripCreateDto dto);

        /// <summary>
        /// Updates a trip owned by the traveler.
        /// Throws KeyNotFoundException if the trip does not exist or is not owned by travelerId.
        /// Throws InvalidOperationException if the trip is not in an editable state (Draft only).
        /// </summary>
        Task<TripResponseDto> UpdateAsync(Guid travelerId, Guid id, TripUpdateDto dto);

        /// <summary>
        /// Soft-deletes a trip owned by the traveler.
        /// Throws KeyNotFoundException if the trip does not exist or is not owned by travelerId.
        /// </summary>
        Task DeleteAsync(Guid travelerId, Guid id);

        /// <summary>Admin hard-delete for any trip regardless of owner.</summary>
        Task DeleteByAdminAsync(Guid id);
    }

    public interface ITripStopService
    {

    }

    public interface ITripValidationService
    {

    }

    public interface ITravelTimeService
    {

    }
}
