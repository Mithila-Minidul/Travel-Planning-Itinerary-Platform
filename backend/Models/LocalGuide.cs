using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class LocalGuide : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        [Required, MaxLength(500)]
        public string Bio { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? LicenseNumber { get; set; }

        public int YearsOfExperience { get; set; } = 0;

        public GuideStatus Status { get; set; } = GuideStatus.Pending;

        public decimal Rating { get; set; } = 0.0m;
        public int ReviewCount { get; set; } = 0;

        public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    }
}