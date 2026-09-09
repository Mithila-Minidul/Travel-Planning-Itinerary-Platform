using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User : BaseEntity
    {
        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required, MaxLength(50)]
        public string Role { get; set; } = "Traveler";  // ✅ Changed from UserRole to string

        public new bool IsActive { get; set; } = false;

        public LocalGuide? LocalGuideProfile { get; set; }
    }
}