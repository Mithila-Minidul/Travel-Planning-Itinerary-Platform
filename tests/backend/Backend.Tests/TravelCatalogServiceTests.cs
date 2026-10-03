using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Backend.Tests
{
    public class TravelCatalogServiceTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        [Fact]
        public async Task CategoryService_CreateAndGetAll_ManagesActiveCategories()
        {
            using var db = NewDb();
            var service = new CategoryService(db);

            var created = await service.CreateAsync(new CategoryCreateDto { Name = "Tea Plantation", Description = "Tea factory visits", IconName = "tea" });
            var list = await service.GetAllAsync();

            Assert.Contains(list, c => c.Id == created.Id);
        }

        [Fact]
        public async Task DestinationService_CreateGetByIdAndSoftDelete_WorksCorrectly()
        {
            using var db = NewDb();
            var weatherMock = new Mock<IWeatherService>();
            var service = new DestinationService(db, weatherMock.Object);

            var created = await service.CreateAsync(new DestinationCreateDto
            {
                Name = "Nuwara Eliya",
                ProvinceState = "Central",
                Country = "Sri Lanka",
                Description = "Cool climate hill station",
                Latitude = 6.9497,
                Longitude = 80.7891
            });

            var fetched = await service.GetByIdAsync(created.Id);
            Assert.Equal("Nuwara Eliya", fetched.Name);

            await service.DeleteAsync(created.Id);
            var all = await service.GetAllAsync();
            Assert.DoesNotContain(all, d => d.Id == created.Id);
        }

        [Fact]
        public async Task LocalGuideService_UpdateStatusToApproved_ActivatesGuideAndUser()
        {
            using var db = NewDb();
            var service = new LocalGuideService(db);

            var user = new User { Id = Guid.NewGuid(), FullName = "Guide", Email = "g@test.com", PasswordHash = "x", PhoneNumber = "0771234567", Role = "LocalGuide", IsActive = false };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = user.Id, User = user, City = "Kandy", Status = GuideStatus.Pending };
            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            await db.SaveChangesAsync();

            var updated = await service.UpdateGuideStatusAsync(guide.Id, GuideStatus.Approved);

            Assert.Equal("Approved", updated.Status);
            var updatedUser = await db.Users.FindAsync(user.Id);
            Assert.True(updatedUser!.IsActive);
        }

        [Fact]
        public async Task ExperienceService_UnapprovedGuide_ThrowsInvalidOperationOnCreate()
        {
            using var db = NewDb();
            var service = new ExperienceService(db);

            var user = new User { Id = Guid.NewGuid(), FullName = "Guide", Email = "g@test.com", PasswordHash = "x", PhoneNumber = "0771", Role = "LocalGuide", IsActive = false };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = user.Id, User = user, City = "Kandy", Status = GuideStatus.Pending };
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Kandy", ProvinceState = "Central" };
            var cat = new Category { Id = Guid.NewGuid(), Name = "Culture" };
            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            await db.SaveChangesAsync();

            var dto = new ExperienceCreateDto
            {
                DestinationId = dest.Id, CategoryId = cat.Id, Title = "Tour", Description = "Desc",
                BasePrice = 30, DurationHours = 3, MaxCapacity = 10,
                AvailableWeekdays = new List<string> { "Monday" }, StartTime = "08:00", EndTime = "11:00"
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateAsync(guide.Id, dto));
        }

        [Fact]
        public async Task ExperienceService_SearchForResearchAgent_FiltersByDestinationAndCategory()
        {
            using var db = NewDb();
            var service = new ExperienceService(db);

            var user = new User { Id = Guid.NewGuid(), FullName = "Approved Guide", Email = "ap@test.com", PasswordHash = "x", PhoneNumber = "0771", Role = "LocalGuide", IsActive = true };
            var guide = new LocalGuide { Id = Guid.NewGuid(), UserId = user.Id, User = user, City = "Ella", Status = GuideStatus.Approved };
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Ella", ProvinceState = "Uva" };
            var cat = new Category { Id = Guid.NewGuid(), Name = "Hiking" };
            var exp = new Experience { Id = Guid.NewGuid(), GuideId = guide.Id, DestinationId = dest.Id, CategoryId = cat.Id, Title = "Summit Hike", Description = "d", BasePrice = 40, DurationHours = 4, MaxCapacity = 10, Status = ExperienceStatus.Approved };

            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Experiences.Add(exp);
            await db.SaveChangesAsync();

            var searchRes = await service.SearchForResearchAgentAsync(new AgentExperienceSearchQueryDto { DestinationName = "Ella", CategoryName = "Hiking" });

            Assert.Single(searchRes);
            Assert.Equal("Summit Hike", searchRes.First().Title);
        }
    }
}