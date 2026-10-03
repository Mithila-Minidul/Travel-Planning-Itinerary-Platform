using System;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    public class BookingPaymentRulesTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static async Task<(AppDbContext db, Guid travelerId, Guid otherTravelerId, Guid guideUserId, Trip trip, Booking booking)>
            SeedBookingSystemAsync(AppDbContext db, string tripStatus = "Approved", string bookingStatus = "Pending")
        {
            var traveler = new User { Id = Guid.NewGuid(), FullName = "Traveler A", Email = "a@t.com", PasswordHash = "x", PhoneNumber = "0771", Role = "Traveler", IsActive = true };
            var otherTraveler = new User { Id = Guid.NewGuid(), FullName = "Traveler B", Email = "b@t.com", PasswordHash = "x", PhoneNumber = "0772", Role = "Traveler", IsActive = true };
            var guideUser = new User { Id = Guid.NewGuid(), FullName = "Guide", Email = "g@g.com", PasswordHash = "x", PhoneNumber = "0773", Role = "LocalGuide", IsActive = true };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = guideUser.Id, User = guideUser, City = "Ella", Status = GuideStatus.Approved };
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Ella", ProvinceState = "Uva" };
            var cat = new Category { Id = Guid.NewGuid(), Name = "Hiking" };
            var exp = new Experience { Id = Guid.NewGuid(), GuideId = guide.Id, DestinationId = dest.Id, CategoryId = cat.Id, Title = "Hike", BasePrice = 50, Status = ExperienceStatus.Approved };

            var trip = new Trip { Id = Guid.NewGuid(), Title = "Trip", DestinationId = dest.Id, StartDate = DateTime.UtcNow.AddDays(10), EndDate = DateTime.UtcNow.AddDays(12), Budget = 200, Status = tripStatus, TravelerId = traveler.Id, GuideId = guide.Id, NumberOfTravelers = 1 };
            var stop = new TripStop { Id = Guid.NewGuid(), TripId = trip.Id, ExperienceId = exp.Id, DayNumber = 1, Title = "Stop", EstimatedCost = 50 };

            var booking = new Booking
            {
                Id = Guid.NewGuid(), TripId = trip.Id, ExperienceId = exp.Id,
                TravelerId = traveler.Id, GuideId = guide.Id, Status = bookingStatus,
                ConfirmationCode = "TC-BKG100", BookingDate = DateTime.UtcNow.AddDays(10), TotalAmount = 50m
            };

            db.Users.AddRange(traveler, otherTraveler, guideUser);
            db.LocalGuides.Add(guide);
            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Experiences.Add(exp);
            db.Trips.Add(trip);
            db.TripStops.Add(stop);
            db.Bookings.Add(booking);
            await db.SaveChangesAsync();

            return (db, traveler.Id, otherTraveler.Id, guideUser.Id, trip, booking);
        }

        [Fact]
        public async Task CreateAsync_ApprovedTrip_CreatesPendingBookingWithUniqueCode()
        {
            using var db = NewDb();
            var (_, travelerId, _, _, trip, _) = await SeedBookingSystemAsync(db);
            var svc = new BookingService(db);

            // Remove existing booking to test clean create
            var existing = await db.Bookings.FirstAsync();
            db.Bookings.Remove(existing);
            await db.SaveChangesAsync();

            var res = await svc.CreateAsync(travelerId, new BookingCreateDto { TripId = trip.Id, NumberOfGuests = 2, BookingDate = trip.StartDate });

            Assert.Equal("Pending", res.Status);
            Assert.StartsWith("TC-", res.ConfirmationCode);
        }

        [Fact]
        public async Task CreateAsync_UnapprovedTrip_ThrowsInvalidOperation()
        {
            using var db = NewDb();
            var (_, travelerId, _, _, trip, _) = await SeedBookingSystemAsync(db, tripStatus: "Pending");
            var svc = new BookingService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new BookingCreateDto { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate }));
        }

        [Fact]
        public async Task ConfirmAsync_GuideConfirmsPendingBooking_UpdatesStatusToConfirmed()
        {
            using var db = NewDb();
            var (_, _, _, guideUserId, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Pending");
            var svc = new BookingService(db);

            var res = await svc.ConfirmAsync(booking.Id, guideUserId);
            Assert.Equal("Confirmed", res.Status);
        }

        [Fact]
        public async Task RejectAsync_GuideRejectsPendingBooking_MarksCancelledWithReason()
        {
            using var db = NewDb();
            var (_, _, _, guideUserId, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Pending");
            var svc = new BookingService(db);

            var res = await svc.RejectAsync(booking.Id, guideUserId, "Guide fully booked");
            Assert.Equal("Cancelled", res.Status);
            Assert.Contains("Guide fully booked", res.CancellationReason);
        }

        [Fact]
        public async Task CancelAsync_PaidBooking10DaysOut_Executes100PercentRefund()
        {
            using var db = NewDb();
            var (_, travelerId, _, _, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Confirmed");
            db.Payments.Add(new Payment { BookingId = booking.Id, Amount = 50m, Currency = "USD", Method = "Mock", Status = "Succeeded", PaidAt = DateTime.UtcNow });
            await db.SaveChangesAsync();

            var svc = new BookingService(db);
            var res = await svc.CancelAsync(booking.Id, travelerId, "Traveler", "Changed plans");

            Assert.Equal("Cancelled", res.Status);
            Assert.Equal(100, res.RefundPercentage);
        }

        [Fact]
        public async Task CheckInAsync_ValidCode_MarksCompleted()
        {
            using var db = NewDb();
            var (_, _, _, _, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Confirmed");
            var svc = new BookingService(db);

            var res = await svc.CheckInAsync(booking.Id, booking.ConfirmationCode);
            Assert.Equal("Completed", res.Status);
            Assert.NotNull(res.CheckedInAt);
        }

        [Fact]
        public async Task ProcessPaymentAsync_ConfirmedBooking_CreatesSucceededPayment()
        {
            using var db = NewDb();
            var (_, travelerId, _, _, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Confirmed");
            var paymentSvc = new PaymentService(db);

            var res = await paymentSvc.ProcessAsync(booking.Id, travelerId, new PaymentProcessDto { Method = "Mock" });
            Assert.Equal("Succeeded", res.Status);
        }

        [Fact]
        public async Task ProcessPaymentAsync_PendingBooking_ThrowsInvalidOperation()
        {
            using var db = NewDb();
            var (_, travelerId, _, _, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Pending");
            var paymentSvc = new PaymentService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                paymentSvc.ProcessAsync(booking.Id, travelerId, new PaymentProcessDto { Method = "Mock" }));
        }

        [Fact]
        public async Task GetTotalEarningsAsync_GuideWithPaidBookings_CalculatesTotal()
        {
            using var db = NewDb();
            var (_, _, _, guideUserId, _, booking) = await SeedBookingSystemAsync(db, bookingStatus: "Confirmed");
            db.Payments.Add(new Payment { BookingId = booking.Id, Amount = 50m, Currency = "USD", Method = "Mock", Status = "Succeeded", PaidAt = DateTime.UtcNow });
            await db.SaveChangesAsync();

            var svc = new BookingService(db);
            var earnings = await svc.GetTotalEarningsAsync(guideUserId);

            Assert.Equal(50m, earnings);
        }
    }
}