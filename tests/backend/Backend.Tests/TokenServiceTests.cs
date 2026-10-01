using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Backend.Models;
using Backend.Services;
using Xunit;

namespace Backend.Tests
{
    /// <summary>
    /// Member 1 – Backend/API & Database Testing.
    /// Unit tests for TokenService (JWT generation).
    /// </summary>
    public class TokenServiceTests
    {
        private static User SampleUser(string role = "Traveler")
        {
            return new User
            {
                Id = Guid.NewGuid(),
                FullName = "Test User",
                Email = "test@example.com",
                Role = role,
                IsActive = true
            };
        }

        [Fact]
        public void GenerateJwtToken_ReturnsNonEmptyString()
        {
            var service = new TokenService();
            var user = SampleUser();

            var token = service.GenerateJwtToken(user);

            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public void GenerateJwtToken_ProducesValidJwtFormat()
        {
            var service = new TokenService();
            var user = SampleUser();

            var token = service.GenerateJwtToken(user);

            // A JWT must have exactly 3 dot-separated segments: header.payload.signature
            var segments = token.Split('.');
            Assert.Equal(3, segments.Length);
        }

                [Fact]
        public void GenerateJwtToken_ContainsExpectedClaims()
        {
            var service = new TokenService();
            var user = SampleUser("Traveler");

            var token = service.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            // JwtSecurityTokenHandler writes .NET claim URIs as short JWT names.
            // ReadJwtToken does NOT map them back, so we check the short names.
            Assert.Equal(user.Id.ToString(),
                jwt.Claims.First(c => c.Type == "nameid").Value);
            Assert.Equal(user.Email,
                jwt.Claims.First(c => c.Type == "email").Value);
            Assert.Equal(user.FullName,
                jwt.Claims.First(c => c.Type == "unique_name").Value);
            Assert.Equal("Traveler",
                jwt.Claims.First(c => c.Type == "role").Value);
        }

        [Fact]
        public void GenerateJwtToken_WhenGuideIdIsNull_DoesNotIncludeGuideIdClaim()
        {
            var service = new TokenService();
            var user = SampleUser("LocalGuide");

            var token = service.GenerateJwtToken(user, guideId: null);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.DoesNotContain(jwt.Claims, c => c.Type == "GuideId");
        }

        [Fact]
        public void GenerateJwtToken_WhenGuideIdProvided_IncludesGuideIdClaim()
        {
            var service = new TokenService();
            var user = SampleUser("LocalGuide");
            var guideId = Guid.NewGuid();

            var token = service.GenerateJwtToken(user, guideId);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            var claim = jwt.Claims.First(c => c.Type == "GuideId");
            Assert.Equal(guideId.ToString(), claim.Value);
        }

        [Fact]
        public void GenerateJwtToken_SetsExpiryInFuture()
        {
            var service = new TokenService();
            var user = SampleUser();

            var token = service.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.True(jwt.ValidTo > DateTime.UtcNow);
        }

        [Fact]
        public void GenerateJwtToken_TwoCalls_ProduceDifferentTokens()
        {
            var service = new TokenService();
            var user = SampleUser();

            var token1 = service.GenerateJwtToken(user);
            var token2 = service.GenerateJwtToken(user);

            // Jti (unique token ID) must make them different
            Assert.NotEqual(token1, token2);
        }
    }
}