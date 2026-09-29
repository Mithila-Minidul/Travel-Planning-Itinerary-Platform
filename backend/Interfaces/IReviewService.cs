using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewResponseDto> CreateAsync(Guid travelerId, ReviewCreateDto dto);
        Task<ReviewResponseDto> UpdateAsync(Guid reviewId, Guid userId, string role, ReviewUpdateDto dto);
        Task DeleteAsync(Guid reviewId, Guid userId, string role);
        Task<ReviewResponseDto> ReplyAsync(Guid reviewId, Guid userId, string role, string reply);
        Task DeleteReplyAsync(Guid reviewId, Guid userId, string role);
        Task<IEnumerable<ReviewResponseDto>> GetForExperienceAsync(Guid experienceId);
        Task<IEnumerable<ReviewResponseDto>> GetForGuideAsync(Guid guideUserId);
        Task<IEnumerable<ReviewResponseDto>> GetAllAsync();
    }
}