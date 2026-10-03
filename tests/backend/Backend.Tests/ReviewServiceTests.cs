using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    public class ReviewServiceTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static async Task<(AppDbContext db, Guid travelerId, Guid guideUserId, Guid expId, Booking booking)>
            SeedReviewSetupAsync(AppDbContext db, string bookingStatus = "Completed")
        {
            var traveler = new User { Id = Guid.NewGuid(), FullName = "Sarah", Email = "sarah@t.com", PasswordHash = "x", PhoneNumber = "0771", Role = "Traveler", IsActive = true };
            var guideUser = new User { Id = Guid.NewGuid(), FullName = "Guide", Email = "g@g.com", PasswordHash = "x", PhoneNumber = "0772", Role = "LocalGuide", IsActive = true };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = guideUser.Id, User = guideUser, City = "Ella", Status = GuideStatus.Approved };
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Ella", ProvinceState = "Uva" };
            var cat = new Category { Id = Guid.NewGuid(), Name = "Hiking" };
            var exp = new Experience { Id = Guid.NewGuid(), GuideId = guide.Id, DestinationId = dest.Id, CategoryId = cat.Id, Title = "Rock Hike", BasePrice = 50, Status = ExperienceStatus.Approved, Rating = 0m };

            var trip = new Trip { Id = Guid.NewGuid(), Title = "Trip", DestinationId = dest.Id, StartDate = DateTime.UtcNow.AddDays(-5), EndDate = DateTime.UtcNow.AddDays(-2), Budget = 100, Status = "Approved", TravelerId = traveler.Id, GuideId = guide.Id };
            var tripStop = new TripStop { Id = Guid.NewGuid(), TripId = trip.Id, ExperienceId = exp.Id, DayNumber = 1, Title = "Stop 1" };

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                TripId = trip.Id,
                ExperienceId = exp.Id,
                TravelerId = traveler.Id,
                GuideId = guide.Id,
                Status = bookingStatus,
                ConfirmationCode = "TC-REV999",
                BookingDate = DateTime.UtcNow.AddDays(-3),
                TotalAmount = 50m
            };

            db.Users.AddRange(traveler, guideUser);
            db.LocalGuides.Add(guide);
            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Experiences.Add(exp);
            db.Trips.Add(trip);
            db.TripStops.Add(tripStop);
            db.Bookings.Add(booking);
            await db.SaveChangesAsync();

            return (db, traveler.Id, guideUser.Id, exp.Id, booking);
        }

        [Fact]
        public async Task CreateAsync_WhenTripNotCompleted_ThrowsInvalidOperation()
        {
            using var db = NewDb();
            var (_, travelerId, _, expId, booking) = await SeedReviewSetupAsync(db, bookingStatus: "Confirmed");
            var svc = new ReviewService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new ReviewCreateDto { BookingId = booking.Id, ExperienceId = expId, Rating = 5, Comment = "Too early" }));
        }

        [Fact]
        public async Task CreateAsync_DuplicateReview_ThrowsInvalidOperation()
        {
            using var db = NewDb();
            var (_, travelerId, _, expId, booking) = await SeedReviewSetupAsync(db);
            var svc = new ReviewService(db);

            await svc.CreateAsync(travelerId, new ReviewCreateDto { BookingId = booking.Id, ExperienceId = expId, Rating = 5, Comment = "Great!" });

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                svc.CreateAsync(travelerId, new ReviewCreateDto { BookingId = booking.Id, ExperienceId = expId, Rating = 4, Comment = "Duplicate" }));
        }

        [Fact]
        public async Task ReplyAsync_GuideRepliesToReview_Succeeds()
        {
            using var db = NewDb();
            var (_, travelerId, guideUserId, expId, booking) = await SeedReviewSetupAsync(db);
            var svc = new ReviewService(db);

            var created = await svc.CreateAsync(travelerId, new ReviewCreateDto { BookingId = booking.Id, ExperienceId = expId, Rating = 5, Comment = "Awesome!" });
            var replyRes = await svc.ReplyAsync(created.Id, guideUserId, "LocalGuide", "Thanks for coming!");

            Assert.Equal("Thanks for coming!", replyRes.GuideReply);
            Assert.NotNull(replyRes.RepliedAt);
        }

        [Fact]
        public async Task DeleteAsync_UnauthorizedUser_ThrowsUnauthorized()
        {
            using var db = NewDb();
            var (_, travelerId, _, expId, booking) = await SeedReviewSetupAsync(db);
            var svc = new ReviewService(db);

            var created = await svc.CreateAsync(travelerId, new ReviewCreateDto { BookingId = booking.Id, ExperienceId = expId, Rating = 5, Comment = "Good" });

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                svc.DeleteAsync(created.Id, Guid.NewGuid(), "Traveler"));
        }
    }
}