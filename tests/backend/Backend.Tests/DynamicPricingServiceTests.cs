using System;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    public class DynamicPricingServiceTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static async Task<(AppDbContext db, Experience exp)> SeedExperienceAsync(
            decimal basePrice,
            SeasonType season,
            bool dynamicPricing = true,
            decimal weekendMul = 1.15m,
            decimal peakMul = 1.25m)
        {
            var db = NewDb();
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Ella", ProvinceState = "Uva", CurrentSeason = season };
            var cat = new Category { Id = Guid.NewGuid(), Name = "Hiking" };
            var user = new User { Id = Guid.NewGuid(), FullName = "Guide", Email = "g@g.com", PasswordHash = "x", PhoneNumber = "0771", Role = "LocalGuide", IsActive = true };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = user.Id, User = user, City = "Ella", Status = GuideStatus.Approved };
            var exp = new Experience
            {
                Id = Guid.NewGuid(), GuideId = guide.Id, DestinationId = dest.Id, Destination = dest, CategoryId = cat.Id, Category = cat,
                Title = "Ella Hike", BasePrice = basePrice, DurationHours = 3, MaxCapacity = 10,
                IsDynamicPricingEnabled = dynamicPricing, WeekendMultiplier = weekendMul, PeakSeasonMultiplier = peakMul,
                Status = ExperienceStatus.Approved
            };

            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            db.Experiences.Add(exp);
            await db.SaveChangesAsync();

            return (db, exp);
        }

        [Fact]
        public async Task CalculatePrice_WeekdayRegularSeason_ReturnsStandardBasePrice()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.Regular);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 7)); // Wednesday

            Assert.Equal(100.00m, res.FinalPrice);
            Assert.False(res.IsWeekend);
        }

        [Fact]
        public async Task CalculatePrice_SaturdayRegularSeason_Applies15PercentWeekendMultiplier()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.Regular, weekendMul: 1.15m);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 10)); // Saturday

            Assert.Equal(115.00m, res.FinalPrice);
            Assert.True(res.IsWeekend);
        }

        [Fact]
        public async Task CalculatePrice_WeekdayPeakSeason_Applies25PercentPeakMultiplier()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.Peak, peakMul: 1.25m);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 7)); // Wednesday

            Assert.Equal(125.00m, res.FinalPrice);
        }

        [Fact]
        public async Task CalculatePrice_WeekdayOffPeakSeason_Applies10PercentDiscount()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.OffPeak);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 7)); // Wednesday

            Assert.Equal(90.00m, res.FinalPrice);
        }

        [Fact]
        public async Task CalculatePrice_SundayPeakSeason_CompoundsWeekendAndPeak()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.Peak, weekendMul: 1.15m, peakMul: 1.25m);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 11)); // Sunday

            Assert.Equal(143.75m, res.FinalPrice);
        }

        [Fact]
        public async Task CalculatePrice_WhenDisabled_ReturnsBasePriceEvenOnPeakWeekend()
        {
            var (db, exp) = await SeedExperienceAsync(100m, SeasonType.Peak, dynamicPricing: false);
            var service = new ExperienceService(db);

            var res = await service.CalculatePriceAsync(exp.Id, new DateTime(2026, 10, 10)); // Saturday

            Assert.Equal(100.00m, res.FinalPrice);
        }
    }
}