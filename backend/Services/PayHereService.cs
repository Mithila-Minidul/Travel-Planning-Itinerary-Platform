using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class PayHereService
    {
        private readonly AppDbContext _context;
        public PayHereService(AppDbContext context) => _context = context;

        private static string MerchantId =>
            Environment.GetEnvironmentVariable("PAYHERE_MERCHANT_ID") ?? "";

        private static string MerchantSecret =>
            Environment.GetEnvironmentVariable("PAYHERE_MERCHANT_SECRET") ?? "";

        private static bool IsSandbox =>
            (Environment.GetEnvironmentVariable("PAYHERE_SANDBOX") ?? "true").ToLower() == "true";

        private static string BackendUrl =>
            Environment.GetEnvironmentVariable("PAYHERE_BACKEND_PUBLIC_URL") ?? "http://localhost:7000";

        private static string Md5Upper(string input)
            => Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(input)));

        // ------------------------------------------------------------
        // 1. Build the checkout payload for Flutter's PayHere SDK
        // ------------------------------------------------------------
        public async Task<PayHerePayloadDto> BuildCheckoutAsync(Guid bookingId, Guid userId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Trip)
                .Include(b => b.Traveler)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.TravelerId != userId)
                throw new UnauthorizedAccessException("Not your booking.");

            if (booking.Payment != null && booking.Payment.Status == "Succeeded")
                throw new InvalidOperationException("Booking already paid.");

            if (booking.Status != "Confirmed")
                throw new InvalidOperationException("Booking must be confirmed before payment.");

            var orderId = booking.Id.ToString("N");
            var amountStr = booking.TotalAmount.ToString(
                "F2",
                System.Globalization.CultureInfo.InvariantCulture);
            var currency = "LKR";

            // PayHere hash: MD5(merchant_id + order_id + amount + currency + MD5(secret).ToUpper())
            var hashedSecret = Md5Upper(MerchantSecret);
            var hash = Md5Upper(MerchantId + orderId + amountStr + currency + hashedSecret);

            var nameParts = (booking.Traveler?.FullName ?? "Traveler").Split(' ', 2);

            return new PayHerePayloadDto
            {
                sandbox = IsSandbox ? "true" : "false",
                merchant_id = MerchantId,
                order_id = orderId,
                items = $"TripCraft booking {booking.Id.ToString()[..8]}",
                currency = currency,
                amount = amountStr,
                hash = hash,
                first_name = nameParts.ElementAtOrDefault(0) ?? "Traveler",
                last_name = nameParts.ElementAtOrDefault(1) ?? ".",
                email = booking.Traveler?.Email ?? "",
                phone = booking.Traveler?.PhoneNumber ?? "0770000000",
                address = "No. 1, Galle Road",
                city = "Colombo",
                country = "Sri Lanka",
                return_url = $"{BackendUrl}/api/Payments/payhere-return",
                cancel_url = $"{BackendUrl}/api/Payments/payhere-cancel",
                notify_url = $"{BackendUrl}/api/Payments/payhere-notify"
            };
        }

        // ------------------------------------------------------------
        // 2. Verify the webhook signature
        // ------------------------------------------------------------
        public bool VerifyNotifySignature(
            string merchantId, string orderId, string amount,
            string currency, string statusCode, string md5sig)
        {
            var hashedSecret = Md5Upper(MerchantSecret);
            var local = Md5Upper(merchantId + orderId + amount + currency + statusCode + hashedSecret);
            return string.Equals(local, md5sig, StringComparison.OrdinalIgnoreCase);
        }

        // ------------------------------------------------------------
        // 3. Mark booking paid when PayHere confirms success
        // ------------------------------------------------------------
        public async Task HandleSuccessfulPaymentAsync(string orderId)
        {
            if (!Guid.TryParseExact(orderId, "N", out var bookingId)) return;

            var booking = await _context.Bookings
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return;
            if (booking.Payment != null && booking.Payment.Status == "Succeeded") return;

            var payment = booking.Payment ?? new Payment { BookingId = booking.Id };
            payment.Amount = booking.TotalAmount;
            payment.Currency = "LKR";
            payment.Method = "PayHere";
            payment.Status = "Succeeded";
            payment.TransactionId = orderId;
            payment.PaidAt = DateTime.UtcNow;

            if (booking.Payment == null) _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
        }
    }
}