using System;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());
            if (emailExists)
            {
                throw new InvalidOperationException("Email address is already registered.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role,
                IsActive = true
            };

            _context.Users.Add(user);

            Guid? guideId = null;

            if (request.Role == UserRole.LocalGuide)
            {
                var localGuide = new LocalGuide
                {
                    UserId = user.Id,
                    Bio = request.GuideBio ?? "Experienced local travel guide.",
                    City = request.GuideCity ?? "Sri Lanka",
                    LicenseNumber = request.LicenseNumber,
                    YearsOfExperience = request.YearsOfExperience,
                    Status = GuideStatus.Pending
                };

                _context.LocalGuides.Add(localGuide);
                guideId = localGuide.Id;
            }

            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateJwtToken(user, guideId);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                User = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role.ToString(),
                    GuideId = guideId,
                    GuideStatus = request.Role == UserRole.LocalGuide ? GuideStatus.Pending.ToString() : null
                }
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .Include(u => u.LocalGuideProfile)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Your account has been deactivated. Please contact support.");
            }

            Guid? guideId = user.LocalGuideProfile?.Id;
            var token = _tokenService.GenerateJwtToken(user, guideId);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                User = new UserProfileDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role.ToString(),
                    GuideId = guideId,
                    GuideStatus = user.LocalGuideProfile?.Status.ToString()
                }
            };
        }

        public async Task<UserProfileDto> GetCurrentUserAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.LocalGuideProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                GuideId = user.LocalGuideProfile?.Id,
                GuideStatus = user.LocalGuideProfile?.Status.ToString()
            };
        }
    }
}