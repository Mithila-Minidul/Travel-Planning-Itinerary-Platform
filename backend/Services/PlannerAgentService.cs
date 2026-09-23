using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    /// <summary>
    /// Result of the Planner Agent — contains stops AND the chosen guide.
    /// </summary>
    public class PlannerResult
    {
        public List<TripStop> Stops { get; set; } = new();
        public Guid? WinningGuideId { get; set; }
        public string? WinningGuideName { get; set; }
    }

    public interface IPlannerAgentService
    {
        Task<PlannerResult> GenerateItineraryAsync(
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

        public async Task<PlannerResult> GenerateItineraryAsync(
            Guid destinationId,
            DateTime startDate,
            DateTime endDate,
            decimal budget,
            string interests)
        {
            // ============================================================
            // STEP 1: Compute trip duration (1-14 days)
            // ============================================================
            var totalDays = (endDate.Date - startDate.Date).Days + 1;
            if (totalDays < 1) totalDays = 1;
            if (totalDays > 14) totalDays = 14;

            // ============================================================
            // STEP 2: Parse interests
            // ============================================================
            var interestList = (interests ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(i => i.Trim().ToLowerInvariant())
                .Where(i => !string.IsNullOrEmpty(i))
                .ToList();

            // ============================================================
            // STEP 3: Map interests → Category IDs
            // ============================================================
            List<Guid> matchingCategoryIds = new();
            if (interestList.Count > 0)
            {
                matchingCategoryIds = await _context.Categories
                    .Where(c => interestList.Any(i => c.Name.ToLower().Contains(i)))
                    .Select(c => c.Id)
                    .ToListAsync();
            }

            // ============================================================
            // STEP 4: Fetch ALL approved experiences in this destination
            // ============================================================
            var allExperiences = await _context.Experiences
                .Include(e => e.Category)
                .Include(e => e.Guide)
                    .ThenInclude(g => g.User)
                .Where(e => e.DestinationId == destinationId
                         && e.Status == ExperienceStatus.Approved)
                .ToListAsync();

            if (allExperiences.Count == 0)
            {
                return new PlannerResult
                {
                    Stops = BuildPlaceholderDays(
                        totalDays,
                        "No approved experiences in this destination yet."),
                    WinningGuideId = null,
                    WinningGuideName = null
                };
            }

            // ============================================================
            // STEP 5: Group by Guide
            // ============================================================
            var allGuideGroups = allExperiences
                .GroupBy(e => e.GuideId)
                .Select(g => new
                {
                    GuideId = g.Key,
                    Guide = g.First().Guide,
                    Experiences = g.ToList(),
                    MatchingCount = g.Count(e =>
                        matchingCategoryIds.Contains(e.CategoryId)),
                    RatingScore = g.First().Guide?.Rating ?? 0m,
                    ExperienceScore = g.First().Guide?.YearsOfExperience ?? 0
                })
                .ToList();

            // ✅ STRICT FILTER: If interests given, prefer guides WITH matches
            List<dynamic> eligibleGuides;
            if (matchingCategoryIds.Count > 0)
            {
                var guidesWithMatches = allGuideGroups
                    .Where(g => g.MatchingCount > 0)
                    .ToList<dynamic>();

                // If at least one guide has matches, use ONLY those guides
                eligibleGuides = guidesWithMatches.Count > 0
                    ? guidesWithMatches
                    : allGuideGroups.Cast<dynamic>().ToList();
            }
            else
            {
                eligibleGuides = allGuideGroups.Cast<dynamic>().ToList();
            }

            // Pick the winning guide
            var winningGuide = eligibleGuides
                .OrderByDescending(g => (int)g.MatchingCount)
                .ThenByDescending(g => (decimal)g.RatingScore)
                .ThenByDescending(g => (int)g.ExperienceScore)
                .First();

            // ============================================================
            // STEP 6: Build candidate pool
            // ✅ STRICT: If matching experiences exist, use ONLY those.
            // ============================================================
            var guideExperiences = ((IEnumerable<Experience>)winningGuide.Experiences).ToList();

            var matchingExperiences = guideExperiences
                .Where(e => matchingCategoryIds.Contains(e.CategoryId))
                .ToList();

            List<Experience> candidates;
            if (matchingCategoryIds.Count > 0 && matchingExperiences.Count > 0)
            {
                // ✅ STRICT MODE — only experiences that match the chosen interests
                candidates = matchingExperiences;
            }
            else
            {
                // Fallback — guide has no matching experiences
                candidates = guideExperiences;
            }

            // Sort: cheapest first (within the matched set)
            candidates = candidates
                .OrderBy(e => e.BasePrice)
                .ToList();

            // ============================================================
            // STEP 7: Build day-by-day itinerary
            // ✅ KEEP the candidates order (do NOT re-sort per day)
            // ============================================================
            var stops = new List<TripStop>();
            var usedIds = new HashSet<Guid>();
            var orderIndex = 0;

            // Distribute experiences evenly across days
            var experiencesPerDay = candidates.Count > 0
                ? Math.Max(1, (int)Math.Ceiling((double)candidates.Count / totalDays))
                : 0;
            experiencesPerDay = Math.Min(experiencesPerDay, 2); // max 2 per day

            for (int day = 1; day <= totalDays; day++)
            {
                // ✅ Take next items from the ordered candidate list (NO re-sort)
                var dayPicks = candidates
                    .Where(e => !usedIds.Contains(e.Id))
                    .Take(experiencesPerDay)
                    .ToList();

                // If out of experiences, no more picking
                foreach (var exp in dayPicks)
                {
                    usedIds.Add(exp.Id);
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

                // If day has no pick AND we still have unused experiences → add 1
                if (dayPicks.Count == 0)
                {
                    var remaining = candidates
                        .Where(e => !usedIds.Contains(e.Id))
                        .Take(1)
                        .ToList();

                    if (remaining.Count > 0)
                    {
                        var exp = remaining[0];
                        usedIds.Add(exp.Id);
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
                    else
                    {
                        // Truly nothing left — Free Day
                        stops.Add(new TripStop
                        {
                            ExperienceId = null,
                            DayNumber = day,
                            Title = $"Day {day}: Free Day",
                            Description = "Explore at your own pace.",
                            Location = winningGuide.Guide?.City ?? "TBD",
                            EstimatedCost = 0,
                            OrderIndex = orderIndex++
                        });
                    }
                }
            }

            return new PlannerResult
            {
                Stops = stops,
                WinningGuideId = winningGuide.GuideId,
                WinningGuideName = winningGuide.Guide?.User?.FullName ?? "Local Guide"
            };
        }

        private List<TripStop> BuildPlaceholderDays(int totalDays, string reason)
        {
            var stops = new List<TripStop>();
            for (int day = 1; day <= totalDays; day++)
            {
                stops.Add(new TripStop
                {
                    ExperienceId = null,
                    DayNumber = day,
                    Title = $"Day {day}: Explore",
                    Description = reason,
                    Location = "TBD",
                    EstimatedCost = 0,
                    OrderIndex = day - 1
                });
            }
            return stops;
        }
    }
}