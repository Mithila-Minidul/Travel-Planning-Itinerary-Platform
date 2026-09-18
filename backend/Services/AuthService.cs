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
            // 1. Check if email exists
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

            if (emailExists)
            {
                throw new InvalidOperationException("This email address is already registered.");
            }

            // 2. ✅ FIXED: string comparison
            /*if (request.Role == "Traveler")
            {
                throw new InvalidOperationException("Traveler accounts must be created via the mobile app.");
            }*/

            // 3. ✅ FIXED: string comparison
            if (request.Role == "Admin")
            {
                throw new InvalidOperationException("Admin accounts cannot be created via registration.");
            }

            // 4. Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 5. Create User
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber.Trim(),
                ProfileImageUrl = request.ProfileImageUrl,
                Role = request.Role,  // ✅ Already string
                IsActive = request.Role == "Traveler",  // ✅ Travelers auto-active
                AgencyName = request.Role == "TravelAgent" ? request.AgencyName.Trim() : null,
                AgentLicenseNumber = request.Role == "TravelAgent" ? request.AgentLicenseNumber.Trim() : null
            };

            _context.Users.Add(user);

            Guid? guideId = null;

            // 6. ✅ FIXED: string comparison
            if (request.Role == "LocalGuide")
            {
                var localGuide = new LocalGuide
                {
                    User = user,
                    Bio = request.GuideBio.Trim(),
                    City = request.GuideCity.Trim(),
                    LicenseNumber = request.LicenseNumber,
                    YearsOfExperience = request.YearsOfExperience,
                    Status = GuideStatus.Pending
                };

                _context.LocalGuides.Add(localGuide);
                guideId = localGuide.Id;
            }

            // 7. ✅ FIXED: string comparison
            if (request.Role == "TravelAgent")
            {
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
                    ProfileImageUrl = user.ProfileImageUrl,
                    AgencyName = user.AgencyName,
                    AgentLicenseNumber = user.AgentLicenseNumber,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    GuideId = guideId,
                    GuideStatus = request.Role == "LocalGuide" ? GuideStatus.Pending.ToString() : null
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

            if (!user.IsActive && user.Role != "Admin")
            {
                if (user.Role == "LocalGuide")
                {
                    throw new UnauthorizedAccessException(
                        "Your Local Guide account is pending Administrator approval. You cannot log in until approved.");
                }
                else if (user.Role == "TravelAgent")
                {
                    throw new UnauthorizedAccessException(
                        "Your Travel Agent account is pending Administrator approval. You cannot log in until approved.");
                }
                else
                {
                    throw new UnauthorizedAccessException(
                        "Your account is currently inactive. Please contact the administrator.");
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
                    ProfileImageUrl = user.ProfileImageUrl,
                    AgencyName = user.AgencyName,
                    AgentLicenseNumber = user.AgentLicenseNumber,
                    Role = user.Role,
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
                ProfileImageUrl = user.ProfileImageUrl,
                AgencyName = user.AgencyName,
                AgentLicenseNumber = user.AgentLicenseNumber,
                Role = user.Role,
                IsActive = user.IsActive,
                GuideId = user.LocalGuideProfile?.Id,
                GuideStatus = user.LocalGuideProfile?.Status.ToString()
            };
        }
    }
}