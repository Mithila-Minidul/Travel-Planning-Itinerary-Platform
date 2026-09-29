using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Destination : BaseEntity
    {
        // ================= CORE DETAILS =================
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ProvinceState { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Country { get; set; } = "Sri Lanka";

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        // ================= LOCATION =================
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public SeasonType CurrentSeason { get; set; } = SeasonType.Regular;

        // ============================================================
        // ================= NEW ENRICHMENT FIELDS ====================
        // All nullable → existing records remain valid
        // ============================================================

        /// <summary>
        /// Best time of year to visit (e.g. "December to March")
        /// </summary>
        [MaxLength(100)]
        public string? BestTimeToVisit { get; set; }

        /// <summary>
        /// Recommended trip duration (e.g. "2-3 days")
        /// </summary>
        [MaxLength(50)]
        public string? IdealDuration { get; set; }

        /// <summary>
        /// Key highlights (e.g. "Nine Arches Bridge, Tea Estates, Little Adam's Peak")
        /// </summary>
        [MaxLength(500)]
        public string? Highlights { get; set; }

        // ================= NAVIGATION =================
        public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    }
}