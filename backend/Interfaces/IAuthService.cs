using System;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<UserProfileDto> GetCurrentUserAsync(Guid userId);
        Task<object> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
        Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    }
}