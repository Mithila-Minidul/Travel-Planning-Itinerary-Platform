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

        // ✅ NEW - comma-separated interests, e.g. "Hiking,Nature,Culture"
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

        // Status: Pending, Approved, Rejected
        [Required, MaxLength(50)]
        public string Status { get; set; } = "Pending";

        // ✅ NEW - Destination FK
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        // Traveler who created the trip
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

        // Travel Agent who reviewed it (nullable until reviewed)
        public Guid? TravelAgentId { get; set; }
        public User? TravelAgent { get; set; }

        public ICollection<TripStop> TripStops { get; set; } = new List<TripStop>();
    }
}