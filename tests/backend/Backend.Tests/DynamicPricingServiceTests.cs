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
        private static AppDbContext CreateIsolatedContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "PricingDb_" + Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private static async Task<(AppDbContext db, Experience exp)> SeedPricingExperienceAsync(
            decimal basePrice = 100m,
            SeasonType season = SeasonType.Regular,
            bool isDynamic = true,
            decimal weekendMultiplier = 1.15m,
            decimal peakMultiplier = 1.25m)
        {
            var db = CreateIsolatedContext();

            var dest = new Destination
            {
                Id = Guid.NewGuid(),
                Name = "Ella",
                ProvinceState = "Uva",
                Country = "Sri Lanka",
                Description = "Scenic mountain town",
                CurrentSeason = season
            };

            var cat = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Hiking",
                Description = "Mountain hiking",
                IconName = "hiking"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Guide",
                Email = $"{Guid.NewGuid()}@test.com",
                PasswordHash = "hash",
                PhoneNumber = "+94771234567",
                Role = "LocalGuide",
                IsActive = true
            };

            var guide = new LocalGuide
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                Bio = "Local guide",
                City = "Ella",
                Status = GuideStatus.Approved
            };

            var exp = new Experience
            {
                Id = Guid.NewGuid(),
                GuideId = guide.Id,
                DestinationId = dest.Id,
                Destination = dest,
                CategoryId = cat.Id,
                Category = cat,
                Title = "Ella Rock Hike",
                Description = "Hike to Ella Rock summit",
                BasePrice = basePrice,
                DurationHours = 4,
                MaxCapacity = 10,
                IsDynamicPricingEnabled = isDynamic,
                WeekendMultiplier = weekendMultiplier,
                PeakSeasonMultiplier = peakMultiplier,
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
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.Regular);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 7); // Wednesday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(100.00m, result.FinalPrice);
            Assert.False(result.IsWeekend);
            Assert.Equal(1.0m, result.WeekendMultiplierApplied);
            Assert.Equal(1.0m, result.SeasonMultiplierApplied);
        }

        [Fact]
        public async Task CalculatePrice_SaturdayRegularSeason_AppliesWeekendMultiplier()
        {
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.Regular, weekendMultiplier: 1.15m);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 10); // Saturday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(115.00m, result.FinalPrice);
            Assert.True(result.IsWeekend);
            Assert.Equal(1.15m, result.WeekendMultiplierApplied);
            Assert.Contains("Weekend demand rate applied", result.PriceExplanation);
        }

        [Fact]
        public async Task CalculatePrice_WeekdayPeakSeason_AppliesPeakSeasonMultiplier()
        {
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.Peak, peakMultiplier: 1.25m);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 7); // Wednesday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(125.00m, result.FinalPrice);
            Assert.False(result.IsWeekend);
            Assert.Equal(1.25m, result.SeasonMultiplierApplied);
            Assert.Contains("Peak travel season rate applied", result.PriceExplanation);
        }

        [Fact]
        public async Task CalculatePrice_WeekdayOffPeakSeason_AppliesOffPeakDiscount()
        {
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.OffPeak);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 7); // Wednesday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(90.00m, result.FinalPrice);
            Assert.Equal(0.90m, result.SeasonMultiplierApplied);
            Assert.Contains("Off-peak discount applied", result.PriceExplanation);
        }

        [Fact]
        public async Task CalculatePrice_SundayPeakSeason_CompoundsWeekendAndPeakMultipliers()
        {
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.Peak, weekendMultiplier: 1.15m, peakMultiplier: 1.25m);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 11); // Sunday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(143.75m, result.FinalPrice);
            Assert.True(result.IsWeekend);
            Assert.Equal(1.15m, result.WeekendMultiplierApplied);
            Assert.Equal(1.25m, result.SeasonMultiplierApplied);
        }

        [Fact]
        public async Task CalculatePrice_WhenDynamicPricingDisabled_ReturnsBasePriceEvenOnPeakWeekend()
        {
            var (db, exp) = await SeedPricingExperienceAsync(basePrice: 100m, season: SeasonType.Peak, isDynamic: false);
            var service = new ExperienceService(db);
            var targetDate = new DateTime(2026, 10, 10); // Saturday

            var result = await service.CalculatePriceAsync(exp.Id, targetDate);
            Assert.Equal(100.00m, result.FinalPrice);
            Assert.Equal("Standard base rate.", result.PriceExplanation);
        }
    }
}