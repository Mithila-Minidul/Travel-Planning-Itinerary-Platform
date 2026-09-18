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
           /// <summary>
           /// Returns all stops for a trip, ordered by StopOrder.
           /// Throws KeyNotFoundException if the trip does not exist or is not active.
           /// Throws UnauthorizedAccessException if the trip does not belong to travelerId
           /// and isAdmin is false.
           /// </summary>
           Task<IEnumerable<TripStopResponseDto>> GetByTripAsync(Guid tripId, Guid travelerId, bool isAdmin = false);

           /// <summary>
           /// Returns a single stop.
           /// Ownership verified via TripStop → Trip → TravelerId.
           /// Throws KeyNotFoundException if not found.
           /// Throws UnauthorizedAccessException if the stop's trip does not belong to travelerId
           /// and isAdmin is false.
           /// </summary>
           Task<TripStopResponseDto> GetByIdAsync(Guid stopId, Guid travelerId, bool isAdmin = false);

           /// <summary>
           /// Adds a stop to a trip owned by travelerId.
           /// Validates that the destination exists.
           /// If ExperienceId is provided, validates the experience is Approved.
           /// Throws KeyNotFoundException if trip, destination, or experience not found.
           /// Throws InvalidOperationException if the trip is not in Draft status.
           /// Throws UnauthorizedAccessException if the trip does not belong to travelerId.
           /// </summary>
           Task<TripStopResponseDto> CreateAsync(Guid tripId, Guid travelerId, TripStopCreateDto dto);

           /// <summary>
           /// Updates an existing stop on a trip owned by travelerId.
           /// Validates destination and optional experience same as CreateAsync.
           /// Throws KeyNotFoundException if stop not found.
           /// Throws InvalidOperationException if the trip is not in Draft status.
           /// Throws UnauthorizedAccessException if ownership fails.
           /// </summary>
           Task<TripStopResponseDto> UpdateAsync(Guid stopId, Guid travelerId, TripStopUpdateDto dto);

           /// <summary>
           /// Hard-deletes a stop.
           /// Ownership verified via TripStop → Trip → TravelerId.
           /// Throws KeyNotFoundException if stop not found.
           /// Throws UnauthorizedAccessException if ownership fails.
           /// </summary>
           Task DeleteAsync(Guid stopId, Guid travelerId);
       }

    public interface ITripValidationService
     {
            /// <summary>
            /// Validates a Trip's itinerary using deterministic business rules.
            /// Loads the Trip and all active TripStops from the database.
            /// Throws KeyNotFoundException if the trip does not exist.
            ///
            /// Rules applied:
            ///   R01 – Trip StartDate must be before EndDate.
            ///   R02 – Every TripStop must have StopOrder >= 1.
            ///   R03 – No two TripStops may share the same StopOrder.
            ///   R04 – If both PlannedArrival and PlannedDeparture are set on a stop,
            ///          Arrival must be before Departure.
            ///   R05 – PlannedArrival (when set) must be >= Trip StartDate.
            ///   R06 – PlannedDeparture (when set) must be <= Trip EndDate.
            ///   R07 – Overlap detection: two stops conflict when their time windows
            ///          intersect (A.Arrival &lt; B.Departure AND B.Arrival &lt; A.Departure).
            ///   R08 – Chronological order: a stop with a lower StopOrder must depart
            ///          before or at the arrival of the next chronologically ordered stop.
            /// </summary>
            Task<TripValidationResult> ValidateTripAsync(Guid tripId);
        }

    public interface ITravelTimeService
    {

    }
}
