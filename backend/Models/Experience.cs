using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Experience : BaseEntity
    {
        // ================= RELATIONSHIPS =================
        [Required]
        public Guid GuideId { get; set; }
        public LocalGuide Guide { get; set; } = null!;

        [Required]
        public Guid DestinationId { get; set; }
        public Destination Destination { get; set; } = null!;

        [Required]
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        // ================= CORE DETAILS =================
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(3000)]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        public int DurationHours { get; set; }
        public int MaxCapacity { get; set; }

        [Required, MaxLength(100)]
        public string AvailableWeekdays { get; set; } = "Monday,Tuesday,Wednesday,Thursday,Friday";

        [Required, MaxLength(5)]
        public string StartTime { get; set; } = "08:00";

        [Required, MaxLength(5)]
        public string EndTime { get; set; } = "12:00";

        [MaxLength(500)]
        public string MeetingPoint { get; set; } = string.Empty;

        // ================= IMAGES =================
        public string? CoverImageUrl { get; set; }
        public string? Image2Url { get; set; }
        public string? Image3Url { get; set; }
        public string? Image4Url { get; set; }

        // ================= STATUS & PRICING =================
        public ExperienceStatus Status { get; set; } = ExperienceStatus.PendingApproval;

        public bool IsDynamicPricingEnabled { get; set; } = true;
        public decimal WeekendMultiplier { get; set; } = 1.15m;
        public decimal PeakSeasonMultiplier { get; set; } = 1.25m;

        // ================= STATS =================
        public decimal Rating { get; set; } = 0.0m;
        public int TotalBookingsCount { get; set; } = 0;

        // ============================================================
        // ================= NEW ENRICHMENT FIELDS ====================
        // All nullable → existing records remain valid
        // ============================================================

        /// <summary>
        /// What's included in the experience (e.g. "Guide, snacks, entry tickets")
        /// </summary>
        [MaxLength(2000)]
        public string? WhatIncluded { get; set; }

        /// <summary>
        /// What's NOT included (e.g. "Lunch, personal expenses")
        /// </summary>
        [MaxLength(2000)]
        public string? WhatNotIncluded { get; set; }

        /// <summary>
        /// What the traveler should bring (e.g. "Comfortable shoes, water bottle")
        /// </summary>
        [MaxLength(1000)]
        public string? WhatToBring { get; set; }

        /// <summary>
        /// Cancellation policy (e.g. "Free cancellation up to 24h before")
        /// </summary>
        [MaxLength(500)]
        public string? CancellationPolicy { get; set; }

        /// <summary>
        /// Languages offered (e.g. "English, Sinhala, Tamil")
        /// </summary>
        [MaxLength(200)]
        public string? Languages { get; set; }

        /// <summary>
        /// Fitness level required (e.g. "Easy", "Moderate", "Difficult")
        /// </summary>
        [MaxLength(50)]
        public string? FitnessLevel { get; set; }

        /// <summary>
        /// Minimum age requirement (null = no minimum)
        /// </summary>
        public int? MinAge { get; set; }

        /// <summary>
        /// Any important notes or warnings
        /// </summary>
        [MaxLength(500)]
        public string? ImportantNotes { get; set; }
    }
}