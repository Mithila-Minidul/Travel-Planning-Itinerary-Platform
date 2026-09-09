using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    // ================= CATEGORY SERVICE =================
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        public CategoryService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .Select(c => new CategoryResponseDto 
                { 
                    Id = c.Id, 
                    Name = c.Name, 
                    Description = c.Description, 
                    IconName = c.IconName 
                })
                .ToListAsync();
        }

        public async Task<CategoryResponseDto> CreateAsync(CategoryCreateDto dto)
        {
            var category = new Category 
            { 
                Name = dto.Name, 
                Description = dto.Description, 
                IconName = dto.IconName 
            };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return new CategoryResponseDto 
            { 
                Id = category.Id, 
                Name = category.Name, 
                Description = category.Description, 
                IconName = category.IconName 
            };
        }
    }

    // ================= DESTINATION SERVICE =================
    public class DestinationService : IDestinationService
    {
        private readonly AppDbContext _context;
        private readonly IWeatherService _weatherService;

        public DestinationService(AppDbContext context, IWeatherService weatherService)
        {
            _context = context;
            _weatherService = weatherService;
        }

        public async Task<IEnumerable<DestinationResponseDto>> GetAllAsync()
        {
            return await _context.Destinations
                .Where(d => d.IsActive)
                .Select(d => new DestinationResponseDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    ProvinceState = d.ProvinceState,
                    Country = d.Country,
                    Description = d.Description,
                    ImageUrl = d.ImageUrl,
                    Latitude = d.Latitude,
                    Longitude = d.Longitude,
                    CurrentSeason = d.CurrentSeason.ToString(),
                    ActiveExperiencesCount = d.Experiences.Count(e => e.Status == ExperienceStatus.Approved)
                }).ToListAsync();
        }

        public async Task<DestinationResponseDto> GetByIdAsync(Guid id)
        {
            var d = await _context.Destinations.Include(x => x.Experiences).FirstOrDefaultAsync(x => x.Id == id);
            if (d == null) throw new KeyNotFoundException("Destination not found.");

            return new DestinationResponseDto
            {
                Id = d.Id,
                Name = d.Name,
                ProvinceState = d.ProvinceState,
                Country = d.Country,
                Description = d.Description,
                ImageUrl = d.ImageUrl,
                Latitude = d.Latitude,
                Longitude = d.Longitude,
                CurrentSeason = d.CurrentSeason.ToString(),
                ActiveExperiencesCount = d.Experiences.Count(e => e.Status == ExperienceStatus.Approved)
            };
        }

        public async Task<DestinationResponseDto> CreateAsync(DestinationCreateDto dto)
        {
            var dest = new Destination
            {
                Name = dto.Name,
                ProvinceState = dto.ProvinceState,
                Country = dto.Country,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CurrentSeason = dto.CurrentSeason
            };
            _context.Destinations.Add(dest);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(dest.Id);
        }

        public async Task<WeatherResponseDto> GetDestinationWeatherAsync(Guid destinationId)
        {
            var destination = await _context.Destinations.FindAsync(destinationId);
            if (destination == null) throw new KeyNotFoundException("Destination not found.");
            return await _weatherService.GetWeatherForDestinationAsync(destination);
        }
    }

    // ================= LOCAL GUIDE SERVICE =================
    public class LocalGuideService : ILocalGuideService
    {
        private readonly AppDbContext _context;
        public LocalGuideService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<LocalGuideResponseDto>> GetAllGuidesAsync(GuideStatus? status = null)
        {
            var query = _context.LocalGuides.Include(g => g.User).AsQueryable();
            if (status.HasValue) query = query.Where(g => g.Status == status.Value);

            return await query.Select(g => new LocalGuideResponseDto
            {
                Id = g.Id,
                UserId = g.UserId,
                FullName = g.User.FullName,
                Email = g.User.Email,
                PhoneNumber = g.User.PhoneNumber,
                Bio = g.Bio,
                City = g.City,
                LicenseNumber = g.LicenseNumber,
                YearsOfExperience = g.YearsOfExperience,
                Status = g.Status.ToString(),
                Rating = g.Rating,
                ReviewCount = g.ReviewCount
            }).ToListAsync();
        }

        public async Task<LocalGuideResponseDto> GetGuideByIdAsync(Guid id)
        {
            var g = await _context.LocalGuides.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
            if (g == null) throw new KeyNotFoundException("Guide not found.");

            return new LocalGuideResponseDto
            {
                Id = g.Id,
                UserId = g.UserId,
                FullName = g.User.FullName,
                Email = g.User.Email,
                PhoneNumber = g.User.PhoneNumber,
                Bio = g.Bio,
                City = g.City,
                LicenseNumber = g.LicenseNumber,
                YearsOfExperience = g.YearsOfExperience,
                Status = g.Status.ToString(),
                Rating = g.Rating,
                ReviewCount = g.ReviewCount
            };
        }

        public async Task<LocalGuideResponseDto> UpdateGuideStatusAsync(Guid id, GuideStatus status)
        {
            var g = await _context.LocalGuides.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
            if (g == null) throw new KeyNotFoundException("Guide not found.");

            g.Status = status;

            // Activate user account when approved, deactivate if rejected or suspended
            if (g.User != null)
            {
                g.User.IsActive = (status == GuideStatus.Approved);
            }

            await _context.SaveChangesAsync();
            return await GetGuideByIdAsync(id);
        }
    }

    // ================= EXPERIENCE SERVICE (DYNAMIC PRICING ENGINE) =================
    public class ExperienceService : IExperienceService
    {
        private readonly AppDbContext _context;

        public ExperienceService(AppDbContext context) => _context = context;

        public async Task<IEnumerable<ExperienceResponseDto>> GetAllApprovedAsync(Guid? destinationId = null, Guid? categoryId = null)
        {
            var query = _context.Experiences
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Where(e => e.Status == ExperienceStatus.Approved && e.IsActive);

            if (destinationId.HasValue) query = query.Where(e => e.DestinationId == destinationId.Value);
            if (categoryId.HasValue) query = query.Where(e => e.CategoryId == categoryId.Value);

            var list = await query.ToListAsync();
            return list.Select(e => MapToDto(e, DateTime.UtcNow));
        }

        public async Task<IEnumerable<ExperienceResponseDto>> GetByGuideAsync(Guid guideId)
        {
            var list = await _context.Experiences
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Where(e => e.GuideId == guideId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return list.Select(e => MapToDto(e, DateTime.UtcNow));
        }

        public async Task<IEnumerable<ExperienceResponseDto>> GetPendingApprovalAsync()
        {
            var list = await _context.Experiences
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Where(e => e.Status == ExperienceStatus.PendingApproval)
                .ToListAsync();

            return list.Select(e => MapToDto(e, DateTime.UtcNow));
        }

        public async Task<IEnumerable<ExperienceResponseDto>> GetForAdminAsync()
        {
            var list = await _context.Experiences
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Where(e => e.Status == ExperienceStatus.Approved ||
                            e.Status == ExperienceStatus.PendingApproval ||
                            e.Status == ExperienceStatus.Rejected)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return list.Select(e => MapToDto(e, DateTime.UtcNow));
        }

        public async Task<ExperienceResponseDto> GetByIdAsync(Guid id, DateTime? targetDate = null)
        {
            var e = await _context.Experiences
                .Include(x => x.Guide).ThenInclude(g => g.User)
                .Include(x => x.Destination)
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (e == null) throw new KeyNotFoundException("Experience not found.");
            return MapToDto(e, targetDate ?? DateTime.UtcNow);
        }

        public async Task<ExperienceResponseDto> CreateAsync(Guid guideId, ExperienceCreateDto dto)
        {
            var guide = await _context.LocalGuides.FindAsync(guideId);
            if (guide == null || guide.Status != GuideStatus.Approved)
            {
                throw new InvalidOperationException("Only approved Local Guides can publish experiences.");
            }

            var exp = new Experience
            {
                GuideId = guideId,
                DestinationId = dto.DestinationId,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                DurationHours = dto.DurationHours,
                MaxCapacity = dto.MaxCapacity,
                MeetingPoint = dto.MeetingPoint,
                CoverImageUrl = dto.ImageUrls.ElementAtOrDefault(0) ?? dto.CoverImageUrl,
                Image2Url = dto.ImageUrls.ElementAtOrDefault(1),
                Image3Url = dto.ImageUrls.ElementAtOrDefault(2),
                Image4Url = dto.ImageUrls.ElementAtOrDefault(3),
                Status = ExperienceStatus.PendingApproval, // Admin must approve
                IsDynamicPricingEnabled = dto.IsDynamicPricingEnabled,
                WeekendMultiplier = dto.WeekendMultiplier,
                PeakSeasonMultiplier = dto.PeakSeasonMultiplier
            };

            _context.Experiences.Add(exp);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(exp.Id);
        }

        public async Task<ExperienceResponseDto> UpdateAsync(Guid guideId, Guid id, ExperienceCreateDto dto)
        {
            var exp = await _context.Experiences.FirstOrDefaultAsync(e => e.Id == id && e.GuideId == guideId);
            if (exp == null) throw new KeyNotFoundException("Experience not found.");

            exp.DestinationId = dto.DestinationId;
            exp.CategoryId = dto.CategoryId;
            exp.Title = dto.Title;
            exp.Description = dto.Description;
            exp.BasePrice = dto.BasePrice;
            exp.DurationHours = dto.DurationHours;
            exp.MaxCapacity = dto.MaxCapacity;
            exp.MeetingPoint = dto.MeetingPoint;
            exp.CoverImageUrl = dto.ImageUrls.ElementAtOrDefault(0) ?? dto.CoverImageUrl;
            exp.Image2Url = dto.ImageUrls.ElementAtOrDefault(1);
            exp.Image3Url = dto.ImageUrls.ElementAtOrDefault(2);
            exp.Image4Url = dto.ImageUrls.ElementAtOrDefault(3);
            exp.IsDynamicPricingEnabled = dto.IsDynamicPricingEnabled;
            exp.WeekendMultiplier = dto.WeekendMultiplier;
            exp.PeakSeasonMultiplier = dto.PeakSeasonMultiplier;
            exp.Status = ExperienceStatus.PendingApproval;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(exp.Id);
        }

        public async Task<ExperienceResponseDto> UpdateByAdminAsync(Guid id, ExperienceCreateDto dto)
        {
            var exp = await _context.Experiences.FirstOrDefaultAsync(e => e.Id == id);
            if (exp == null) throw new KeyNotFoundException("Experience not found.");
            if (exp.Status == ExperienceStatus.PendingApproval)
            {
                throw new InvalidOperationException("Pending experiences must be approved or declined before editing.");
            }

            exp.DestinationId = dto.DestinationId;
            exp.CategoryId = dto.CategoryId;
            exp.Title = dto.Title;
            exp.Description = dto.Description;
            exp.BasePrice = dto.BasePrice;
            exp.DurationHours = dto.DurationHours;
            exp.MaxCapacity = dto.MaxCapacity;
            exp.MeetingPoint = dto.MeetingPoint;
            exp.CoverImageUrl = dto.ImageUrls.ElementAtOrDefault(0) ?? dto.CoverImageUrl;
            exp.Image2Url = dto.ImageUrls.ElementAtOrDefault(1);
            exp.Image3Url = dto.ImageUrls.ElementAtOrDefault(2);
            exp.Image4Url = dto.ImageUrls.ElementAtOrDefault(3);
            exp.IsDynamicPricingEnabled = dto.IsDynamicPricingEnabled;
            exp.WeekendMultiplier = dto.WeekendMultiplier;
            exp.PeakSeasonMultiplier = dto.PeakSeasonMultiplier;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(exp.Id);
        }

        public async Task DeleteByAdminAsync(Guid id)
        {
            var exp = await _context.Experiences.FirstOrDefaultAsync(e => e.Id == id);
            if (exp == null) throw new KeyNotFoundException("Experience not found.");
            if (exp.Status == ExperienceStatus.PendingApproval)
            {
                throw new InvalidOperationException("Pending experiences must be approved or declined before deletion.");
            }

            _context.Experiences.Remove(exp);
            await _context.SaveChangesAsync();
        }

        public async Task<ExperienceResponseDto> UpdateStatusAsync(Guid id, ExperienceStatus status)
        {
            var exp = await _context.Experiences.FindAsync(id);
            if (exp == null) throw new KeyNotFoundException("Experience not found.");

            exp.Status = status;
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        // 🌟 BUSINESS RULE: DYNAMIC PRICING FORMULA
        public async Task<DynamicPriceCalculationDto> CalculatePriceAsync(Guid experienceId, DateTime targetDate)
        {
            var exp = await _context.Experiences.Include(e => e.Destination).FirstOrDefaultAsync(e => e.Id == experienceId);
            if (exp == null) throw new KeyNotFoundException("Experience not found.");

            decimal finalPrice = exp.BasePrice;
            bool isWeekend = targetDate.DayOfWeek == DayOfWeek.Saturday || targetDate.DayOfWeek == DayOfWeek.Sunday;
            decimal weekendMul = 1.0m;
            decimal seasonMul = 1.0m;
            var reasons = new List<string>();

            if (exp.IsDynamicPricingEnabled)
            {
                if (isWeekend)
                {
                    weekendMul = exp.WeekendMultiplier;
                    finalPrice *= weekendMul;
                    reasons.Add($"Weekend demand rate applied (+{(weekendMul - 1) * 100:0}%)");
                }

                if (exp.Destination.CurrentSeason == SeasonType.Peak)
                {
                    seasonMul = exp.PeakSeasonMultiplier;
                    finalPrice *= seasonMul;
                    reasons.Add($"Peak travel season rate applied (+{(seasonMul - 1) * 100:0}%)");
                }
                else if (exp.Destination.CurrentSeason == SeasonType.OffPeak)
                {
                    seasonMul = 0.90m; // 10% discount in off-peak
                    finalPrice *= seasonMul;
                    reasons.Add("Off-peak discount applied (-10%)");
                }
            }

            finalPrice = Math.Round(finalPrice, 2);

            return new DynamicPriceCalculationDto
            {
                ExperienceId = exp.Id,
                BasePrice = exp.BasePrice,
                FinalPrice = finalPrice,
                IsWeekend = isWeekend,
                WeekendMultiplierApplied = weekendMul,
                Season = exp.Destination.CurrentSeason.ToString(),
                SeasonMultiplierApplied = seasonMul,
                PriceExplanation = reasons.Count > 0 ? string.Join(" | ", reasons) : "Standard base rate."
            };
        }

        // 🤖 RESEARCH AGENT SEARCH TOOL
        public async Task<IEnumerable<ExperienceResponseDto>> SearchForResearchAgentAsync(AgentExperienceSearchQueryDto query)
        {
            var q = _context.Experiences
                .Include(e => e.Guide).ThenInclude(g => g.User)
                .Include(e => e.Destination)
                .Include(e => e.Category)
                .Where(e => e.Status == ExperienceStatus.Approved && e.IsActive);

            if (!string.IsNullOrEmpty(query.DestinationName))
            {
                q = q.Where(e => e.Destination.Name.ToLower().Contains(query.DestinationName.ToLower()));
            }

            if (!string.IsNullOrEmpty(query.CategoryName))
            {
                q = q.Where(e => e.Category.Name.ToLower().Contains(query.CategoryName.ToLower()));
            }

            var list = await q.ToListAsync();
            var targetDate = query.TravelDate ?? DateTime.UtcNow;

            var result = list.Select(e => MapToDto(e, targetDate)).ToList();

            if (query.MaxBudget.HasValue)
            {
                result = result.Where(r => r.CurrentCalculatedPrice <= query.MaxBudget.Value).ToList();
            }

            return result;
        }

        private static ExperienceResponseDto MapToDto(Experience e, DateTime date)
        {
            decimal currentPrice = e.BasePrice;
            if (e.IsDynamicPricingEnabled)
            {
                bool isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
                if (isWeekend) currentPrice *= e.WeekendMultiplier;
                if (e.Destination != null && e.Destination.CurrentSeason == SeasonType.Peak) currentPrice *= e.PeakSeasonMultiplier;
            }

            return new ExperienceResponseDto
            {
                Id = e.Id,
                GuideId = e.GuideId,
                GuideName = e.Guide?.User?.FullName ?? "Unknown Guide",
                DestinationId = e.DestinationId,
                DestinationName = e.Destination?.Name ?? "Unknown Destination",
                CategoryId = e.CategoryId,
                CategoryName = e.Category?.Name ?? "Unknown Category",
                Title = e.Title,
                Description = e.Description,
                BasePrice = e.BasePrice,
                CurrentCalculatedPrice = Math.Round(currentPrice, 2),
                DurationHours = e.DurationHours,
                MaxCapacity = e.MaxCapacity,
                MeetingPoint = e.MeetingPoint,
                CoverImageUrl = e.CoverImageUrl,
                ImageUrls = new[] { e.CoverImageUrl, e.Image2Url, e.Image3Url, e.Image4Url }
                    .Where(image => !string.IsNullOrWhiteSpace(image))
                    .ToList(),
                Status = e.Status.ToString(),
                Rating = e.Rating,
                TotalBookingsCount = e.TotalBookingsCount
            };
        }
    }
}