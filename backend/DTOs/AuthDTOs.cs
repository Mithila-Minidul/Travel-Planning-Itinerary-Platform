using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
    public class RegisterRequestDto : IValidatableObject
    {
        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        [Required, MaxLength(20), RegularExpression(
            @"^(07\d{8}|\+94[\s-]?7\d{8}|0094[\s-]?7\d{8})$",
            ErrorMessage = "Enter a valid Sri Lankan mobile number (07XXXXXXXX or +947XXXXXXXX).")]
        public string PhoneNumber { get; set; } = string.Empty;

        // ✅ FIXED: Removed [Required] — validation happens in Validate() below
        public string? ProfileImageUrl { get; set; }

        [Required]
        public string Role { get; set; } = "Traveler";

        // Local Guide specific fields
        [MaxLength(500)]
        public string GuideBio { get; set; } = string.Empty;
        [MaxLength(100)]
        public string GuideCity { get; set; } = string.Empty;
        [MaxLength(200)]
        public string LicenseNumber { get; set; } = string.Empty;
        [Range(0, 80)]
        public int YearsOfExperience { get; set; }

        // Travel Agent specific fields
        [MaxLength(200)]
        public string AgencyName { get; set; } = string.Empty;
        [MaxLength(200)]
        public string AgentLicenseNumber { get; set; } = string.Empty;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // ✅ Local Guide: photo + bio + city + license required
            if (Role == "LocalGuide")
            {
                if (string.IsNullOrWhiteSpace(ProfileImageUrl))
                    yield return new ValidationResult("Profile photo is required for Local Guides.", new[] { nameof(ProfileImageUrl) });
                if (string.IsNullOrWhiteSpace(GuideBio))
                    yield return new ValidationResult("Guide bio is required.", new[] { nameof(GuideBio) });
                if (string.IsNullOrWhiteSpace(GuideCity))
                    yield return new ValidationResult("Guide city is required.", new[] { nameof(GuideCity) });
                if (string.IsNullOrWhiteSpace(LicenseNumber))
                    yield return new ValidationResult("Guide license number is required.", new[] { nameof(LicenseNumber) });
            }

            // ✅ Travel Agent: photo + agency + license required
            if (Role == "TravelAgent")
            {
                if (string.IsNullOrWhiteSpace(ProfileImageUrl))
                    yield return new ValidationResult("Profile photo is required for Travel Agents.", new[] { nameof(ProfileImageUrl) });
                if (string.IsNullOrWhiteSpace(AgencyName))
                    yield return new ValidationResult("Agency name is required.", new[] { nameof(AgencyName) });
                if (string.IsNullOrWhiteSpace(AgentLicenseNumber))
                    yield return new ValidationResult("Agent license number is required.", new[] { nameof(AgentLicenseNumber) });
            }

            // ✅ Traveler: NO photo required — no validation needed
        }
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
        public string PhoneNumber { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }  // ✅ Nullable
        public string? AgencyName { get; set; }
        public string? AgentLicenseNumber { get; set; }
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