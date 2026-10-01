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
        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        // ✅ FIXED: Optional — Travelers don't have photo
        [MaxLength(500)]
        public string? ProfileImageUrl { get; set; }

        [MaxLength(200)]
        public string? AgencyName { get; set; }

        [MaxLength(200)]
        public string? AgentLicenseNumber { get; set; }

        [Required, MaxLength(50)]
        public string Role { get; set; } = "Traveler";

        public new bool IsActive { get; set; } = false;

        // 👇 ADDED: Real 3-state status for Travel Agents (and other roles)
        // Pending | Active | Rejected (nullable → Travelers just use "Active")
        [MaxLength(20)]
        public string? Status { get; set; }

        public LocalGuide? LocalGuideProfile { get; set; }
    }
}