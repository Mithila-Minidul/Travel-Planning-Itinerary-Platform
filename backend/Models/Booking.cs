using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    /// <summary>
    /// A traveler's booking of one experience within a trip.
    /// Status flow: Pending (guide review) → Confirmed → Completed
    /// Cancellation transitions: Pending|Confirmed → Cancelled
    /// </summary>
    public class Booking : BaseEntity
    {
        // ============ RELATIONSHIPS ============
        [Required]
        public Guid TripId { get; set; }
        public Trip Trip { get; set; } = null!;

        [Required]
        public Guid TripStopId { get; set; }
        public TripStop TripStop { get; set; } = null!;

        [Required]
        public Guid ExperienceId { get; set; }
        public Experience Experience { get; set; } = null!;

        [Required]
        public Guid TravelerId { get; set; }
        public User Traveler { get; set; } = null!;

        [Required]
        public Guid GuideId { get; set; }
        public LocalGuide Guide { get; set; } = null!;

        // ============ BOOKING DETAILS ============
        [Required, Range(1, 50)]
        public int NumberOfGuests { get; set; } = 1;

        [Required]
        public DateTime BookingDate { get; set; }   // day the experience happens

        // Price snapshot — never re-calculated after booking
        public decimal TotalAmount { get; set; }

        // ============ STATUS ============
        // Pending | Confirmed | Cancelled | Completed | NoShow
        [Required, MaxLength(30)]
        public string Status { get; set; } = "Pending";

        // ============ CHECK-IN ============
        [Required, MaxLength(20)]
        public string ConfirmationCode { get; set; } = string.Empty;   // unique QR code

        public DateTime? CheckedInAt { get; set; }

        // ============ EXTRA ============
        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime? CancelledAt { get; set; }
        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        // ============ NAVIGATION ============
        public Payment? Payment { get; set; }
    }
}