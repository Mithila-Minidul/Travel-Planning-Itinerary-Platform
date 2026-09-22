using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface IPlannerAgentService
    {
        Task<List<TripStop>> GenerateItineraryAsync(
            Guid destinationId,
            DateTime startDate,
            DateTime endDate,
            decimal budget,
            string interests);
    }

    public class PlannerAgentService : IPlannerAgentService
    {
        private readonly AppDbContext _context;

        public PlannerAgentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TripStop>> GenerateItineraryAsync(
            Guid destinationId,
            DateTime startDate,
            DateTime endDate,
            decimal budget,
            string interests)
        {
            // ============================================================
            // PLACEHOLDER — Will be replaced by Python AI Service later
            // ============================================================
            // Simplified logic:
            // 1. Calculate number of days
            // 2. Parse traveler's interests
            // 3. Find matching approved Experiences in that destination
            // 4. Pick top-rated experiences per day within per-day budget
            // ============================================================

            var totalDays = (endDate.Date - startDate.Date).Days + 1;
            if (totalDays < 1) totalDays = 1;
            if (totalDays > 14) totalDays = 14; // hard cap

            // Parse interests into a lowercase list
            var interestList = (interests ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(i => i.Trim().ToLowerInvariant())
                .Where(i => !string.IsNullOrEmpty(i))
                .ToList();

            // Get matching category IDs (if interests specified)
            List<Guid> matchingCategoryIds = new();
            if (interestList.Count > 0)
            {
                matchingCategoryIds = await _context.Categories
                    .Where(c => interestList.Any(i => c.Name.ToLower().Contains(i)))
                    .Select(c => c.Id)
                    .ToListAsync();
            }

            // Fetch candidate experiences (approved, in destination, matching categories)
            var experienceQuery = _context.Experiences
                .Include(e => e.Category)
                .Where(e => e.DestinationId == destinationId
                         && e.Status == ExperienceStatus.Approved);

            if (matchingCategoryIds.Count > 0)
            {
                experienceQuery = experienceQuery.Where(e => matchingCategoryIds.Contains(e.CategoryId));
            }

            var candidates = await experienceQuery
                .OrderByDescending(e => e.Rating)
                .ThenByDescending(e => e.TotalBookingsCount)
                .Take(totalDays * 3)
                .ToListAsync();

            // Build the day-by-day itinerary
            var stops = new List<TripStop>();
            var usedExperienceIds = new HashSet<Guid>();
            var perDayBudget = budget / totalDays;
            var orderIndex = 0;

            for (int day = 1; day <= totalDays; day++)
            {
                // Try to pick up to 2 experiences for this day that fit the per-day budget
                var dayPicks = candidates
                    .Where(e => !usedExperienceIds.Contains(e.Id) && e.BasePrice <= perDayBudget)
                    .Take(2)
                    .ToList();

                // Fallback: if nothing fits the budget, just take anything unused
                if (!dayPicks.Any())
                {
                    dayPicks = candidates
                        .Where(e => !usedExperienceIds.Contains(e.Id))
                        .Take(1)
                        .ToList();
                }

                foreach (var exp in dayPicks)
                {
                    usedExperienceIds.Add(exp.Id);
                    stops.Add(new TripStop
                    {
                        ExperienceId = exp.Id,
                        DayNumber = day,
                        Title = exp.Title,
                        Description = exp.Description,
                        Location = exp.MeetingPoint ?? "TBD",
                        EstimatedCost = exp.BasePrice,
                        OrderIndex = orderIndex++
                    });
                }

                // If no experiences available at all, add a placeholder free day
                if (!dayPicks.Any() && candidates.Count == 0)
                {
                    stops.Add(new TripStop
                    {
                        ExperienceId = null,
                        DayNumber = day,
                        Title = $"Free Day {day}",
                        Description = "Explore at your own pace. Your Travel Agent may suggest activities.",
                        Location = "TBD",
                        EstimatedCost = 0,
                        OrderIndex = orderIndex++
                    });
                }
            }

            return stops;
        }
    }
}