using System;
using Backend.Services;
using Xunit;

namespace Backend.Tests
{
    /// <summary>
    /// Member 1 – Backend/API & Database Testing.
    /// Unit tests for the RefundCalculator business rule.
    /// Rule: 7+ days = 100%, 3-6 days = 50%, 1-2 days = 25%, less than 24h = 0%.
    /// </summary>
    public class RefundCalculatorTests
    {
        // ---------- Normal cases ----------

        [Fact]
        public void GetRefundPercentage_When14DaysBefore_Returns100()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(14);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(100, result);
        }

        [Fact]
        public void GetRefundPercentage_When5DaysBefore_Returns50()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(5);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(50, result);
        }

        [Fact]
        public void GetRefundPercentage_When2DaysBefore_Returns25()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(2);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(25, result);
        }

        // ---------- Boundary cases ----------

        [Fact]
        public void GetRefundPercentage_WhenExactly7DaysBefore_Returns100()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(7);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(100, result);
        }

        [Fact]
        public void GetRefundPercentage_WhenExactly6DaysBefore_Returns50()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(6);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(50, result);
        }

        [Fact]
        public void GetRefundPercentage_WhenExactly3DaysBefore_Returns50()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(3);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(50, result);
        }

        [Fact]
        public void GetRefundPercentage_WhenExactly1DayBefore_Returns25()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(1);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(25, result);
        }

        [Fact]
        public void GetRefundPercentage_WhenSameDay_Returns0()
        {
            var bookingDate = DateTime.UtcNow.Date;
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(0, result);
        }

        // ---------- Failure / invalid case ----------

        [Fact]
        public void GetRefundPercentage_WhenBookingDateInPast_Returns0()
        {
            var bookingDate = DateTime.UtcNow.Date.AddDays(-5);
            var nowUtc = DateTime.UtcNow.Date;

            var result = RefundCalculator.GetRefundPercentage(bookingDate, nowUtc);

            Assert.Equal(0, result);
        }

        // ---------- Policy description ----------

        [Theory]
        [InlineData(100, "Full refund")]
        [InlineData(50, "50% refund")]
        [InlineData(25, "25% refund")]
        [InlineData(0, "No refund")]
        public void GetPolicyDescription_ReturnsMatchingText(int percentage, string expectedContains)
        {
            var description = RefundCalculator.GetPolicyDescription(percentage);

            Assert.Contains(expectedContains, description, StringComparison.OrdinalIgnoreCase);
        }

        // ---------- DaysBefore helper ----------

        [Fact]
        public void DaysBefore_ReturnsCorrectDifference()
        {
            var nowUtc = new DateTime(2026, 10, 1);
            var bookingDate = new DateTime(2026, 10, 10);

            var days = RefundCalculator.DaysBefore(bookingDate, nowUtc);

            Assert.Equal(9, days);
        }
    }
}