using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    /// <summary>
    /// Payment for a booking. One-to-one with Booking.
    /// Status flow: Pending → Succeeded | Failed → Refunded | PartiallyRefunded
    /// </summary>
    public class Payment : BaseEntity
    {
        [Required]
        public Guid BookingId { get; set; }
        public Booking Booking { get; set; } = null!;

        [Required]
        public decimal Amount { get; set; }

        [Required, MaxLength(10)]
        public string Currency { get; set; } = "USD";

        // Stripe | Mock | Cash
        [Required, MaxLength(30)]
        public string Method { get; set; } = "Mock";

        // Pending | Succeeded | Failed | Refunded | PartiallyRefunded
        [Required, MaxLength(30)]
        public string Status { get; set; } = "Pending";

        // Provider transaction reference (Stripe charge ID, mock UUID, etc.)
        [MaxLength(200)]
        public string? TransactionId { get; set; }

        public DateTime? PaidAt { get; set; }

        // ============ REFUND ============
        public decimal? RefundAmount { get; set; }

        [MaxLength(500)]
        public string? RefundReason { get; set; }

        public DateTime? RefundedAt { get; set; }

        // Percentage from the refund policy (0, 25, 50, 100)
        public int? RefundPercentage { get; set; }
    }
}