using System;

namespace Backend.DTOs
{
    public class RecentActivityDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;     // user | experience | booking | payment | review
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Role { get; set; }
    }
}