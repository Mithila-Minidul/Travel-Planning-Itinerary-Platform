using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class TripCreateDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        [Required] public DateTime StartDate { get; set; }
        [Required] public DateTime EndDate { get; set; }
        [Required] public decimal Budget { get; set; }
        public string Constraints { get; set; } = string.Empty;
        public List<TripStopDto> TripStops { get; set; } = new();
    }

    public class TripStopDto
    {
        public int DayNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public int OrderIndex { get; set; }
    }

    public class TripReviewDto
    {
        [Required] public string Status { get; set; } = string.Empty; // Approved or Rejected
        public string? RejectionReason { get; set; } // Optional
    }

    public class TripResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Status { get; set; } = string.Empty;
        public string TravelerName { get; set; } = string.Empty;
        public string? TravelAgentName { get; set; }
        public List<TripStopDto> TripStops { get; set; } = new();
    }
}