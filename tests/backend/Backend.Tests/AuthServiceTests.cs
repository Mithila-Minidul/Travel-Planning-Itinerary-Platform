using System;
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
    /// <summary>
    /// Member 1 – Backend/API & Database Testing.
    /// Service-layer tests for AuthService using EF Core InMemory (no real DB).
    /// </summary>
    public class AuthServiceTests
    {
        // Fresh isolated in-memory DB for each test
        private static AppDbContext NewInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private static ITokenService FakeTokenService()
        {
            var mock = new Mock<ITokenService>();
            mock.Setup(t => t.GenerateJwtToken(It.IsAny<User>(), It.IsAny<Guid?>()))
                .Returns("fake-jwt-token");
            return mock.Object;
        }

        private static RegisterRequestDto TravelerDto(string email = "traveler@test.com")
            => new RegisterRequestDto
            {
                FullName = "Test Traveler",
                Email = email,
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "Traveler"
            };

        // ---------- Register ----------

        [Fact]
        public async Task RegisterAsync_NewTraveler_ReturnsTokenAndActiveUser()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var result = await service.RegisterAsync(TravelerDto());

            Assert.Equal("fake-jwt-token", result.Token);
            Assert.Equal("Traveler", result.User.Role);
            Assert.True(result.User.IsActive);
        }

        [Fact]
        public async Task RegisterAsync_NewTraveler_PersistsHashedPassword()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await service.RegisterAsync(TravelerDto("new@test.com"));

            var stored = await db.Users.FirstOrDefaultAsync(u => u.Email == "new@test.com");
            Assert.NotNull(stored);
            Assert.True(BCrypt.Net.BCrypt.Verify("Passw0rd!", stored!.PasswordHash));
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ThrowsInvalidOperation()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await service.RegisterAsync(TravelerDto("dup@test.com"));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.RegisterAsync(TravelerDto("DUP@test.com")));
        }

        [Fact]
        public async Task RegisterAsync_AdminRole_ThrowsInvalidOperation()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var dto = TravelerDto("admin-try@test.com");
            dto.Role = "Admin";

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.RegisterAsync(dto));
        }

        [Fact]
        public async Task RegisterAsync_LocalGuide_CreatesPendingGuideProfile()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var dto = TravelerDto("guide@test.com");
            dto.Role = "LocalGuide";
            dto.GuideBio = "Experienced guide";
            dto.GuideCity = "Ella";
            dto.LicenseNumber = "LG-001";
            dto.YearsOfExperience = 5;

            var result = await service.RegisterAsync(dto);

            Assert.False(result.User.IsActive);
            Assert.NotNull(result.User.GuideId);

            var guide = await db.LocalGuides.FirstOrDefaultAsync();
            Assert.NotNull(guide);
            Assert.Equal(GuideStatus.Pending, guide!.Status);
        }

        // ---------- Login ----------

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsToken()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            await service.RegisterAsync(TravelerDto("login@test.com"));

            var result = await service.LoginAsync(new LoginRequestDto
            {
                Email = "login@test.com",
                Password = "Passw0rd!"
            });

            Assert.Equal("fake-jwt-token", result.Token);
        }

        [Fact]
        public async Task LoginAsync_WrongPassword_ThrowsUnauthorized()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());
            await service.RegisterAsync(TravelerDto("wrong@test.com"));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto
                {
                    Email = "wrong@test.com",
                    Password = "WrongPass!"
                }));
        }

        [Fact]
        public async Task LoginAsync_NonexistentUser_ThrowsUnauthorized()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto
                {
                    Email = "ghost@test.com",
                    Password = "Passw0rd!"
                }));
        }

        [Fact]
        public async Task LoginAsync_InactiveLocalGuide_ThrowsPendingMessage()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var dto = TravelerDto("pending-guide@test.com");
            dto.Role = "LocalGuide";
            dto.GuideBio = "Bio";
            dto.GuideCity = "Kandy";
            dto.LicenseNumber = "LG-002";
            dto.YearsOfExperience = 3;

            await service.RegisterAsync(dto);

            var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto
                {
                    Email = "pending-guide@test.com",
                    Password = "Passw0rd!"
                }));

            Assert.Contains("pending", ex.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task LoginAsync_InactiveTravelAgent_ThrowsPendingMessage()
        {
            using var db = NewInMemoryDb();
            var service = new AuthService(db, FakeTokenService());

            var dto = TravelerDto("pending-agent@test.com");
            dto.Role = "TravelAgent";
            dto.AgencyName = "Travel Co";
            dto.AgentLicenseNumber = "TA-001";

            await service.RegisterAsync(dto);

            var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.LoginAsync(new LoginRequestDto
                {
                    Email = "pending-agent@test.com",
                    Password = "Passw0rd!"
                }));

            Assert.Contains("pending", ex.Message, StringComparison.OrdinalIgnoreCase);
        }
    }
}