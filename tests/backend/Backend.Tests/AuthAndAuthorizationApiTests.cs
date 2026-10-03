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
        private readonly string _dbName = "InMemoryApiTestDb_" + Guid.NewGuid().ToString();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        }

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
            }

            if (!db.Users.Any(u => u.Email == "admin@example.com"))
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    FullName = "System Admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPass123!"),
                    PhoneNumber = "0779999999",
                    Role = "Admin",
                    IsActive = true,
                    Status = "Active"
                });
            }

            if (!db.Users.Any(u => u.Email == "pendingguide@example.com"))
            {
                var guideUser = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = "Pending Guide",
                    Email = "pendingguide@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    PhoneNumber = "0773333333",
                    Role = "LocalGuide",
                    IsActive = false,
                    Status = "Pending"
                };
                db.Users.Add(guideUser);
            }

            db.SaveChanges();
        }
    }

    public class AuthAndAuthorizationApiTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthAndAuthorizationApiTests(CustomWebApplicationFactory factory)
        {
            factory.SeedDatabase();
            _client = factory.CreateClient();
        }

        // ============================================================
        // 1. LOGIN STATUS CODES & IDENTITY GATES
        // ============================================================

        [Fact]
        public async Task Login_WithValidCredentials_Returns200AndJwtToken()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "traveler@example.com",
                Password = "Password123!"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            Assert.NotNull(result);
            Assert.False(string.IsNullOrEmpty(result!.Token));
            Assert.Equal("Traveler", result.User.Role);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_Returns401Unauthorized()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "traveler@example.com",
                Password = "WrongPassword!"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithNonExistentEmail_Returns401Unauthorized()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "doesnotexist@example.com",
                Password = "Password123!"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithInactivePendingAccount_Returns401Unauthorized()
        {
            var loginDto = new LoginRequestDto
            {
                Email = "pendingguide@example.com",
                Password = "Password123!"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithEmptyPayload_Returns400BadRequest()
        {
            var response = await _client.PostAsJsonAsync("/api/auth/login", new { });
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        // ============================================================
        // 2. PROTECTED ENDPOINTS & TOKEN AUTHENTICATION
        // ============================================================

        [Fact]
        public async Task ProtectedEndpoint_WithoutToken_Returns401Unauthorized()
        {
            var response = await _client.GetAsync("/api/auth/me");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ProtectedEndpoint_WithGarbageToken_Returns401Unauthorized()
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "invalid.garbage.token_string");
            var response = await _client.GetAsync("/api/auth/me");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ProtectedEndpoint_WithValidToken_Returns200OK()
        {
            var token = await GetTokenForRoleAsync("traveler@example.com", "Password123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/auth/me");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var profile = await response.Content.ReadFromJsonAsync<UserProfileDto>();
            Assert.NotNull(profile);
            Assert.Equal("traveler@example.com", profile!.Email);
        }

        // ============================================================
        // 3. ROLE-BASED ACCESS CONTROL (RBAC)
        // ============================================================

        [Fact]
        public async Task AdminEndpoint_WithTravelerToken_Returns403Forbidden()
        {
            var token = await GetTokenForRoleAsync("traveler@example.com", "Password123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/adminusers/recent-activity");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task AdminEndpoint_WithAdminToken_Returns200OK()
        {
            var token = await GetTokenForRoleAsync("admin@example.com", "AdminPass123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/adminusers/recent-activity");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GuideOnlyEndpoint_WithTravelerToken_Returns403Forbidden()
        {
            var token = await GetTokenForRoleAsync("traveler@example.com", "Password123!");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync("/api/experiences/mine");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        // ============================================================
        // 4. REGISTRATION SECURITY GATES
        // ============================================================

        [Fact]
        public async Task Register_WithDuplicateEmail_Returns400BadRequest()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Duplicate User",
                Email = "traveler@example.com", // Already seeded
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "Traveler"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_AttackerRequestsAdminRole_Returns400BadRequest()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Attacker Admin",
                Email = "eviladmin@test.com",
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "Admin"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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