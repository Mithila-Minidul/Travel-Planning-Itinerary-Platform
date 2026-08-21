using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Destination : BaseEntity
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ProvinceState { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Country { get; set; } = "Sri Lanka";

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public SeasonType CurrentSeason { get; set; } = SeasonType.Regular;

        public ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    }
}