using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
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

    public class TripStopCreateDto
    {
        [Required]
        public Guid DestinationId { get; set; }
        public Guid? ExperienceId { get; set; }
        public int? StopOrder { get; set; }
        public DateTime? PlannedArrival { get; set; }
        public DateTime? PlannedDeparture { get; set; }
        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

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


    public class ValidationIssue
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Guid? StopId { get; set; }
        public int? StopOrder { get; set; }
        public string? Field { get; set; }
    }


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

    public class TripValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationIssue> Errors { get; set; } = new();
        public List<ValidationIssue> Warnings { get; set; } = new();
        public List<StopConflict> Conflicts { get; set; } = new();
    }


    public class TravelTimeRequestDto
    {
        public double OriginLatitude { get; set; }
        public double OriginLongitude { get; set; }
        public double DestinationLatitude { get; set; }
        public double DestinationLongitude { get; set; }
        public string Mode { get; set; } = "driving";
    }

    public class TravelTimeResponseDto
    {
        public bool IsAvailable { get; set; }
        public string DurationText { get; set; } = string.Empty;
        public int DurationSeconds { get; set; }
        public string DistanceText { get; set; } = string.Empty;
        public int DistanceMetres { get; set; }
        public string Mode { get; set; } = string.Empty;
        public string? FallbackMessage { get; set; }
    }
}
