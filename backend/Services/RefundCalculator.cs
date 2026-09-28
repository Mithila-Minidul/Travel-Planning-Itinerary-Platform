using System;

namespace Backend.Services
{
    /// <summary>
    /// Business rule: refund percentage based on how many days before the
    /// booking date the cancellation occurs.
    /// Policy:
    ///   >= 7 days before  → 100%
    ///   3–6 days before   → 50%
    ///   1–2 days before   → 25%
    ///   < 24 hours before → 0%
    /// </summary>
    public static class RefundCalculator
    {
        public static int GetRefundPercentage(DateTime bookingDate, DateTime nowUtc)
        {
            var daysBefore = (bookingDate.Date - nowUtc.Date).Days;

            if (daysBefore >= 7) return 100;
            if (daysBefore >= 3) return 50;
            if (daysBefore >= 1) return 25;
            return 0;
        }

        public static string GetPolicyDescription(int percentage) => percentage switch
        {
            100 => "Full refund (7+ days before the experience).",
            50  => "50% refund (3-6 days before the experience).",
            25  => "25% refund (1-2 days before the experience).",
            0   => "No refund (less than 24 hours before the experience).",
            _   => "Refund policy not applicable."
        };

        public static int DaysBefore(DateTime bookingDate, DateTime nowUtc)
            => (bookingDate.Date - nowUtc.Date).Days;
    }
}