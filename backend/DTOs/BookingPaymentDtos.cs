using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    // ============ BOOKING ============

    public class BookingCreateDto
    {
        public Guid TripStopId { get; set; }
        public int NumberOfGuests { get; set; } = 1;
        public DateTime BookingDate { get; set; }
        public string? Notes { get; set; }
    }

    public class BookingResponseDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string TripTitle { get; set; } = "";
        public Guid TripStopId { get; set; }
        public Guid ExperienceId { get; set; }
        public string ExperienceTitle { get; set; } = "";
        public string DestinationName { get; set; } = "";
        public string TravelerName { get; set; } = "";
        public Guid TravelerId { get; set; }
        public string GuideName { get; set; } = "";
        public Guid GuideId { get; set; }

        public int NumberOfGuests { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "";
        public string ConfirmationCode { get; set; } = "";
        public DateTime? CheckedInAt { get; set; }
        public string? Notes { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }

        // Payment summary (nullable — booking may have no payment yet)
        public string? PaymentStatus { get; set; }
        public decimal? PaymentAmount { get; set; }
        public string? PaymentMethod { get; set; }
    }

    public class BookingCancelDto
    {
        public string? Reason { get; set; }
    }

    // ============ PAYMENT ============

    public class PaymentProcessDto
    {
        public string Method { get; set; } = "Mock";  // Mock | Stripe | Cash
    }

    public class PaymentResponseDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string Method { get; set; } = "";
        public string Status { get; set; } = "";
        public string? TransactionId { get; set; }
        public DateTime? PaidAt { get; set; }
        public decimal? RefundAmount { get; set; }
        public string? RefundReason { get; set; }
        public DateTime? RefundedAt { get; set; }
        public int? RefundPercentage { get; set; }
    }

    public class RefundRequestDto
    {
        public string? Reason { get; set; }
    }

    public class RefundPreviewDto
    {
        public Guid BookingId { get; set; }
        public decimal TotalPaid { get; set; }
        public int DaysBeforeBooking { get; set; }
        public int RefundPercentage { get; set; }
        public decimal RefundAmount { get; set; }
        public string Policy { get; set; } = "";
    }
}