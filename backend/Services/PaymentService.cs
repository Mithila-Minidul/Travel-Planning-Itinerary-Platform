using System;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;

        public PaymentService(AppDbContext context) => _context = context;

        // ---------- Process payment (Mock or Stripe placeholder) ----------
        public async Task<PaymentResponseDto> ProcessAsync(Guid bookingId, Guid travelerUserId, PaymentProcessDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.TravelerId != travelerUserId)
                throw new UnauthorizedAccessException("Not your booking.");

            if (booking.Status != "Confirmed")
                throw new InvalidOperationException("Booking must be confirmed before payment.");

            if (booking.Payment != null && booking.Payment.Status == "Succeeded")
                throw new InvalidOperationException("Booking already paid.");

            // Simulate provider response (swap for Stripe in E.6)
            var method = string.IsNullOrWhiteSpace(dto.Method) ? "Mock" : dto.Method;
            var txId = method == "Stripe"
                ? $"stripe_test_{Guid.NewGuid():N}"[..24]
                : $"mock_{Guid.NewGuid():N}"[..20];

            var payment = booking.Payment ?? new Payment { BookingId = booking.Id };
            payment.Amount = booking.TotalAmount;
            payment.Currency = "USD";
            payment.Method = method;
            payment.Status = "Succeeded";
            payment.TransactionId = txId;
            payment.PaidAt = DateTime.UtcNow;

            if (booking.Payment == null) _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Map(payment);
        }

        // ---------- Preview refund (Traveler/Admin looks before cancelling) ----------
        public async Task<RefundPreviewDto> PreviewRefundAsync(Guid bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.Payment == null || booking.Payment.Status != "Succeeded")
                throw new InvalidOperationException("No successful payment to refund.");

            var now = DateTime.UtcNow;
            var days = RefundCalculator.DaysBefore(booking.BookingDate, now);
            var pct = RefundCalculator.GetRefundPercentage(booking.BookingDate, now);
            var amt = Math.Round(booking.Payment.Amount * pct / 100m, 2);

            return new RefundPreviewDto
            {
                BookingId = booking.Id,
                TotalPaid = booking.Payment.Amount,
                DaysBeforeBooking = days,
                RefundPercentage = pct,
                RefundAmount = amt,
                Policy = RefundCalculator.GetPolicyDescription(pct)
            };
        }

        // ---------- Refund (Admin override) ----------
        public async Task<PaymentResponseDto> RefundAsync(Guid bookingId, string? reason)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.BookingId == bookingId)
                ?? throw new KeyNotFoundException("Payment not found.");

            if (payment.Status != "Succeeded")
                throw new InvalidOperationException($"Cannot refund a payment with status {payment.Status}.");

            var booking = await _context.Bookings.FirstAsync(b => b.Id == bookingId);
            var now = DateTime.UtcNow;
            var pct = RefundCalculator.GetRefundPercentage(booking.BookingDate, now);
            var amt = Math.Round(payment.Amount * pct / 100m, 2);

            payment.RefundAmount = amt;
            payment.RefundPercentage = pct;
            payment.RefundReason = reason ?? "Refunded by admin.";
            payment.RefundedAt = now;
            payment.Status = pct == 100 ? "Refunded" : "PartiallyRefunded";

            await _context.SaveChangesAsync();
            return Map(payment);
        }

        private static PaymentResponseDto Map(Payment p) => new()
        {
            Id = p.Id,
            BookingId = p.BookingId,
            Amount = p.Amount,
            Currency = p.Currency,
            Method = p.Method,
            Status = p.Status,
            TransactionId = p.TransactionId,
            PaidAt = p.PaidAt,
            RefundAmount = p.RefundAmount,
            RefundReason = p.RefundReason,
            RefundedAt = p.RefundedAt,
            RefundPercentage = p.RefundPercentage
        };
    }
}