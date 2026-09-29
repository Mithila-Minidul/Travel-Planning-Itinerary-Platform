using System;

namespace Backend.DTOs
{
    public class ReviewCreateDto
    {
        public Guid BookingId { get; set; }
        public Guid ExperienceId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReviewUpdateDto
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReviewReplyDto
    {
        public string Reply { get; set; } = string.Empty;
    }

    public class ReviewResponseDto
    {
        public Guid Id { get; set; }
        public Guid ExperienceId { get; set; }
        public string ExperienceTitle { get; set; } = string.Empty;
        public string? TravelerProfileImageUrl { get; set; }
        public Guid TravelerId { get; set; } // 👈 ADDED
        public string TravelerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string? GuideReply { get; set; }
        public DateTime? RepliedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}