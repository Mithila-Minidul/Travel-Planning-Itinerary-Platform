using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TripService : ITripService
    {
        private readonly AppDbContext _context;

        public TripService(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<Trip> TripsWithDetails()
        {
            return _context.Trips
                .Include(t => t.Traveler)
                .Include(t => t.Stops)
                    .ThenInclude(s => s.Destination)
                .Include(t => t.Stops)
                    .ThenInclude(s => s.Experience)
                .Where(t => t.IsActive);
        }

        private static TripResponseDto MapToDto(Trip trip)
        {
            return new TripResponseDto
            {
                Id = trip.Id,
                TravelerId = trip.TravelerId,
                TravelerName = trip.Traveler?.FullName ?? string.Empty,
                Title = trip.Title,
                Objective = trip.Objective,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                Constraints = trip.Constraints,
                Status = trip.Status.ToString(),
                ReviewNotes = trip.ReviewNotes,
                ReviewedAt = trip.ReviewedAt,
                CreatedAt = trip.CreatedAt,
                UpdatedAt = trip.UpdatedAt,

                Stops = trip.Stops
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.StopOrder)
                    .Select(s => new TripStopSummaryDto
                    {
                        Id = s.Id,
                        StopOrder = s.StopOrder,
                        DestinationId = s.DestinationId,
                        DestinationName = s.Destination?.Name ?? string.Empty,
                        ExperienceId = s.ExperienceId,
                        ExperienceTitle = s.Experience?.Title,
                        PlannedArrival = s.PlannedArrival,
                        PlannedDeparture = s.PlannedDeparture,
                        Notes = s.Notes
                    })
                    .ToList()
            };
        }

        private static void ValidateDateRange(
            DateTime startDate,
            DateTime endDate)
        {
            if (endDate <= startDate)
            {
                throw new InvalidOperationException(
                    "End date must be after start date.");
            }
        }

        // ============================================================
        // TRAVELER - OWN TRIPS
        // ============================================================

        public async Task<IEnumerable<TripResponseDto>> GetByTravelerAsync(
            Guid travelerId)
        {
            var trips = await TripsWithDetails()
                .Where(t => t.TravelerId == travelerId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return trips.Select(MapToDto);
        }

        // ============================================================
        // ADMIN - ALL TRIPS
        // ============================================================

        public async Task<IEnumerable<TripResponseDto>> GetAllForAdminAsync()
        {
            var trips = await TripsWithDetails()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return trips.Select(MapToDto);
        }

        // ============================================================
        // TRAVEL AGENT - ALL TRIPS
        // ============================================================

        public async Task<IEnumerable<TripResponseDto>> GetAllForTravelAgentAsync()
        {
            var trips = await TripsWithDetails()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return trips.Select(MapToDto);
        }

        // ============================================================
        // GET SINGLE TRIP
        // Traveler -> own trip
        // TravelAgent/Admin -> any active trip
        // ============================================================

        public async Task<TripResponseDto> GetByIdAsync(
            Guid id,
            Guid userId,
            bool canViewAll = false)
        {
            var trip = await TripsWithDetails()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            if (!canViewAll && trip.TravelerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have permission to view this trip.");
            }

            return MapToDto(trip);
        }

        // ============================================================
        // CREATE TRIP
        // ============================================================

        public async Task<TripResponseDto> CreateAsync(
            Guid travelerId,
            TripCreateDto dto)
        {
            ValidateDateRange(
                dto.StartDate,
                dto.EndDate);

            var traveler = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Id == travelerId && u.IsActive);

            if (traveler == null)
            {
                throw new KeyNotFoundException(
                    "Traveler account not found or inactive.");
            }

            var trip = new Trip
            {
                TravelerId = travelerId,
                Title = dto.Title,
                Objective = dto.Objective,

                StartDate = dto.StartDate.ToUniversalTime(),
                EndDate = dto.EndDate.ToUniversalTime(),

                Constraints = dto.Constraints,
                Status = TripStatus.Draft
            };

            _context.Trips.Add(trip);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                trip.Id,
                travelerId);
        }

        // ============================================================
        // UPDATE TRIP
        // Traveler can update own Draft trip only
        // ============================================================

        public async Task<TripResponseDto> UpdateAsync(
            Guid travelerId,
            Guid id,
            TripUpdateDto dto)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(
                    t =>
                        t.Id == id &&
                        t.TravelerId == travelerId &&
                        t.IsActive);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            if (trip.Status != TripStatus.Draft)
            {
                throw new InvalidOperationException(
                    "Only trips in Draft status can be edited. " +
                    "Trips that are generating, pending review, " +
                    "approved, or rejected cannot be modified.");
            }

            ValidateDateRange(
                dto.StartDate,
                dto.EndDate);

            trip.Title = dto.Title;
            trip.Objective = dto.Objective;

            trip.StartDate = dto.StartDate.ToUniversalTime();
            trip.EndDate = dto.EndDate.ToUniversalTime();

            trip.Constraints = dto.Constraints;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                trip.Id,
                travelerId);
        }

        // ============================================================
        // DELETE - TRAVELER OWN TRIP
        // ============================================================

        public async Task DeleteAsync(
            Guid travelerId,
            Guid id)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(
                    t =>
                        t.Id == id &&
                        t.TravelerId == travelerId &&
                        t.IsActive);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            trip.IsActive = false;

            await _context.SaveChangesAsync();
        }

        // ============================================================
        // DELETE - ADMIN
        // ============================================================

        public async Task DeleteByAdminAsync(Guid id)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(
                    t => t.Id == id);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            trip.IsActive = false;

            await _context.SaveChangesAsync();
        }
    }

    // ================================================================
    // TRIP STOP SERVICE
    // ================================================================

    public class TripStopService : ITripStopService
    {
        private readonly AppDbContext _context;

        public TripStopService(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<TripStop> StopsWithDetails()
        {
            return _context.TripStops
                .Include(s => s.Trip)
                    .ThenInclude(t => t.Traveler)
                .Include(s => s.Destination)
                .Include(s => s.Experience)
                .Where(s => s.IsActive);
        }

        private static TripStopResponseDto MapToDto(TripStop s)
        {
            return new TripStopResponseDto
            {
                Id = s.Id,
                TripId = s.TripId,
                StopOrder = s.StopOrder,
                DestinationId = s.DestinationId,
                DestinationName = s.Destination?.Name ?? string.Empty,
                ExperienceId = s.ExperienceId,
                ExperienceTitle = s.Experience?.Title,
                PlannedArrival = s.PlannedArrival,
                PlannedDeparture = s.PlannedDeparture,
                Notes = s.Notes,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            };
        }

        private static void EnforceOwnership(
            TripStop stop,
            Guid travelerId,
            bool isAdmin)
        {
            if (!isAdmin &&
                stop.Trip.TravelerId != travelerId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have permission to access this trip stop.");
            }
        }

        private async Task<Destination> RequireDestinationAsync(
            Guid destinationId)
        {
            var dest = await _context.Destinations
                .FirstOrDefaultAsync(
                    d =>
                        d.Id == destinationId &&
                        d.IsActive);

            if (dest == null)
            {
                throw new KeyNotFoundException(
                    $"Destination '{destinationId}' not found or inactive.");
            }

            return dest;
        }

        private async Task RequireApprovedExperienceAsync(
            Guid experienceId)
        {
            var exp = await _context.Experiences
                .FirstOrDefaultAsync(
                    e =>
                        e.Id == experienceId &&
                        e.IsActive);

            if (exp == null)
            {
                throw new KeyNotFoundException(
                    $"Experience '{experienceId}' not found or inactive.");
            }

            if (exp.Status != ExperienceStatus.Approved)
            {
                throw new InvalidOperationException(
                    "Only Approved experiences can be added to a trip stop.");
            }
        }

        private static void RequireDraftTrip(Trip trip)
        {
            if (trip.Status != TripStatus.Draft)
            {
                throw new InvalidOperationException(
                    "Trip stops can only be added or modified on trips in Draft status.");
            }
        }

        public async Task<IEnumerable<TripStopResponseDto>> GetByTripAsync(
            Guid tripId,
            Guid travelerId,
            bool isAdmin = false)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(
                    t =>
                        t.Id == tripId &&
                        t.IsActive);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            if (!isAdmin &&
                trip.TravelerId != travelerId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have permission to access this trip.");
            }

            var stops = await StopsWithDetails()
                .Where(s => s.TripId == tripId)
                .OrderBy(s => s.StopOrder)
                .ToListAsync();

            return stops.Select(MapToDto);
        }

        public async Task<TripStopResponseDto> GetByIdAsync(
            Guid stopId,
            Guid travelerId,
            bool isAdmin = false)
        {
            var stop = await StopsWithDetails()
                .FirstOrDefaultAsync(
                    s => s.Id == stopId);

            if (stop == null)
            {
                throw new KeyNotFoundException(
                    "Trip stop not found.");
            }

            EnforceOwnership(
                stop,
                travelerId,
                isAdmin);

            return MapToDto(stop);
        }

        public async Task<TripStopResponseDto> CreateAsync(
            Guid tripId,
            Guid travelerId,
            TripStopCreateDto dto)
        {
            var trip = await _context.Trips
                .FirstOrDefaultAsync(
                    t =>
                        t.Id == tripId &&
                        t.IsActive);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            if (trip.TravelerId != travelerId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have permission to modify this trip.");
            }

            RequireDraftTrip(trip);

            await RequireDestinationAsync(
                dto.DestinationId);

            if (dto.ExperienceId.HasValue)
            {
                await RequireApprovedExperienceAsync(
                    dto.ExperienceId.Value);
            }

            int stopOrder =
                dto.StopOrder ??
                (
                    await _context.TripStops
                        .Where(
                            s =>
                                s.TripId == tripId &&
                                s.IsActive)
                        .MaxAsync(
                            s => (int?)s.StopOrder) ?? 0
                ) + 1;

            var stop = new TripStop
            {
                TripId = tripId,
                DestinationId = dto.DestinationId,
                ExperienceId = dto.ExperienceId,
                StopOrder = stopOrder,

                PlannedArrival =
                    dto.PlannedArrival?.ToUniversalTime(),

                PlannedDeparture =
                    dto.PlannedDeparture?.ToUniversalTime(),

                Notes = dto.Notes
            };

            _context.TripStops.Add(stop);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                stop.Id,
                travelerId);
        }

        public async Task<TripStopResponseDto> UpdateAsync(
            Guid stopId,
            Guid travelerId,
            TripStopUpdateDto dto)
        {
            var stop = await StopsWithDetails()
                .FirstOrDefaultAsync(
                    s => s.Id == stopId);

            if (stop == null)
            {
                throw new KeyNotFoundException(
                    "Trip stop not found.");
            }

            EnforceOwnership(
                stop,
                travelerId,
                isAdmin: false);

            RequireDraftTrip(stop.Trip);

            await RequireDestinationAsync(
                dto.DestinationId);

            if (dto.ExperienceId.HasValue)
            {
                await RequireApprovedExperienceAsync(
                    dto.ExperienceId.Value);
            }

            stop.DestinationId = dto.DestinationId;
            stop.ExperienceId = dto.ExperienceId;
            stop.StopOrder = dto.StopOrder;

            stop.PlannedArrival =
                dto.PlannedArrival?.ToUniversalTime();

            stop.PlannedDeparture =
                dto.PlannedDeparture?.ToUniversalTime();

            stop.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(
                stop.Id,
                travelerId);
        }

        public async Task DeleteAsync(
            Guid stopId,
            Guid travelerId)
        {
            var stop = await StopsWithDetails()
                .FirstOrDefaultAsync(
                    s => s.Id == stopId);

            if (stop == null)
            {
                throw new KeyNotFoundException(
                    "Trip stop not found.");
            }

            EnforceOwnership(
                stop,
                travelerId,
                isAdmin: false);

            _context.TripStops.Remove(stop);

            await _context.SaveChangesAsync();
        }
    }

    // ================================================================
    // TRIP VALIDATION SERVICE
    // ================================================================

    public class TripValidationService : ITripValidationService
    {
        private readonly AppDbContext _context;
        private readonly ITravelTimeService _travelTimeService;

        public TripValidationService(
            AppDbContext context,
            ITravelTimeService travelTimeService)
        {
            _context = context;
            _travelTimeService = travelTimeService;
        }

        public async Task<TripValidationResult> ValidateTripAsync(
            Guid tripId)
        {
            var trip = await _context.Trips
                .Include(t => t.Stops)
                    .ThenInclude(s => s.Destination)
                .FirstOrDefaultAsync(
                    t =>
                        t.Id == tripId &&
                        t.IsActive);

            if (trip == null)
            {
                throw new KeyNotFoundException(
                    "Trip not found.");
            }

            var result = new TripValidationResult();

            var stops = trip.Stops
                .Where(s => s.IsActive)
                .OrderBy(s => s.StopOrder)
                .ToList();

            // --------------------------------------------------------
            // R01 - Trip date range
            // --------------------------------------------------------

            if (trip.StartDate >= trip.EndDate)
            {
                result.Errors.Add(
                    new ValidationIssue
                    {
                        Code = "INVALID_TRIP_DATE_RANGE",
                        Message =
                            $"Trip StartDate ({trip.StartDate:yyyy-MM-dd}) " +
                            $"must be before EndDate ({trip.EndDate:yyyy-MM-dd}).",
                        Field = "StartDate"
                    });
            }

            // --------------------------------------------------------
            // R02 - Invalid stop order
            // --------------------------------------------------------

            foreach (var stop in stops.Where(
                s => s.StopOrder < 1))
            {
                result.Errors.Add(
                    new ValidationIssue
                    {
                        Code = "INVALID_STOP_ORDER",
                        Message =
                            $"Stop '{DestName(stop)}' has an invalid " +
                            $"StopOrder ({stop.StopOrder}). " +
                            "Must be 1 or greater.",
                        StopId = stop.Id,
                        StopOrder = stop.StopOrder,
                        Field = "StopOrder"
                    });
            }

            // --------------------------------------------------------
            // R03 - Duplicate stop order
            // --------------------------------------------------------

            var orderGroups = stops
                .GroupBy(s => s.StopOrder)
                .Where(g => g.Count() > 1);

            foreach (var group in orderGroups)
            {
                var names = string.Join(
                    ", ",
                    group.Select(
                        s => $"'{DestName(s)}'"));

                result.Errors.Add(
                    new ValidationIssue
                    {
                        Code = "DUPLICATE_STOP_ORDER",
                        Message =
                            $"Multiple stops share StopOrder {group.Key}: " +
                            $"{names}. Each stop must have a unique order.",
                        StopOrder = group.Key,
                        Field = "StopOrder"
                    });
            }

            // --------------------------------------------------------
            // Stop time validation
            // --------------------------------------------------------

            foreach (var stop in stops)
            {
                var hasArrival =
                    stop.PlannedArrival.HasValue;

                var hasDeparture =
                    stop.PlannedDeparture.HasValue;

                // R04 - Arrival must be before departure
                if (hasArrival &&
                    hasDeparture &&
                    stop.PlannedArrival!.Value >=
                    stop.PlannedDeparture!.Value)
                {
                    result.Errors.Add(
                        new ValidationIssue
                        {
                            Code = "ARRIVAL_AFTER_DEPARTURE",
                            Message =
                                $"Stop '{DestName(stop)}' " +
                                $"(order {stop.StopOrder}): " +
                                $"PlannedArrival " +
                                $"({stop.PlannedArrival.Value:yyyy-MM-dd HH:mm}) " +
                                $"must be before PlannedDeparture " +
                                $"({stop.PlannedDeparture.Value:yyyy-MM-dd HH:mm}).",
                            StopId = stop.Id,
                            StopOrder = stop.StopOrder,
                            Field = "PlannedArrival"
                        });
                }

                // R05 - Arrival before trip start
                if (hasArrival &&
                    stop.PlannedArrival!.Value <
                    trip.StartDate)
                {
                    result.Errors.Add(
                        new ValidationIssue
                        {
                            Code = "ARRIVAL_BEFORE_TRIP_START",
                            Message =
                                $"Stop '{DestName(stop)}' " +
                                $"(order {stop.StopOrder}): " +
                                $"PlannedArrival " +
                                $"({stop.PlannedArrival.Value:yyyy-MM-dd HH:mm}) " +
                                $"is before the trip start date " +
                                $"({trip.StartDate:yyyy-MM-dd}).",
                            StopId = stop.Id,
                            StopOrder = stop.StopOrder,
                            Field = "PlannedArrival"
                        });
                }

                // R06 - Departure after trip end
                if (hasDeparture &&
                    stop.PlannedDeparture!.Value >
                    trip.EndDate)
                {
                    result.Errors.Add(
                        new ValidationIssue
                        {
                            Code = "DEPARTURE_AFTER_TRIP_END",
                            Message =
                                $"Stop '{DestName(stop)}' " +
                                $"(order {stop.StopOrder}): " +
                                $"PlannedDeparture " +
                                $"({stop.PlannedDeparture.Value:yyyy-MM-dd HH:mm}) " +
                                $"is after the trip end date " +
                                $"({trip.EndDate:yyyy-MM-dd}).",
                            StopId = stop.Id,
                            StopOrder = stop.StopOrder,
                            Field = "PlannedDeparture"
                        });
                }

                if (!hasArrival &&
                    !hasDeparture)
                {
                    result.Warnings.Add(
                        new ValidationIssue
                        {
                            Code = "STOP_HAS_NO_TIMES",
                            Message =
                                $"Stop '{DestName(stop)}' " +
                                $"(order {stop.StopOrder}) has no " +
                                "PlannedArrival or PlannedDeparture. " +
                                "Adding times will enable overlap detection.",
                            StopId = stop.Id,
                            StopOrder = stop.StopOrder,
                            Field = "PlannedArrival"
                        });
                }
            }

            // --------------------------------------------------------
            // R07 - Overlapping stops
            // --------------------------------------------------------

            var timedStops = stops
                .Where(
                    s =>
                        s.PlannedArrival.HasValue &&
                        s.PlannedDeparture.HasValue)
                .ToList();

            for (int i = 0; i < timedStops.Count; i++)
            {
                for (int j = i + 1;
                     j < timedStops.Count;
                     j++)
                {
                    var a = timedStops[i];
                    var b = timedStops[j];

                    bool overlaps =
                        a.PlannedArrival!.Value <
                        b.PlannedDeparture!.Value &&
                        b.PlannedArrival!.Value <
                        a.PlannedDeparture!.Value;

                    if (overlaps)
                    {
                        result.Conflicts.Add(
                            new StopConflict
                            {
                                StopAId = a.Id,
                                StopAOrder = a.StopOrder,
                                StopADestination = DestName(a),

                                StopBId = b.Id,
                                StopBOrder = b.StopOrder,
                                StopBDestination = DestName(b),

                                Message =
                                    $"Stop '{DestName(a)}' " +
                                    $"(order {a.StopOrder}, " +
                                    $"{a.PlannedArrival!.Value:HH:mm}–" +
                                    $"{a.PlannedDeparture!.Value:HH:mm}) " +
                                    $"overlaps with stop '{DestName(b)}' " +
                                    $"(order {b.StopOrder}, " +
                                    $"{b.PlannedArrival!.Value:HH:mm}–" +
                                    $"{b.PlannedDeparture!.Value:HH:mm})."
                            });
                    }
                }
            }

            // --------------------------------------------------------
            // R08 - Chronological order mismatch
            // --------------------------------------------------------

            var orderedTimedStops = timedStops
                .OrderBy(s => s.StopOrder)
                .ToList();

            for (int i = 0;
                 i < orderedTimedStops.Count - 1;
                 i++)
            {
                var earlier = orderedTimedStops[i];
                var later = orderedTimedStops[i + 1];

                if (earlier.PlannedDeparture!.Value >
                    later.PlannedArrival!.Value)
                {
                    result.Warnings.Add(
                        new ValidationIssue
                        {
                            Code = "CHRONOLOGICAL_ORDER_MISMATCH",

                            Message =
                                $"Stop '{DestName(earlier)}' " +
                                $"(order {earlier.StopOrder}) departs at " +
                                $"{earlier.PlannedDeparture.Value:yyyy-MM-dd HH:mm} " +
                                $"but the next stop '{DestName(later)}' " +
                                $"(order {later.StopOrder}) arrives at " +
                                $"{later.PlannedArrival.Value:yyyy-MM-dd HH:mm}, " +
                                "which is earlier. Check whether the stop " +
                                "order reflects the intended travel sequence.",

                            StopId = later.Id,
                            StopOrder = later.StopOrder,
                            Field = "StopOrder"
                        });
                }
            }

            // --------------------------------------------------------
            // R09 - Travel time validation
            // --------------------------------------------------------

            for (int i = 0;
                 i < orderedTimedStops.Count - 1;
                 i++)
            {
                var stopA = orderedTimedStops[i];
                var stopB = orderedTimedStops[i + 1];

                if (!stopA.PlannedDeparture.HasValue ||
                    !stopB.PlannedArrival.HasValue)
                {
                    continue;
                }

                var coordsA = DestCoords(stopA);
                var coordsB = DestCoords(stopB);

                if (coordsA == null ||
                    coordsB == null)
                {
                    continue;
                }

                var availableWindow =
                    stopB.PlannedArrival!.Value -
                    stopA.PlannedDeparture!.Value;

                TravelTimeResponseDto travelTime;

                try
                {
                    travelTime =
                        await _travelTimeService.GetTravelTimeAsync(
                            new TravelTimeRequestDto
                            {
                                OriginLatitude =
                                    coordsA.Value.Lat,

                                OriginLongitude =
                                    coordsA.Value.Lng,

                                DestinationLatitude =
                                    coordsB.Value.Lat,

                                DestinationLongitude =
                                    coordsB.Value.Lng,

                                Mode = "driving"
                            });
                }
                catch (Exception ex)
                {
                    result.Warnings.Add(
                        new ValidationIssue
                        {
                            Code =
                                "TRAVEL_TIME_API_UNAVAILABLE",

                            Message =
                                $"Travel-time check between " +
                                $"'{DestName(stopA)}' " +
                                $"(order {stopA.StopOrder}) " +
                                $"and '{DestName(stopB)}' " +
                                $"(order {stopB.StopOrder}) " +
                                $"could not be completed: " +
                                $"{ex.Message}",

                            StopId = stopB.Id,
                            StopOrder = stopB.StopOrder,
                            Field = "PlannedArrival"
                        });

                    continue;
                }

                if (!travelTime.IsAvailable)
                {
                    result.Warnings.Add(
                        new ValidationIssue
                        {
                            Code =
                                "TRAVEL_TIME_API_UNAVAILABLE",

                            Message =
                                $"Travel-time check between " +
                                $"'{DestName(stopA)}' " +
                                $"(order {stopA.StopOrder}) " +
                                $"and '{DestName(stopB)}' " +
                                $"(order {stopB.StopOrder}) " +
                                $"could not be completed. " +
                                $"{travelTime.FallbackMessage ?? "Travel-time data is temporarily unavailable."}",

                            StopId = stopB.Id,
                            StopOrder = stopB.StopOrder,
                            Field = "PlannedArrival"
                        });

                    continue;
                }

                var estimatedDuration =
                    TimeSpan.FromSeconds(
                        travelTime.DurationSeconds);

                if (estimatedDuration >
                    availableWindow)
                {
                    result.Conflicts.Add(
                        new StopConflict
                        {
                            StopAId = stopA.Id,
                            StopAOrder = stopA.StopOrder,
                            StopADestination = DestName(stopA),

                            StopBId = stopB.Id,
                            StopBOrder = stopB.StopOrder,
                            StopBDestination = DestName(stopB),

                            Message =
                                $"Insufficient travel time between " +
                                $"'{DestName(stopA)}' " +
                                $"(order {stopA.StopOrder}) and " +
                                $"'{DestName(stopB)}' " +
                                $"(order {stopB.StopOrder}). " +
                                $"Estimated travel: " +
                                $"{travelTime.DurationText} " +
                                $"({travelTime.DurationSeconds}s). " +
                                $"Available window: " +
                                $"{FormatDuration(availableWindow)} " +
                                $"({stopA.PlannedDeparture!.Value:HH:mm} " +
                                $"→ {stopB.PlannedArrival!.Value:HH:mm}). " +
                                "Adjust departure or arrival times to allow sufficient transit time."
                        });
                }
            }

            // --------------------------------------------------------
            // Trip with no stops
            // --------------------------------------------------------

            if (!stops.Any())
            {
                result.Warnings.Add(
                    new ValidationIssue
                    {
                        Code = "TRIP_HAS_NO_STOPS",
                        Message =
                            "This trip has no stops yet. " +
                            "Add at least one destination before submitting."
                    });
            }

            result.IsValid =
                !result.Errors.Any() &&
                !result.Conflicts.Any();

            return result;
        }

        private static string DestName(TripStop stop)
        {
            return stop.Destination?.Name ??
                   stop.DestinationId.ToString();
        }

        private static (double Lat, double Lng)? DestCoords(
            TripStop stop)
        {
            var d = stop.Destination;

            if (d == null)
                return null;

            if (d.Latitude == 0 &&
                d.Longitude == 0)
            {
                return null;
            }

            return (
                d.Latitude,
                d.Longitude);
        }

        private static string FormatDuration(
            TimeSpan ts)
        {
            if (ts.TotalMinutes < 1)
                return $"{(int)ts.TotalSeconds}s";

            if (ts.TotalHours < 1)
                return $"{(int)ts.TotalMinutes} min";

            return $"{(int)ts.TotalHours}h {ts.Minutes}min";
        }
    }
}