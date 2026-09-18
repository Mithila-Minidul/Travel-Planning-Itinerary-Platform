using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class TripStop : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }
        public Trip Trip { get; set; } = null!;

        [Required]
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        public Guid? ExperienceId { get; set; }
        public Experience? Experience { get; set; }

        public int StopOrder { get; set; }

        public DateTime? PlannedArrival { get; set; }

        public DateTime? PlannedDeparture { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
