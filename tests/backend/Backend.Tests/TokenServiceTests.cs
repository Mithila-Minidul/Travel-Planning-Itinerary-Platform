using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Backend.Models;
using Backend.Services;
using Xunit;

namespace Backend.Tests
{
    public class TokenServiceTests
    {
        private static User SampleUser(string role = "Traveler") => new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Traveler",
            Email = "traveler@example.com",
            Role = role,
            IsActive = true
        };

        [Fact]
        public void GenerateJwtToken_ReturnsValidThreeSegmentJwt()
        {
            var service = new TokenService();
            var token = service.GenerateJwtToken(SampleUser());

            Assert.False(string.IsNullOrWhiteSpace(token));
            Assert.Equal(3, token.Split('.').Length);
        }

        [Fact]
        public void GenerateJwtToken_ContainsStandardAndRoleClaims()
        {
            var service = new TokenService();
            var user = SampleUser("TravelAgent");

            var token = service.GenerateJwtToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Equal(user.Id.ToString(), jwt.Claims.First(c => c.Type == "nameid").Value);
            Assert.Equal(user.Email, jwt.Claims.First(c => c.Type == "email").Value);
            Assert.Equal(user.FullName, jwt.Claims.First(c => c.Type == "unique_name").Value);
            Assert.Equal("TravelAgent", jwt.Claims.First(c => c.Type == "role").Value);
        }

        [Fact]
        public void GenerateJwtToken_WhenGuideIdProvided_IncludesGuideIdClaim()
        {
            var service = new TokenService();
            var user = SampleUser("LocalGuide");
            var guideId = Guid.NewGuid();

            var token = service.GenerateJwtToken(user, guideId);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Equal(guideId.ToString(), jwt.Claims.First(c => c.Type == "GuideId").Value);
        }

        [Fact]
        public void GenerateJwtToken_WhenGuideIdNull_ExcludesGuideIdClaim()
        {
            var service = new TokenService();
            var user = SampleUser("Traveler");

            var token = service.GenerateJwtToken(user, null);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.DoesNotContain(jwt.Claims, c => c.Type == "GuideId");
        }

        [Fact]
        public void GenerateJwtToken_SetsExpirationInFuture()
        {
            var service = new TokenService();
            var token = service.GenerateJwtToken(SampleUser());
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.True(jwt.ValidTo > DateTime.UtcNow);
        }

        [Fact]
        public void GenerateJwtToken_ConsecutiveCalls_ProduceUniqueJtiTokens()
        {
            var service = new TokenService();
            var user = SampleUser();

            var token1 = service.GenerateJwtToken(user);
            var token2 = service.GenerateJwtToken(user);

            Assert.NotEqual(token1, token2);
        }
    }
}