using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Review : BaseEntity
    {
        [Required]
        public Guid BookingId { get; set; }
        public Booking Booking { get; set; } = null!;

        [Required]
        public Guid ExperienceId { get; set; }
        public Experience Experience { get; set; } = null!;

        [Required]
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

        [Required, Range(1, 5)]
        public int Rating { get; set; }

        [Required, MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? GuideReply { get; set; }
        
        public DateTime? RepliedAt { get; set; }
    }
}