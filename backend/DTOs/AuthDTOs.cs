using System;
using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
    public class RegisterRequestDto
    {
        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        // ✅ FIXED: string instead of UserRole enum
        [Required]
        public string Role { get; set; } = "Traveler";

        // Local Guide specific fields
        public string? GuideBio { get; set; }
        public string? GuideCity { get; set; }
        public string? LicenseNumber { get; set; }
        public int YearsOfExperience { get; set; } = 0;

        // Travel Agent specific fields
        public string? AgencyName { get; set; }
        public string? AgentLicenseNumber { get; set; }
    }

    public class LoginRequestDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserProfileDto User { get; set; } = null!;
    }

    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public Guid? GuideId { get; set; }
        public string? GuideStatus { get; set; }
    }

    public class UserStatusUpdateDto
    {
        public bool IsActive { get; set; }
    }
}