using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
    // ================= TRIP CREATE DTO =================
    public class TripCreateDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Objective { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [MaxLength(2000)]
        public string? Constraints { get; set; }
    }

    // ================= TRIP UPDATE DTO =================
    public class TripUpdateDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Objective { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [MaxLength(2000)]
        public string? Constraints { get; set; }
    }

    // ================= TRIP STOP SUMMARY DTO (used inside TripResponseDto) =================
    public class TripStopSummaryDto
    {
        public Guid Id { get; set; }
        public int StopOrder { get; set; }
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public Guid? ExperienceId { get; set; }
        public string? ExperienceTitle { get; set; }
        public DateTime? PlannedArrival { get; set; }
        public DateTime? PlannedDeparture { get; set; }
        public string? Notes { get; set; }
    }

    // ================= TRIP RESPONSE DTO =================
    public class TripResponseDto
    {
        public Guid Id { get; set; }
        public Guid TravelerId { get; set; }
        public string TravelerName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Constraints { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReviewNotes { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<TripStopSummaryDto> Stops { get; set; } = new();
    }

    // ================= TRIP STOP CREATE DTO =================
    public class TripStopCreateDto
    {
        [Required]
        public Guid DestinationId { get; set; }

        // Optional — stop may be a free destination visit without a booked experience
        public Guid? ExperienceId { get; set; }

        // If not provided, the service appends the stop at the end (max + 1)
        public int? StopOrder { get; set; }

        public DateTime? PlannedArrival { get; set; }

        public DateTime? PlannedDeparture { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    // ================= TRIP STOP UPDATE DTO =================
    public class TripStopUpdateDto
    {
        [Required]
        public Guid DestinationId { get; set; }

        public Guid? ExperienceId { get; set; }

        [Required]
        public int StopOrder { get; set; }

        public DateTime? PlannedArrival { get; set; }

        public DateTime? PlannedDeparture { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    // ================= TRIP STOP RESPONSE DTO =================
    public class TripStopResponseDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public int StopOrder { get; set; }
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public Guid? ExperienceId { get; set; }
        public string? ExperienceTitle { get; set; }
        public DateTime? PlannedArrival { get; set; }
        public DateTime? PlannedDeparture { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // ================= VALIDATION RESULT DTOs =================

    /// <summary>
    /// A single validation error or warning.
    /// Code is machine-readable (e.g. "ARRIVAL_AFTER_DEPARTURE").
    /// Message is human-readable for the frontend.
    /// StopId and StopOrder identify which stop triggered the issue (null for trip-level issues).
    /// Field names the specific property involved when applicable.
    /// </summary>
    public class ValidationIssue
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Guid? StopId { get; set; }
        public int? StopOrder { get; set; }
        public string? Field { get; set; }
    }

    /// <summary>
    /// Describes a schedule overlap between two specific TripStops.
    /// Both stop identifiers and orders are included so the frontend can
    /// highlight the conflicting pair precisely.
    /// </summary>
    public class StopConflict
    {
        public Guid StopAId { get; set; }
        public int StopAOrder { get; set; }
        public string StopADestination { get; set; } = string.Empty;
        public Guid StopBId { get; set; }
        public int StopBOrder { get; set; }
        public string StopBDestination { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Top-level validation result returned by ITripValidationService.
    /// IsValid is true only when Errors and Conflicts are both empty.
    /// Warnings are advisory and do not set IsValid to false.
    /// </summary>
    public class TripValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationIssue> Errors { get; set; } = new();
        public List<ValidationIssue> Warnings { get; set; } = new();
        public List<StopConflict> Conflicts { get; set; } = new();
    }

    // ================= TRAVEL TIME DTOs =================

    /// <summary>
    /// Request parameters for a travel-time lookup.
    /// Coordinates are passed as decimal latitude/longitude pairs matching
    /// the existing Destination model's Latitude/Longitude fields.
    /// </summary>
    public class TravelTimeRequestDto
    {
        public double OriginLatitude { get; set; }
        public double OriginLongitude { get; set; }
        public double DestinationLatitude { get; set; }
        public double DestinationLongitude { get; set; }

        /// <summary>Travel mode passed to Google Maps. Defaults to "driving".</summary>
        public string Mode { get; set; } = "driving";
    }

    /// <summary>
    /// Response from ITravelTimeService.
    /// IsAvailable is false when the API key is absent or the external call fails.
    /// The controller must NOT expose the raw API key or upstream error details.
    /// </summary>
    public class TravelTimeResponseDto
    {
        /// <summary>True when real data was returned from the external API.</summary>
        public bool IsAvailable { get; set; }

        /// <summary>Human-readable duration string, e.g. "2 hours 15 mins".</summary>
        public string DurationText { get; set; } = string.Empty;

        /// <summary>Duration in seconds (0 when IsAvailable is false).</summary>
        public int DurationSeconds { get; set; }

        /// <summary>Human-readable distance string, e.g. "145 km".</summary>
        public string DistanceText { get; set; } = string.Empty;

        /// <summary>Distance in metres (0 when IsAvailable is false).</summary>
        public int DistanceMetres { get; set; }

        /// <summary>Travel mode used for this result, e.g. "driving".</summary>
        public string Mode { get; set; } = string.Empty;

        /// <summary>Advisory message when IsAvailable is false.</summary>
        public string? FallbackMessage { get; set; }
    }
}
