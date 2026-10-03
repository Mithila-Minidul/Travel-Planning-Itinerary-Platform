using System;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Backend.Tests.Api
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        // 1. Unique database name per factory instance
        private readonly string _dbName = "InMemoryTestDb_" + Guid.NewGuid().ToString();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove real PostgreSQL DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add In-Memory Database using fixed DB name
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        }

        // 2. Seed data on the main server container
        public void SeedDatabase()
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Database.EnsureCreated();

            if (!db.Users.Any(u => u.Email == "traveler@example.com"))
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    FullName = "Test Traveler",
                    Email = "traveler@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    PhoneNumber = "0771234567",
                    Role = "Traveler",
                    IsActive = true,
                    Status = "Active"
                });
                db.SaveChanges();
            }
        }
    }

    public class AuthAndAuthorizationApiTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthAndAuthorizationApiTests(CustomWebApplicationFactory factory)
        {
            // Seed database using the active factory container
            factory.SeedDatabase();
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Login_WithValidCredentials_Returns200AndJwtToken()
        {
            // Arrange
            var loginDto = new LoginRequestDto
            {
                Email = "traveler@example.com",
                Password = "Password123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result!.Token));
        }

        [Fact]
        public async Task Login_WithInvalidPassword_Returns401Unauthorized()
        {
            // Arrange
            var loginDto = new LoginRequestDto
            {
                Email = "traveler@example.com",
                Password = "WrongPassword!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ProtectedEndpoint_WithoutToken_Returns401Unauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/auth/me");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task AdminEndpoint_WithTravelerToken_Returns403Forbidden()
        {
            // Arrange
            var token = await GetTokenForRoleAsync("traveler@example.com", "Password123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/adminusers/recent-activity");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task ProtectedEndpoint_WithValidToken_Returns200OK()
        {
            // Arrange
            var token = await GetTokenForRoleAsync("traveler@example.com", "Password123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/auth/me");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        private async Task<string> GetTokenForRoleAsync(string email, string password)
        {
            var loginDto = new LoginRequestDto { Email = email, Password = password };
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            return result!.Token;
        }
    }
}