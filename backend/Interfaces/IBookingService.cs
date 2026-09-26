using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateAsync(Guid travelerUserId, BookingCreateDto dto);
        Task<IEnumerable<BookingResponseDto>> GetForTravelerAsync(Guid travelerUserId);
        Task<IEnumerable<BookingResponseDto>> GetForGuideAsync(Guid guideUserId);
        Task<IEnumerable<BookingResponseDto>> GetAllAsync();
        Task<BookingResponseDto> GetByIdAsync(Guid id, Guid userId, string role);
        Task<BookingResponseDto> ConfirmAsync(Guid id, Guid guideUserId);
        Task<BookingResponseDto> RejectAsync(Guid id, Guid guideUserId, string? reason);
        Task<BookingResponseDto> CancelAsync(Guid id, Guid userId, string role, string? reason);
        Task<BookingResponseDto> CheckInAsync(Guid id, string confirmationCode);
        Task<BookingResponseDto> CheckInByCodeAsync(string confirmationCode);
    }
}