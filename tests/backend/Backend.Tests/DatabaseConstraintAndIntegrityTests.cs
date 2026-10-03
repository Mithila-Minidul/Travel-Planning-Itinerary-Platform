using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests
{
    public class DatabaseConstraintAndIntegrityTests
    {
        private static AppDbContext CreateIsolatedContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "DbIntegrity_" + Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public void UserEntity_EmailIndex_IsConfiguredAsUnique()
        {
            using var db = CreateIsolatedContext();
            var emailIndex = db.Model.FindEntityType(typeof(User))
                ?.GetIndexes()
                .FirstOrDefault(i => i.Properties.Any(p => p.Name == "Email"));

            Assert.NotNull(emailIndex);
            Assert.True(emailIndex!.IsUnique);
        }

        [Fact]
        public void BookingEntity_ConfirmationCode_IsConfiguredAsUnique()
        {
            using var db = CreateIsolatedContext();
            var codeIndex = db.Model.FindEntityType(typeof(Booking))
                ?.GetIndexes()
                .FirstOrDefault(i => i.Properties.Any(p => p.Name == "ConfirmationCode"));

            Assert.NotNull(codeIndex);
            Assert.True(codeIndex!.IsUnique);
        }

        [Fact]
        public async Task Experience_MaintainsFullRelationalIntegrity_WithGuideDestinationAndCategory()
        {
            using var db = CreateIsolatedContext();

            var dest = new Destination
            {
                Id = Guid.NewGuid(), Name = "Galle", ProvinceState = "Southern",
                Country = "Sri Lanka", Description = "Historic fort city"
            };

            var cat = new Category
            {
                Id = Guid.NewGuid(), Name = "Historical",
                Description = "Heritage tours", IconName = "temple"
            };

            var user = new User
            {
                Id = Guid.NewGuid(), FullName = "Galle Guide", Email = "galle.guide@test.com",
                PasswordHash = "hash", PhoneNumber = "+94772222222", Role = "LocalGuide", IsActive = true
            };

            var guide = new LocalGuide
            {
                Id = Guid.NewGuid(), UserId = user.Id, User = user,
                Bio = "Galle local", City = "Galle", Status = GuideStatus.Approved
            };

            var exp = new Experience
            {
                Id = Guid.NewGuid(), GuideId = guide.Id, DestinationId = dest.Id, CategoryId = cat.Id,
                Title = "Galle Fort Walking Tour", Description = "Explore the Dutch ramparts.",
                BasePrice = 45m, DurationHours = 3, MaxCapacity = 12, Status = ExperienceStatus.Approved
            };

            db.Destinations.Add(dest);
            db.Categories.Add(cat);
            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            db.Experiences.Add(exp);
            await db.SaveChangesAsync();

            var loadedExp = await db.Experiences
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .FirstOrDefaultAsync(e => e.Id == exp.Id);

            Assert.NotNull(loadedExp);
            Assert.Equal("Galle", loadedExp!.Destination.Name);
            Assert.Equal("Historical", loadedExp.Category.Name);
            Assert.Equal("Galle Guide", loadedExp.Guide.User.FullName);
        }

        [Fact]
        public async Task UserDelete_CascadesTo_LocalGuideProfile()
        {
            using var db = CreateIsolatedContext();

            var user = new User
            {
                Id = Guid.NewGuid(), FullName = "Guide To Delete", Email = "guide.delete@test.com",
                PasswordHash = "hash", PhoneNumber = "+94773333333", Role = "LocalGuide", IsActive = true
            };

            var guide = new LocalGuide
            {
                Id = Guid.NewGuid(), UserId = user.Id, User = user,
                Bio = "Temporary Guide", City = "Colombo", Status = GuideStatus.Pending
            };

            db.Users.Add(user);
            db.LocalGuides.Add(guide);
            await db.SaveChangesAsync();

            db.Users.Remove(user);
            await db.SaveChangesAsync();

            var deletedGuide = await db.LocalGuides.FirstOrDefaultAsync(g => g.Id == guide.Id);
            Assert.Null(deletedGuide);
        }

        [Fact]
        public void CategoryExperience_Relationship_IsConfiguredWithDeleteBehaviorRestrict()
        {
            using var db = CreateIsolatedContext();
            var foreignKey = db.Model.FindEntityType(typeof(Experience))
                ?.GetForeignKeys()
                .FirstOrDefault(fk => fk.PrincipalEntityType.ClrType == typeof(Category));

            Assert.NotNull(foreignKey);
            Assert.Equal(DeleteBehavior.Restrict, foreignKey!.DeleteBehavior);
        }

        [Fact]
        public async Task SaveChangesAsync_AutomaticallyUpdates_UpdatedAtTimestamp()
        {
            using var db = CreateIsolatedContext();

            var dest = new Destination
            {
                Name = "Sigiriya", ProvinceState = "Central", Country = "Sri Lanka",
                Description = "Ancient rock fortress"
            };

            db.Destinations.Add(dest);
            await db.SaveChangesAsync();

            var initialUpdatedAt = dest.UpdatedAt;
            await Task.Delay(20);

            dest.Description = "World heritage ancient rock fortress.";
            await db.SaveChangesAsync();

            var updatedDest = await db.Destinations.FindAsync(dest.Id);
            Assert.NotNull(updatedDest);
            Assert.True(updatedDest!.UpdatedAt > initialUpdatedAt);
        }
    }
}