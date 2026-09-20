using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // ================= CREATE =================
    // Traveler submits this. No TripStops — AI generates them.
    public class TripCreateDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Objective { get; set; } = string.Empty;

        [Required]
        public Guid DestinationId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(1, 1000000)]
        public decimal Budget { get; set; }

        [MaxLength(1000)]
        public string Constraints { get; set; } = string.Empty;

        // Comma-separated, e.g. "Hiking,Nature,Culture"
        [MaxLength(500)]
        public string Interests { get; set; } = string.Empty;
    }

    // ================= STOP (used in responses) =================
    public class TripStopDto
    {
        public Guid? ExperienceId { get; set; }
        public int DayNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public int OrderIndex { get; set; }
    }

    // ================= REVIEW (Travel Agent approves/rejects) =================
    public class TripReviewDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // "Approved" or "Rejected"

        public string? RejectionReason { get; set; }
    }

    // ================= RESPONSE =================
    public class TripResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        public string Interests { get; set; } = string.Empty;

        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }

        public string Status { get; set; } = string.Empty;
        public string TravelerName { get; set; } = string.Empty;
        public string? TravelAgentName { get; set; }

        // Sum of all stop costs — useful for "over budget" warnings
        public decimal TotalEstimatedCost { get; set; }

        public List<TripStopDto> TripStops { get; set; } = new();
    }
}