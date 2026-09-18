using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Trip : BaseEntity
    {
        // ── Relationship: Traveler who owns this trip ──────────────────────────
        [Required]
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

        // ── Core trip details ──────────────────────────────────────────────────
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Objective { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // ── Traveler constraints / preferences (free-text, stored as JSON or
        //    comma-separated; kept as string to remain schema-flexible) ──────────
        [MaxLength(2000)]
        public string? Constraints { get; set; }

        // ── Status lifecycle ───────────────────────────────────────────────────
        public TripStatus Status { get; set; } = TripStatus.Draft;

        // ── Agent review metadata ──────────────────────────────────────────────
        [MaxLength(1000)]
        public string? ReviewNotes { get; set; }

        public Guid? ReviewedByAgentId { get; set; }

        public DateTime? ReviewedAt { get; set; }

        // ── Navigation: stops will be added in the next step ──────────────────
        public ICollection<TripStop> Stops { get; set; } = new List<TripStop>();
    }
}
