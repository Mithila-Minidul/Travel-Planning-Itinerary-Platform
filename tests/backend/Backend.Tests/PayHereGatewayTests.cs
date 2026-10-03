using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    public class PayHereGatewayTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        [Fact]
        public void VerifyNotifySignature_ValidMD5_ReturnsTrue()
        {
            using var db = NewDb();
            var service = new PayHereService(db);

            var merchantId = "1220001";
            var orderId = "order_12345";
            var amount = "100.00";
            var currency = "LKR";
            var statusCode = "2";
            var secret = "SecretPassKey";

            Environment.SetEnvironmentVariable("PAYHERE_MERCHANT_SECRET", secret);

            var secretHash = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(secret)));
            var expectedSignature = Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(merchantId + orderId + amount + currency + statusCode + secretHash)));

            var isValid = service.VerifyNotifySignature(merchantId, orderId, amount, currency, statusCode, expectedSignature);

            Assert.True(isValid);
        }

        [Fact]
        public void VerifyNotifySignature_TamperedAmount_ReturnsFalse()
        {
            using var db = NewDb();
            var service = new PayHereService(db);

            Environment.SetEnvironmentVariable("PAYHERE_MERCHANT_SECRET", "SecretKey");

            var isValid = service.VerifyNotifySignature("1220001", "order_12345", "999.00", "LKR", "2", "FORGED_SIGNATURE");

            Assert.False(isValid);
        }

        [Fact]
        public async Task HandleSuccessfulPaymentAsync_ValidOrderId_MarksBookingPaid()
        {
            using var db = NewDb();
            var service = new PayHereService(db);

            var bookingId = Guid.NewGuid();
            var booking = new Booking
            {
                Id = bookingId,
                TripId = Guid.NewGuid(),
                ExperienceId = Guid.NewGuid(),
                TravelerId = Guid.NewGuid(),
                GuideId = Guid.NewGuid(),
                Status = "Confirmed",
                ConfirmationCode = "TC-112233",
                TotalAmount = 75m
            };
            db.Bookings.Add(booking);
            await db.SaveChangesAsync();

            var orderId = bookingId.ToString("N");
            await service.HandleSuccessfulPaymentAsync(orderId);

            var payment = await db.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
            Assert.NotNull(payment);
            Assert.Equal("Succeeded", payment!.Status);
            Assert.Equal("PayHere", payment.Method);
        }
    }
}