using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Trip : BaseEntity
    {
        [Required]
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

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

        public TripStatus Status { get; set; } = TripStatus.Draft;

        [MaxLength(1000)]
        public string? ReviewNotes { get; set; }

        public Guid? ReviewedByAgentId { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public ICollection<TripStop> Stops { get; set; } = new List<TripStop>();
    }
}
