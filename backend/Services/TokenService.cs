using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services
{
    public class TokenService : ITokenService
    {
        public string GenerateJwtToken(User user, Guid? guideId = null)
        {
            var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? "SuperSecretKeyForSE3090Assignment2026MustBeAtLeast32CharsLong!";
            var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "TravelAppBackend";
            var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "TravelAppClients";
            var expiryHoursStr = Environment.GetEnvironmentVariable("JWT_EXPIRY_HOURS") ?? "24";
            var expiryHours = Convert.ToDouble(expiryHoursStr);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            if (guideId.HasValue)
            {
                claims.Add(new Claim("GuideId", guideId.Value.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(expiryHours),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}