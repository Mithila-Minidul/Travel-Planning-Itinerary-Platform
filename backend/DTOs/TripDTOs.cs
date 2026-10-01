using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // ================= CREATE =================
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

        [MaxLength(500)]
        public string Interests { get; set; } = string.Empty;

        // ============================================================
        // ✅ NEW: Trip Builder Redesign Fields
        // ============================================================

        [MaxLength(50)]
        public string? TravelGroup { get; set; }

        [Range(1, 50)]
        public int NumberOfTravelers { get; set; } = 1;

        [MaxLength(50)]
        public string? BudgetTier { get; set; }

        [MaxLength(50)]
        public string? TravelPace { get; set; }

        [MaxLength(100)]
        public string? PreferredTimes { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }
    }

    // ================= STOP =================
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

    // ================= REVIEW =================
    public class TripReviewDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

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

        // Assigned Local Guide
        public Guid? GuideId { get; set; }
        public string? GuideName { get; set; }
        public string? GuideCity { get; set; }

        // ============================================================
        // ✅ NEW: Trip Builder Redesign Fields (response)
        // ============================================================
        public string? TravelGroup { get; set; }
        public int NumberOfTravelers { get; set; }
        public string? BudgetTier { get; set; }
        public string? TravelPace { get; set; }
        public string? PreferredTimes { get; set; }
        public string? SpecialRequests { get; set; }
        public string? AiErrors { get; set; }
        public string? RejectionReason { get; set; }   // 👈 ADDED
        public decimal TotalEstimatedCost { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public List<TripStopDto> TripStops { get; set; } = new();
    }
}