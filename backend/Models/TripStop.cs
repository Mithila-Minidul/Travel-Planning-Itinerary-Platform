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
        public int DayNumber { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        public decimal EstimatedCost { get; set; }

        public int OrderIndex { get; set; }
    }
}