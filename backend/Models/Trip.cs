using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Trip : BaseEntity
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Objective { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Interests { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public decimal Budget { get; set; }

        [MaxLength(1000)]
        public string Constraints { get; set; } = string.Empty;

        // ============================================================
        // ✅ NEW: Trip Builder Redesign Fields
        // ============================================================

        // Who's traveling: "Solo", "Couple", "Family", "Friends"
        [MaxLength(50)]
        public string? TravelGroup { get; set; }

        // How many people
        public int NumberOfTravelers { get; set; } = 1;

        // Budget tier: "Budget", "Mid", "Luxury"
        [MaxLength(50)]
        public string? BudgetTier { get; set; }

        // Travel pace: "Relaxed", "Balanced", "Fast"
        [MaxLength(50)]
        public string? TravelPace { get; set; }

        // Preferred times: comma-separated "Morning,Afternoon,Evening"
        [MaxLength(100)]
        public string? PreferredTimes { get; set; }

        // Special requests: free text
        [MaxLength(1000)]
        public string? SpecialRequests { get; set; }

        // ============================================================

        // Status: Pending, Approved, Rejected, Confirmed, Completed, Cancelled
        [Required, MaxLength(50)]
        public string Status { get; set; } = "Pending";

        // Destination FK
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        // Traveler who created the trip
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

        // Travel Agent who reviewed it
        public Guid? TravelAgentId { get; set; }
        public User? TravelAgent { get; set; }

        // ONE Local Guide owns all experiences in this trip
        public Guid? GuideId { get; set; }
        public LocalGuide? Guide { get; set; }

        public ICollection<TripStop> TripStops { get; set; } = new List<TripStop>();
    }
}