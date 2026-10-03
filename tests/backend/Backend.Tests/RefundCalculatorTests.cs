using System;
using Backend.Services;
using Xunit;

namespace Backend.Tests
{
    public class RefundCalculatorTests
    {
        [Theory]
        [InlineData(14, 100)]
        [InlineData(7, 100)]
        [InlineData(6, 50)]
        [InlineData(3, 50)]
        [InlineData(2, 25)]
        [InlineData(1, 25)]
        [InlineData(0, 0)]
        [InlineData(-3, 0)]
        public void GetRefundPercentage_CalculatesExactPolicyTiers(int daysDifference, int expectedPercentage)
        {
            var now = DateTime.UtcNow.Date;
            var bookingDate = now.AddDays(daysDifference);

            var pct = RefundCalculator.GetRefundPercentage(bookingDate, now);

            Assert.Equal(expectedPercentage, pct);
        }

        [Theory]
        [InlineData(100, "Full refund")]
        [InlineData(50, "50% refund")]
        [InlineData(25, "25% refund")]
        [InlineData(0, "No refund")]
        public void GetPolicyDescription_MatchesDescriptionString(int percentage, string expectedSubstring)
        {
            var desc = RefundCalculator.GetPolicyDescription(percentage);
            Assert.Contains(expectedSubstring, desc, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public void DaysBefore_CalculatesDayDeltaCorrectly()
        {
            var now = new DateTime(2026, 10, 1);
            var booking = new DateTime(2026, 10, 11);

            Assert.Equal(10, RefundCalculator.DaysBefore(booking, now));
        }
    }
}