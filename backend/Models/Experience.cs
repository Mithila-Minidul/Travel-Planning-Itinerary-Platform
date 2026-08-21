using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Experience : BaseEntity
    {
        [Required]
        public Guid GuideId { get; set; }
        public LocalGuide Guide { get; set; } = null!;

        [Required]
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        [Required]
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(3000)]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        public int DurationHours { get; set; }
        public int MaxCapacity { get; set; }

        [MaxLength(500)]
        public string MeetingPoint { get; set; } = string.Empty;

        public string? CoverImageUrl { get; set; }

        public ExperienceStatus Status { get; set; } = ExperienceStatus.PendingApproval;

        public bool IsDynamicPricingEnabled { get; set; } = true;
        public decimal WeekendMultiplier { get; set; } = 1.15m;
        public decimal PeakSeasonMultiplier { get; set; } = 1.25m;

        public decimal Rating { get; set; } = 0.0m;
        public int TotalBookingsCount { get; set; } = 0;
    }
}