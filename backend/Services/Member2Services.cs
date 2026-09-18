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
            public TripService(AppDbContext context) => _context = context;

            // ── Private helpers ────────────────────────────────────────────────────

            /// <summary>
            /// Base query: active trips with Traveler + Stops (including Destination
            /// and optional Experience per stop) eagerly loaded.
            /// Mirrors the pattern used by ExperienceService's Include chain.
            /// </summary>
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

            /// <summary>
            /// Maps a Trip entity to TripResponseDto.
            /// Stops are sorted by StopOrder ascending for consistent ordering.
            /// </summary>
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

            /// <summary>
            /// Validates that EndDate is after StartDate.
            /// Mirrors the pattern of ValidateAvailability in ExperienceService.
            /// </summary>
            private static void ValidateDateRange(DateTime startDate, DateTime endDate)
            {
                if (endDate <= startDate)
                    throw new InvalidOperationException("End date must be after start date.");
            }

            // ── Public interface implementation ────────────────────────────────────

            public async Task<IEnumerable<TripResponseDto>> GetByTravelerAsync(Guid travelerId)
            {
                var trips = await TripsWithDetails()
                    .Where(t => t.TravelerId == travelerId)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return trips.Select(MapToDto);
            }

            public async Task<IEnumerable<TripResponseDto>> GetAllForAdminAsync()
            {
                var trips = await TripsWithDetails()
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return trips.Select(MapToDto);
            }

            public async Task<TripResponseDto> GetByIdAsync(Guid id, Guid travelerId, bool isAdmin = false)
            {
                var trip = await TripsWithDetails()
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (trip == null)
                    throw new KeyNotFoundException("Trip not found.");

                // Ownership check: non-admin callers may only see their own trips.
                // Mirrors the pattern: FirstOrDefaultAsync(e => e.Id == id && e.GuideId == guideId)
                // but done post-load to give a consistent "not found" vs "forbidden" response.
                if (!isAdmin && trip.TravelerId != travelerId)
                    throw new UnauthorizedAccessException("You do not have permission to view this trip.");

                return MapToDto(trip);
            }

            public async Task<TripResponseDto> CreateAsync(Guid travelerId, TripCreateDto dto)
            {
                ValidateDateRange(dto.StartDate, dto.EndDate);

                // Verify the traveler user exists and is active.
                var traveler = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == travelerId && u.IsActive);

                if (traveler == null)
                    throw new KeyNotFoundException("Traveler account not found or inactive.");

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

                // Re-load with full navigation properties for the response.
                return await GetByIdAsync(trip.Id, travelerId);
            }

            public async Task<TripResponseDto> UpdateAsync(Guid travelerId, Guid id, TripUpdateDto dto)
            {
                // Ownership enforced by including travelerId in the query predicate —
                // exactly the same approach as ExperienceService.UpdateAsync(guideId, id, dto).
                var trip = await _context.Trips
                    .FirstOrDefaultAsync(t => t.Id == id && t.TravelerId == travelerId && t.IsActive);

                if (trip == null)
                    throw new KeyNotFoundException("Trip not found.");

                // Only Draft trips may be edited by the traveler.
                if (trip.Status != TripStatus.Draft)
                    throw new InvalidOperationException(
                        "Only trips in Draft status can be edited. " +
                        "Trips that are generating, pending review, approved, or rejected cannot be modified.");

                ValidateDateRange(dto.StartDate, dto.EndDate);

                trip.Title = dto.Title;
                trip.Objective = dto.Objective;
                trip.StartDate = dto.StartDate.ToUniversalTime();
                trip.EndDate = dto.EndDate.ToUniversalTime();
                trip.Constraints = dto.Constraints;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(trip.Id, travelerId);
            }

            public async Task DeleteAsync(Guid travelerId, Guid id)
            {
                // Ownership enforced by predicate — same pattern as ExperienceService.DeleteAsync.
                var trip = await _context.Trips
                    .FirstOrDefaultAsync(t => t.Id == id && t.TravelerId == travelerId && t.IsActive);

                if (trip == null)
                    throw new KeyNotFoundException("Trip not found.");

                // Soft delete: set IsActive = false — mirrors DestinationService.DeleteAsync.
                trip.IsActive = false;
                await _context.SaveChangesAsync();
            }

            public async Task DeleteByAdminAsync(Guid id)
            {
                // Admin bypass — no ownership check, same pattern as ExperienceService.DeleteByAdminAsync.
                var trip = await _context.Trips
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (trip == null)
                    throw new KeyNotFoundException("Trip not found.");

                trip.IsActive = false;
                await _context.SaveChangesAsync();
            }
        }

}
