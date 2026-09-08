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
                throw new InvalidOperationException("This email address is already registered.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Admin is active by default. Local Guides & Travel Agents MUST be approved by Admin.
            bool startsActive = request.Role == UserRole.Admin;

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role,
                IsActive = startsActive
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
                    Status = GuideStatus.Pending // Starts as Pending
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
                    IsActive = user.IsActive,
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

            // 🛑 STRICT APPROVAL ENFORCEMENT:
            if (!user.IsActive && user.Role != UserRole.Admin)
            {
                if (user.Role == UserRole.LocalGuide)
                {
                    throw new UnauthorizedAccessException("Your Local Guide account is pending Administrator approval. You cannot log in until approved.");
                }
                else if (user.Role == UserRole.TravelAgent)
                {
                    throw new UnauthorizedAccessException("Your Travel Agent account is pending Administrator approval. You cannot log in until approved.");
                }
                else
                {
                    throw new UnauthorizedAccessException("Your account is currently inactive. Please contact the administrator.");
                }
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
                    IsActive = user.IsActive,
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
                IsActive = user.IsActive,
                GuideId = user.LocalGuideProfile?.Id,
                GuideStatus = user.LocalGuideProfile?.Status.ToString()
            };
        }
    }
}