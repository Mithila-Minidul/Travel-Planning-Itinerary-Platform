using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context) => _context = context;

        // ---------- Create ----------
                public async Task<BookingResponseDto> CreateAsync(Guid travelerUserId, BookingCreateDto dto)
        {
            // Load the Trip with its stops (for experience + guide resolution)
            var trip = await _context.Trips
                .Include(t => t.TripStops).ThenInclude(s => s.Experience)
                .FirstOrDefaultAsync(t => t.Id == dto.TripId)
                ?? throw new KeyNotFoundException("Trip not found.");

            if (trip.TravelerId != travelerUserId)
                throw new UnauthorizedAccessException("You can only book your own trips.");

            if (trip.Status != "Approved")
                throw new InvalidOperationException("Trip must be approved by a Travel Agent before booking.");

            // Prevent duplicate active bookings
            var existing = await _context.Bookings
                .FirstOrDefaultAsync(b => b.TripId == trip.Id && b.Status != "Cancelled");
            if (existing != null)
                throw new InvalidOperationException("This trip is already booked.");

            // Compute total from all real stops (skip Free Days)
            var realStops = trip.TripStops
                .Where(s => s.ExperienceId != null && s.Experience != null)
                .ToList();

            if (realStops.Count == 0)
                throw new InvalidOperationException("This trip has no bookable experiences.");

            // All stops belong to ONE guide (One Guide Per Trip rule)
            var guideId = realStops[0].Experience!.GuideId;

            // Use the trip-stop snapshot price (what the traveler saw on the
            // trip detail page) — NOT the static Experience.BasePrice.
            var totalAmount = realStops.Sum(s =>
                s.EstimatedCost * dto.NumberOfGuests);

            var booking = new Booking
            {
                TripId = trip.Id,
                TripStopId = realStops[0].Id,   // reference first real stop (nullable-friendly)
                ExperienceId = realStops[0].ExperienceId!.Value,
                TravelerId = travelerUserId,
                GuideId = guideId,
                NumberOfGuests = dto.NumberOfGuests,
                BookingDate = dto.BookingDate,
                TotalAmount = totalAmount,
                Status = "Pending",
                ConfirmationCode = GenerateConfirmationCode(),
                Notes = dto.Notes
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return await MapAsync(booking.Id);
        }

        // ---------- Lists ----------
        public async Task<IEnumerable<BookingResponseDto>> GetForTravelerAsync(Guid travelerUserId)
            => await Query().Where(b => b.TravelerId == travelerUserId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => MapDto(b)).ToListAsync();

        public async Task<IEnumerable<BookingResponseDto>> GetForGuideAsync(Guid guideUserId)
        {
            var guide = await _context.LocalGuides
                .FirstOrDefaultAsync(g => g.UserId == guideUserId)
                ?? throw new KeyNotFoundException("Guide profile not found.");

            return await Query().Where(b => b.GuideId == guide.Id)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => MapDto(b)).ToListAsync();
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAllAsync()
            => await Query().OrderByDescending(b => b.CreatedAt)
                .Select(b => MapDto(b)).ToListAsync();

        public async Task<BookingResponseDto> GetByIdAsync(Guid id, Guid userId, string role)
        {
            var b = await Query().FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (role == "Traveler" && b.TravelerId != userId)
                throw new UnauthorizedAccessException("Not your booking.");

            return MapDto(b);
        }

        // ---------- Guide confirms ----------
        public async Task<BookingResponseDto> ConfirmAsync(Guid id, Guid guideUserId)
        {
            var guide = await _context.LocalGuides
                .FirstOrDefaultAsync(g => g.UserId == guideUserId)
                ?? throw new KeyNotFoundException("Guide profile not found.");

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.GuideId != guide.Id)
                throw new UnauthorizedAccessException("Not your booking.");

            if (booking.Status != "Pending")
                throw new InvalidOperationException($"Booking already {booking.Status}.");

            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();
            return await MapAsync(id);
        }
                // ---------- Guide rejects ----------
        public async Task<BookingResponseDto> RejectAsync(Guid id, Guid guideUserId, string? reason)
        {
            var guide = await _context.LocalGuides
                .FirstOrDefaultAsync(g => g.UserId == guideUserId)
                ?? throw new KeyNotFoundException("Guide profile not found.");

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.GuideId != guide.Id)
                throw new UnauthorizedAccessException("Not your booking.");

            if (booking.Status != "Pending")
                throw new InvalidOperationException($"Booking already {booking.Status}.");

            booking.Status = "Cancelled";
            booking.CancelledAt = DateTime.UtcNow;
            booking.CancellationReason = string.IsNullOrWhiteSpace(reason)
                ? "Rejected by guide."
                : $"Rejected by guide: {reason.Trim()}";

            await _context.SaveChangesAsync();
            return await MapAsync(id);
        }

        // ---------- Cancellation with refund ----------
        public async Task<BookingResponseDto> CancelAsync(Guid id, Guid userId, string role, string? reason)
        {
            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == id)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (role == "Traveler" && booking.TravelerId != userId)
                throw new UnauthorizedAccessException("Not your booking.");

            if (booking.Status == "Cancelled")
                throw new InvalidOperationException("Already cancelled.");

            if (booking.Status == "Completed")
                throw new InvalidOperationException("Cannot cancel a completed booking.");

            // Auto-refund if paid
            if (booking.Payment != null && booking.Payment.Status == "Succeeded")
            {
                var now = DateTime.UtcNow;
                var pct = RefundCalculator.GetRefundPercentage(booking.BookingDate, now);
                var refundAmt = Math.Round(booking.Payment.Amount * pct / 100m, 2);

                booking.Payment.RefundAmount = refundAmt;
                booking.Payment.RefundPercentage = pct;
                booking.Payment.RefundReason = reason ?? "Cancelled by user.";
                booking.Payment.RefundedAt = now;
                booking.Payment.Status = pct == 100 ? "Refunded" : "PartiallyRefunded";
            }

            booking.Status = "Cancelled";
            booking.CancelledAt = DateTime.UtcNow;
            booking.CancellationReason = reason;

            await _context.SaveChangesAsync();
            return await MapAsync(id);
        }

        // ---------- Check-in ----------
        public async Task<BookingResponseDto> CheckInAsync(Guid id, string confirmationCode)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.ConfirmationCode != confirmationCode)
                throw new InvalidOperationException("Invalid confirmation code.");

            if (booking.Status != "Confirmed")
                throw new InvalidOperationException($"Cannot check in — booking is {booking.Status}.");

            booking.Status = "Completed";
            booking.CheckedInAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return await MapAsync(id);
        }

        public async Task<BookingResponseDto> CheckInByCodeAsync(string confirmationCode)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.ConfirmationCode == confirmationCode)
                ?? throw new KeyNotFoundException("No booking found with that code.");

            return await CheckInAsync(booking.Id, confirmationCode);
        }

        // ---------- Total Earnings ---------- // 👈 ADD THIS BLOCK
        public async Task<decimal> GetTotalEarningsAsync(Guid guideUserId)
        {
            // 1. Find the guide profile using the logged-in UserId
            var guide = await _context.LocalGuides
                .FirstOrDefaultAsync(g => g.UserId == guideUserId);

            if (guide == null) return 0m;

            // 2. Sum up the successful payments minus any refunds
            var totalEarnings = await _context.Payments
                .Where(p => p.Booking.GuideId == guide.Id &&
                           (p.Status == "Succeeded" || p.Status == "PartiallyRefunded" || p.Status == "Refunded"))
                .SumAsync(p => p.Amount - (p.RefundAmount ?? 0m));

            return totalEarnings;
        }

        // ---------- Helpers ----------
        private IQueryable<Booking> Query() => _context.Bookings
            .Include(b => b.Trip)
            .Include(b => b.Experience).ThenInclude(e => e.Destination)
            .Include(b => b.Traveler)
            .Include(b => b.Guide).ThenInclude(g => g.User)
            .Include(b => b.Payment);

        private async Task<BookingResponseDto> MapAsync(Guid id)
        {
            var b = await Query().FirstAsync(x => x.Id == id);
            return MapDto(b);
        }

        private static BookingResponseDto MapDto(Booking b) => new()
        {
            Id = b.Id,
            TripId = b.TripId,
            TripTitle = b.Trip?.Title ?? "",
            TripStopId = b.TripStopId,
            ExperienceId = b.ExperienceId,
            ExperienceTitle = b.Experience?.Title ?? "",
            DestinationName = b.Experience?.Destination?.Name ?? "",
            TravelerName = b.Traveler?.FullName ?? "",
            TravelerId = b.TravelerId,
            GuideName = b.Guide?.User?.FullName ?? "",
            GuideId = b.GuideId,
            NumberOfGuests = b.NumberOfGuests,
            BookingDate = b.BookingDate,
            TotalAmount = b.TotalAmount,
            Status = b.Status,
            ConfirmationCode = b.ConfirmationCode,
            CheckedInAt = b.CheckedInAt,
            Notes = b.Notes,
            CancelledAt = b.CancelledAt,
            CancellationReason = b.CancellationReason,
            CreatedAt = b.CreatedAt,
            PaymentStatus = b.Payment?.Status,
            PaymentAmount = b.Payment?.Amount,
            PaymentMethod = b.Payment?.Method,
            RefundAmount = b.Payment?.RefundAmount,
            RefundPercentage = b.Payment?.RefundPercentage,
            RefundedAt = b.Payment?.RefundedAt
        };

        private static string GenerateConfirmationCode()
        {
            // Human-friendly: TC-XXXXXX (alphanumeric, uppercase)
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var rnd = new Random();
            var code = new char[6];
            for (int i = 0; i < 6; i++) code[i] = chars[rnd.Next(chars.Length)];
            return $"TC-{new string(code)}";
        }
    }
}