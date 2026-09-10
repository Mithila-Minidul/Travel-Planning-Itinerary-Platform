using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponseDto>> GetAllAsync();
        Task<CategoryResponseDto> CreateAsync(CategoryCreateDto dto);
    }

    public interface IDestinationService
    {
        Task<IEnumerable<DestinationResponseDto>> GetAllAsync();
        Task<DestinationResponseDto> GetByIdAsync(Guid id);
        Task<DestinationResponseDto> CreateAsync(DestinationCreateDto dto);
        Task DeleteAsync(Guid id);
        Task<WeatherResponseDto> GetDestinationWeatherAsync(Guid destinationId);
    }

    public interface ILocalGuideService
    {
        Task<IEnumerable<LocalGuideResponseDto>> GetAllGuidesAsync(GuideStatus? status = null);
        Task<LocalGuideResponseDto> GetGuideByIdAsync(Guid id);
        Task<LocalGuideResponseDto> UpdateGuideStatusAsync(Guid id, GuideStatus status);
    }

    public interface IExperienceService
    {
        Task<IEnumerable<ExperienceResponseDto>> GetAllApprovedAsync(Guid? destinationId = null, Guid? categoryId = null);
        Task<IEnumerable<ExperienceResponseDto>> GetByGuideAsync(Guid guideId);
        Task<IEnumerable<ExperienceResponseDto>> GetPendingApprovalAsync();
        Task<IEnumerable<ExperienceResponseDto>> GetForAdminAsync();
        Task<ExperienceResponseDto> GetByIdAsync(Guid id, DateTime? targetDate = null);
        Task<ExperienceResponseDto> CreateAsync(Guid guideId, ExperienceCreateDto dto);
        Task<ExperienceResponseDto> UpdateAsync(Guid guideId, Guid id, ExperienceCreateDto dto);
        Task<ExperienceResponseDto> UpdateByAdminAsync(Guid id, ExperienceCreateDto dto);
        Task DeleteByAdminAsync(Guid id);
        Task<ExperienceResponseDto> UpdateStatusAsync(Guid id, ExperienceStatus status);
        Task<DynamicPriceCalculationDto> CalculatePriceAsync(Guid experienceId, DateTime targetDate);
        Task<IEnumerable<ExperienceResponseDto>> SearchForResearchAgentAsync(AgentExperienceSearchQueryDto query);
    }
}