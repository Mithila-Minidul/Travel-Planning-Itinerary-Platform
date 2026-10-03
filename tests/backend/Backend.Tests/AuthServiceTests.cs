using System;
using System.Collections.Generic;
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
    public class AuthServiceTests
    {
        private static AppDbContext NewInMemoryDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static ITokenService FakeTokenService()
        {
            var mock = new Mock<ITokenService>();
            mock.Setup(t => t.GenerateJwtToken(It.IsAny<User>(), It.IsAny<Guid?>())).Returns("fake-jwt-token");
            return mock.Object;
        }

        private static RegisterRequestDto SampleDto(string role = "Traveler", string email = "test@user.com") => new RegisterRequestDto
        {
            FullName = "Sample User",
            Email = email,
            Password = "Password123!",
            PhoneNumber = "0771234567",
            Role = role
        };

        [Fact]
        public async Task RegisterAsync_NewTraveler_ReturnsTokenAndActiveStatus()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var res = await service.RegisterAsync(SampleDto());

            Assert.Equal("fake-jwt-token", res.Token);
            Assert.Equal("Traveler", res.User.Role);
            Assert.True(res.User.IsActive);
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmailCaseInsensitive_ThrowsInvalidOperation()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await service.RegisterAsync(SampleDto("Traveler", "user@test.com"));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.RegisterAsync(SampleDto("Traveler", "USER@test.com")));
        }

        [Fact]
        public async Task RegisterAsync_AdminRoleAttempt_ThrowsInvalidOperation()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.RegisterAsync(SampleDto("Admin", "admin@hack.com")));
        }

        [Fact]
        public async Task RegisterAsync_LocalGuide_CreatesPendingGuideRecord()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            var dto = SampleDto("LocalGuide", "guide@test.com");
            dto.GuideBio = "Certified Bio";
            dto.GuideCity = "Kandy";
            dto.LicenseNumber = "LG-100";
            dto.YearsOfExperience = 5;

            var res = await service.RegisterAsync(dto);

            Assert.False(res.User.IsActive);
            Assert.NotNull(res.User.GuideId);
            var guide = await db.LocalGuides.FirstOrDefaultAsync();
            Assert.NotNull(guide);
            Assert.Equal(GuideStatus.Pending, guide!.Status);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsToken()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            await service.RegisterAsync(SampleDto("Traveler", "login@test.com"));

            var res = await service.LoginAsync(new LoginRequestDto { Email = "login@test.com", Password = "Password123!" });
            Assert.Equal("fake-jwt-token", res.Token);
        }

        [Fact]
        public async Task LoginAsync_WrongPasswordOrNonExistent_ThrowsUnauthorized()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            await service.RegisterAsync(SampleDto("Traveler", "login@test.com"));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto { Email = "login@test.com", Password = "WrongPassword!" }));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto { Email = "ghost@test.com", Password = "Password123!" }));
        }

        [Fact]
        public async Task LoginAsync_PendingLocalGuideOrAgent_ThrowsPendingMessage()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            var dto = SampleDto("LocalGuide", "guide@pending.com");
            dto.GuideBio = "Bio";
            dto.GuideCity = "Ella";
            dto.LicenseNumber = "LG-200";
            await service.RegisterAsync(dto);

            var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto { Email = "guide@pending.com", Password = "Password123!" }));

            Assert.Contains("pending Administrator approval", ex.Message);
        }

        [Fact]
        public async Task GetCurrentUserAsync_ValidId_ReturnsProfile()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            var reg = await service.RegisterAsync(SampleDto("Traveler", "me@test.com"));

            var profile = await service.GetCurrentUserAsync(reg.User.Id);
            Assert.Equal("me@test.com", profile.Email);
        }

        [Fact]
        public async Task GetCurrentUserAsync_NonExistent_ThrowsKeyNotFound()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                service.GetCurrentUserAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task UpdateProfileAsync_ValidData_UpdatesUser()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            var reg = await service.RegisterAsync(SampleDto("Traveler", "update@test.com"));

            await service.UpdateProfileAsync(reg.User.Id, new UpdateProfileDto { FullName = "Updated Name", PhoneNumber = "0779999999" });

            var updated = await db.Users.FindAsync(reg.User.Id);
            Assert.Equal("Updated Name", updated!.FullName);
            Assert.Equal("0779999999", updated.PhoneNumber);
        }

        [Fact]
        public async Task ChangePasswordAsync_ValidOldPassword_UpdatesHash()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            var reg = await service.RegisterAsync(SampleDto("Traveler", "pass@test.com"));

            await service.ChangePasswordAsync(reg.User.Id, new ChangePasswordDto { OldPassword = "Password123!", NewPassword = "NewPassword123!" });

            var user = await db.Users.FindAsync(reg.User.Id);
            Assert.True(BCrypt.Net.BCrypt.Verify("NewPassword123!", user!.PasswordHash));
        }
    }
}