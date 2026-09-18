using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class TripStop : BaseEntity
    {
        // ── Parent trip ────────────────────────────────────────────────────────
        [Required]
        public Guid TripId { get; set; }
        public Trip Trip { get; set; } = null!;

        // ── Destination (required — every stop must have a place) ──────────────
        [Required]
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        // ── Experience (optional — stop may be a free-visit without a booked
        //    experience; only Approved experiences should be linked) ─────────────
        public Guid? ExperienceId { get; set; }
        public Experience? Experience { get; set; }

        // ── Ordering within the trip ───────────────────────────────────────────
        public int StopOrder { get; set; }

        // ── Scheduled times (UTC) ──────────────────────────────────────────────
        public DateTime? PlannedArrival { get; set; }

        public DateTime? PlannedDeparture { get; set; }

        // ── Free-text traveler notes for this stop ─────────────────────────────
        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
