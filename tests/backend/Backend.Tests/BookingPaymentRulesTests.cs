using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    /// <summary>
    /// Member 1 – Backend/API & Database Testing.
    /// Business-rule tests for BookingService and PaymentService (EF InMemory, no real DB).
    /// </summary>
    public class BookingPaymentRulesTests
    {
        private static AppDbContext NewInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        // Seed a traveler + guide + approved trip with one real experience stop.
        private static async Task<(AppDbContext db, Guid travelerId, Guid guideId, Trip trip)>
            SeedApprovedTripAsync(string tripStatus = "Approved", bool includeRealStop = true)
        {
            var db = NewInMemoryDb();

            var traveler = new User { FullName = "T", Email = $"{Guid.NewGuid()}@t.com", PasswordHash = "x", PhoneNumber = "+94771234567", Role = "Traveler", IsActive = true };
            var guideUser = new User { FullName = "G", Email = $"{Guid.NewGuid()}@g.com", PasswordHash = "x", PhoneNumber = "+94771234567", Role = "LocalGuide", IsActive = true };
            var guide = new LocalGuide { User = guideUser, Bio = "b", City = "Ella", Status = GuideStatus.Approved };
            var dest = new Destination { Name = "Ella", ProvinceState = "Uva", Country = "Sri Lanka", Description = "d" };
            var cat = new Category { Name = "Hiking", Description = "d", IconName = "hiking" };
            var exp = new Experience
            {
                Guide = guide, Destination = dest, Category = cat,
                Title = "Hike", Description = "d", BasePrice = 30,
                DurationHours = 4, MaxCapacity = 10,
                Status = ExperienceStatus.Approved
            };

            db.Users.AddRange(traveler, guideUser);
            db.LocalGuides.Add(guide);
            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Experiences.Add(exp);
            await db.SaveChangesAsync();

            var trip = new Trip
            {
                Title = "Ella Trip", DestinationId = dest.Id,
                StartDate = DateTime.UtcNow.AddDays(14),
                EndDate = DateTime.UtcNow.AddDays(16),
                Budget = 200m, Status = tripStatus,
                TravelerId = traveler.Id, GuideId = guide.Id, NumberOfTravelers = 1
            };

            trip.TripStops.Add(new TripStop
            {
                DayNumber = 1, Title = "Hike", Description = "d",
                Location = "Ella", EstimatedCost = 30m, OrderIndex = 0,
                Experience = includeRealStop ? exp : null
            });

            db.Trips.Add(trip);
            await db.SaveChangesAsync();

            return (db, traveler.Id, guide.Id, trip);
        }

        // ---------------- BookingService.CreateAsync ----------------

        [Fact]
        public async Task CreateAsync_ApprovedTrip_CreatesPendingBookingWithConfirmationCode()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var svc = new BookingService(db);

            var result = await svc.CreateAsync(travelerId, new BookingCreateDto
            {
                TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate
            });

            Assert.Equal("Pending", result.Status);
            Assert.False(string.IsNullOrWhiteSpace(result.ConfirmationCode));
            Assert.StartsWith("TC-", result.ConfirmationCode);
        }

        [Fact]
        public async Task CreateAsync_TripNotApproved_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync("Pending");
            var svc = new BookingService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new BookingCreateDto
                { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate }));
        }

        [Fact]
        public async Task CreateAsync_AnotherTravelersTrip_ThrowsUnauthorized()
        {
            var (db, _, _, trip) = await SeedApprovedTripAsync();
            var svc = new BookingService(db);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                svc.CreateAsync(Guid.NewGuid(), new BookingCreateDto
                { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate }));
        }

        [Fact]
        public async Task CreateAsync_TripAlreadyBooked_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var svc = new BookingService(db);

            await svc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new BookingCreateDto
                { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate }));
        }

        [Fact]
        public async Task CreateAsync_TripWithNoRealStops_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync(includeRealStop: false);
            var svc = new BookingService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new BookingCreateDto
                { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate }));
        }

        // ---------------- BookingService.CancelAsync ----------------

        [Fact]
        public async Task CancelAsync_PaidBooking10DaysOut_Refunds100Percent()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var svc = new BookingService(db);

            var created = await svc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            var booking = await db.Bookings.FirstAsync(b => b.Id == created.Id);
            booking.Status = "Confirmed";
            db.Payments.Add(new Payment
            {
                BookingId = booking.Id, Amount = booking.TotalAmount,
                Currency = "USD", Method = "Mock", Status = "Succeeded",
                PaidAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            var result = await svc.CancelAsync(created.Id, travelerId, "Traveler", "changed plans");

            Assert.Equal("Cancelled", result.Status);
            var payment = await db.Payments.FirstAsync();
            Assert.Equal(100, payment.RefundPercentage);
            Assert.Equal("Refunded", payment.Status);
        }

        [Fact]
        public async Task CancelAsync_AlreadyCancelled_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var svc = new BookingService(db);

            var created = await svc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            await svc.CancelAsync(created.Id, travelerId, "Traveler", "no");
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CancelAsync(created.Id, travelerId, "Traveler", "no"));
        }

        // ---------------- PaymentService.ProcessAsync ----------------

        [Fact]
        public async Task ProcessAsync_PendingBooking_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var bookingSvc = new BookingService(db);
            var paymentSvc = new PaymentService(db);

            var created = await bookingSvc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                paymentSvc.ProcessAsync(created.Id, travelerId,
                    new PaymentProcessDto { Method = "Mock" }));
        }

        [Fact]
        public async Task ProcessAsync_ConfirmedBooking_SucceedsAndMarksPayment()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var bookingSvc = new BookingService(db);
            var paymentSvc = new PaymentService(db);

            var created = await bookingSvc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            var booking = await db.Bookings.FirstAsync(b => b.Id == created.Id);
            booking.Status = "Confirmed";
            await db.SaveChangesAsync();

            var result = await paymentSvc.ProcessAsync(created.Id, travelerId,
                new PaymentProcessDto { Method = "Mock" });

            Assert.Equal("Succeeded", result.Status);
            Assert.Equal(booking.TotalAmount, result.Amount);
        }

        [Fact]
        public async Task ProcessAsync_AlreadyPaid_Throws()
        {
            var (db, travelerId, _, trip) = await SeedApprovedTripAsync();
            var bookingSvc = new BookingService(db);
            var paymentSvc = new PaymentService(db);

            var created = await bookingSvc.CreateAsync(travelerId, new BookingCreateDto
            { TripId = trip.Id, NumberOfGuests = 1, BookingDate = trip.StartDate });

            var booking = await db.Bookings.FirstAsync(b => b.Id == created.Id);
            booking.Status = "Confirmed";
            await db.SaveChangesAsync();

            await paymentSvc.ProcessAsync(created.Id, travelerId,
                new PaymentProcessDto { Method = "Mock" });

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                paymentSvc.ProcessAsync(created.Id, travelerId,
                    new PaymentProcessDto { Method = "Mock" }));
        }
    }
}