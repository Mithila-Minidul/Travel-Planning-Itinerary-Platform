using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
    // ================= CATEGORY DTOs =================
    public class CategoryCreateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string IconName { get; set; } = "explore";
    }

    public class CategoryResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
    }

    // ================= DESTINATION DTOs =================
    public class DestinationCreateDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ProvinceState { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Country { get; set; } = "Sri Lanka";

        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public SeasonType CurrentSeason { get; set; } = SeasonType.Regular;

        // ✅ NEW
        [MaxLength(100)]
        public string? BestTimeToVisit { get; set; }

        [MaxLength(50)]
        public string? IdealDuration { get; set; }

        [MaxLength(500)]
        public string? Highlights { get; set; }
    }

    public class DestinationResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ProvinceState { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string CurrentSeason { get; set; } = string.Empty;
        public int ActiveExperiencesCount { get; set; }

        // ✅ NEW
        public string? BestTimeToVisit { get; set; }
        public string? IdealDuration { get; set; }
        public string? Highlights { get; set; }
    }

    // ================= LOCAL GUIDE DTOs =================
    public class GuideUpdateStatusDto
    {
        [Required]
        public GuideStatus Status { get; set; }
    }

    public class LocalGuideResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string ProfileImageUrl { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? LicenseNumber { get; set; }
        public int YearsOfExperience { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    // ================= EXPERIENCE DTOs =================
    public class ExperienceCreateDto
    {
        [Required]
        public Guid DestinationId { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(3000)]
        public string Description { get; set; } = string.Empty;

        [Required, Range(1, 1000)]
        public decimal BasePrice { get; set; }

        [Required, Range(1, 168)]
        public int DurationHours { get; set; }

        [Required, Range(1, 50)]
        public int MaxCapacity { get; set; }

        [Required]
        public List<string> AvailableWeekdays { get; set; } = new();

        [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$")]
        public string StartTime { get; set; } = "08:00";

        [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$")]
        public string EndTime { get; set; } = "12:00";

        [MaxLength(500)]
        public string MeetingPoint { get; set; } = string.Empty;

        public string? CoverImageUrl { get; set; }
        public List<string?> ImageUrls { get; set; } = new();
        public bool IsDynamicPricingEnabled { get; set; } = true;
        public decimal WeekendMultiplier { get; set; } = 1.15m;
        public decimal PeakSeasonMultiplier { get; set; } = 1.25m;

        // ✅ NEW — Enrichment Fields (all optional)
        [MaxLength(2000)]
        public string? WhatIncluded { get; set; }

        [MaxLength(2000)]
        public string? WhatNotIncluded { get; set; }

        [MaxLength(1000)]
        public string? WhatToBring { get; set; }

        [MaxLength(500)]
        public string? CancellationPolicy { get; set; }

        [MaxLength(200)]
        public string? Languages { get; set; }

        [MaxLength(50)]
        public string? FitnessLevel { get; set; }

        public int? MinAge { get; set; }

        [MaxLength(500)]
        public string? ImportantNotes { get; set; }
    }

    public class ExperienceResponseDto
    {
        public Guid Id { get; set; }
        public Guid GuideId { get; set; }
        public string GuideName { get; set; } = string.Empty;
        public Guid DestinationId { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal CurrentCalculatedPrice { get; set; }
        public int DurationHours { get; set; }
        public int MaxCapacity { get; set; }
        public List<string> AvailableWeekdays { get; set; } = new();
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string MeetingPoint { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public List<string?> ImageUrls { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int TotalBookingsCount { get; set; }

        // ✅ NEW — Enrichment Fields
        public string? WhatIncluded { get; set; }
        public string? WhatNotIncluded { get; set; }
        public string? WhatToBring { get; set; }
        public string? CancellationPolicy { get; set; }
        public string? Languages { get; set; }
        public string? FitnessLevel { get; set; }
        public int? MinAge { get; set; }
        public string? ImportantNotes { get; set; }
    }

    // ================= DYNAMIC PRICING CALCULATION DTO =================
    public class DynamicPriceCalculationDto
    {
        public Guid ExperienceId { get; set; }
        public decimal BasePrice { get; set; }
        public decimal FinalPrice { get; set; }
        public bool IsWeekend { get; set; }
        public decimal WeekendMultiplierApplied { get; set; }
        public string Season { get; set; } = string.Empty;
        public decimal SeasonMultiplierApplied { get; set; }
        public string PriceExplanation { get; set; } = string.Empty;
    }

    // ================= WEATHER DTO =================
    public class WeatherResponseDto
    {
        public string DestinationName { get; set; } = string.Empty;
        public double TemperatureCelsius { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Humidity { get; set; }
        public double WindSpeedKmh { get; set; }
        public string WeatherSuitability { get; set; } = string.Empty;
    }

    // ================= AI RESEARCH AGENT TOOL DTO =================
    public class AgentExperienceSearchQueryDto
    {
        public string? DestinationName { get; set; }
        public string? CategoryName { get; set; }
        public decimal? MaxBudget { get; set; }
        public DateTime? TravelDate { get; set; }
    }
    public class GuideStatsDto
    {
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }
}