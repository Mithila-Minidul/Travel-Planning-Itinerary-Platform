using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPlannerAgentService _plannerAgent;

        public TripsController(AppDbContext context, IPlannerAgentService plannerAgent)
        {
            _context = context;
            _plannerAgent = plannerAgent;
        }

        // ============================================================
        // GET: api/Trips
        // ============================================================
        [Authorize(Roles = "Admin, TravelAgent, Traveler")]
        [HttpGet]
        public async Task<IActionResult> GetAllTrips()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var query = _context.Trips
                .Include(t => t.TripStops)
                .Include(t => t.Traveler)
                .Include(t => t.TravelAgent)
                .Include(t => t.Destination)
                .Include(t => t.Guide).ThenInclude(g => g.User)
                .AsQueryable();

            if (userRole == "Traveler")
            {
                query = query.Where(t => t.TravelerId.ToString() == userIdClaim);
            }

            var trips = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TripResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Objective = t.Objective,
                    Interests = t.Interests,
                    DestinationId = t.DestinationId,
                    DestinationName = t.Destination != null ? t.Destination.Name : string.Empty,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    Budget = t.Budget,
                    Status = t.Status,
                    TravelerName = t.Traveler.FullName,
                    TravelAgentName = t.TravelAgent != null ? t.TravelAgent.FullName : null,
                    GuideId = t.GuideId,
                    GuideName = t.Guide != null && t.Guide.User != null ? t.Guide.User.FullName : null,
                    GuideCity = t.Guide != null ? t.Guide.City : null,
                    GuideProfileImageUrl = t.Guide != null && t.Guide.User != null
                        ? t.Guide.User.ProfileImageUrl
                        : null,   
                    TravelGroup = t.TravelGroup,
                    NumberOfTravelers = t.NumberOfTravelers,
                    BudgetTier = t.BudgetTier,
                    TravelPace = t.TravelPace,
                    PreferredTimes = t.PreferredTimes,
                    SpecialRequests = t.SpecialRequests,
                    AiErrors = t.AiErrors,
                    RejectionReason = t.RejectionReason,   
                    TotalEstimatedCost = t.TripStops.Sum(s => s.EstimatedCost)
                        * (t.NumberOfTravelers <= 0 ? 1 : t.NumberOfTravelers),
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    TripStops = t.TripStops.Select(s => new TripStopDto
                    {
                        ExperienceId = s.ExperienceId,
                        DayNumber = s.DayNumber,
                        Title = s.Title,
                        Description = s.Description,
                        Location = s.Location,
                        EstimatedCost = s.EstimatedCost,
                        OrderIndex = s.OrderIndex
                    }).ToList()
                })
                .ToListAsync();

            return Ok(trips);
        }

        // ============================================================
        // GET: api/Trips/{id}
        // ============================================================
        [Authorize(Roles = "Admin, TravelAgent, Traveler, LocalGuide")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTripById(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var trip = await _context.Trips
                .Include(t => t.TripStops)
                .Include(t => t.Traveler)
                .Include(t => t.TravelAgent)
                .Include(t => t.Destination)
                .Include(t => t.Guide).ThenInclude(g => g.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null) return NotFound(new { message = "Trip not found." });

            if (userRole == "Traveler" && trip.TravelerId.ToString() != userIdClaim)
                return Forbid();

            // ✅ LocalGuide can only see trips assigned to them
            if (userRole == "LocalGuide")
            {
                if (!Guid.TryParse(userIdClaim, out var guideUserId))
                    return Forbid();

                var guide = await _context.LocalGuides
                    .FirstOrDefaultAsync(g => g.UserId == guideUserId);

                if (guide == null || trip.GuideId != guide.Id)
                    return Forbid();
            }

            var dto = new TripResponseDto
            {
                Id = trip.Id,
                Title = trip.Title,
                Objective = trip.Objective,
                Interests = trip.Interests,
                DestinationId = trip.DestinationId,
                DestinationName = trip.Destination?.Name ?? string.Empty,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                Budget = trip.Budget,
                Status = trip.Status,
                TravelerName = trip.Traveler.FullName,
                TravelAgentName = trip.TravelAgent?.FullName,
                GuideId = trip.GuideId,
                GuideName = trip.Guide?.User?.FullName,
                GuideCity = trip.Guide?.City,
                GuideProfileImageUrl = trip.Guide?.User?.ProfileImageUrl, 
                TravelGroup = trip.TravelGroup,
                NumberOfTravelers = trip.NumberOfTravelers,
                BudgetTier = trip.BudgetTier,
                TravelPace = trip.TravelPace,
                PreferredTimes = trip.PreferredTimes,
                SpecialRequests = trip.SpecialRequests,
                AiErrors = trip.AiErrors,
                RejectionReason = trip.RejectionReason,   // 👈 ADDED
                TotalEstimatedCost = trip.TripStops.Sum(s => s.EstimatedCost)
                    * (trip.NumberOfTravelers <= 0 ? 1 : trip.NumberOfTravelers),
                CreatedAt = trip.CreatedAt,
                UpdatedAt = trip.UpdatedAt,
                TripStops = trip.TripStops
                    .OrderBy(s => s.DayNumber).ThenBy(s => s.OrderIndex)
                    .Select(s => new TripStopDto
                    {
                        ExperienceId = s.ExperienceId,
                        DayNumber = s.DayNumber,
                        Title = s.Title,
                        Description = s.Description,
                        Location = s.Location,
                        EstimatedCost = s.EstimatedCost,
                        OrderIndex = s.OrderIndex
                    }).ToList()
            };

            return Ok(dto);
        }

        // ============================================================
        // POST: api/Trips
        // ONLY Traveler — calls the Python AI service
        // ============================================================
        private const int MAX_TRIP_DAYS = 14;

        [Authorize(Roles = "Traveler")]
        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromBody] TripCreateDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            // ✅ Server-side validation: cap trip length (matches Flutter + AI limit)
            var totalDays = (request.EndDate.Date - request.StartDate.Date).Days + 1;
            if (totalDays < 1)
                return BadRequest(new { message = "End date must be on or after start date." });
            if (totalDays > MAX_TRIP_DAYS)
                return BadRequest(new
                {
                    message = $"Trips are limited to {MAX_TRIP_DAYS} days. " +
                              $"Requested: {totalDays} days."
                });

            var destination = await _context.Destinations
                .FirstOrDefaultAsync(d => d.Id == request.DestinationId);
            if (destination == null)
                return BadRequest(new { message = "Destination not found." });

            var tripId = Guid.NewGuid();

            // 👇 Capture the workflow start time BEFORE calling Python
            var workflowStartTime = DateTime.UtcNow;

            // Call Python AI service (Planner → Research → Budget → Approval)
            var plannerResult = await _plannerAgent.GenerateItineraryAsync(
                tripId: tripId,
                destinationId: request.DestinationId,
                destinationName: destination.Name,
                startDate: request.StartDate,
                endDate: request.EndDate,
                budget: request.Budget,
                interests: request.Interests ?? string.Empty,
                travelGroup: request.TravelGroup ?? "Solo",
                numberOfTravelers: request.NumberOfTravelers <= 0 ? 1 : request.NumberOfTravelers,
                budgetTier: request.BudgetTier ?? "Mid",
                travelPace: request.TravelPace ?? "Balanced",
                preferredTimes: request.PreferredTimes ?? string.Empty,
                specialRequests: request.SpecialRequests ?? string.Empty);

            // ---- Build Trip ----
            var trip = new Trip
            {
                Id = tripId,
                Title = request.Title,
                Objective = request.Objective ?? string.Empty,
                Interests = request.Interests ?? string.Empty,
                DestinationId = request.DestinationId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Budget = request.Budget,
                Constraints = request.Constraints ?? string.Empty,
                Status = "Pending",
                TravelerId = Guid.Parse(userIdClaim),
                GuideId = plannerResult.WinningGuideId,
                TripStops = plannerResult.Stops,
                TravelGroup = request.TravelGroup,
                NumberOfTravelers = request.NumberOfTravelers <= 0 ? 1 : request.NumberOfTravelers,
                BudgetTier = request.BudgetTier,
                TravelPace = request.TravelPace,
                PreferredTimes = request.PreferredTimes,
                SpecialRequests = request.SpecialRequests,
                AiErrors = (plannerResult.Errors != null && plannerResult.Errors.Count > 0)
                    ? string.Join(" | ", plannerResult.Errors)
                    : null
            };

            // ---- Build AgentWorkflow + AgentExecutionLogs ----
            var workflow = BuildAgentWorkflow(tripId, request.Objective, plannerResult, workflowStartTime);

            _context.Trips.Add(trip);
            _context.AgentWorkflows.Add(workflow);

            // One atomic save: Trip + TripStops + AgentWorkflow + AgentExecutionLogs
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Trip created and itinerary generated by AI service.",
                tripId = trip.Id,
                workflowId = workflow.Id,
                stopsGenerated = plannerResult.Stops.Count,
                guideId = plannerResult.WinningGuideId,
                guideName = plannerResult.WinningGuideName,
                budgetValid = plannerResult.BudgetValid,
                totalEstimatedCost = plannerResult.TotalEstimatedCost,
                approvalStatus = plannerResult.ApprovalStatus,
                executionLogEntries = plannerResult.ExecutionLog.Count,
                errors = plannerResult.Errors
            });
        }

        // ============================================================
        // Helper: build AgentWorkflow from PlannerResult.ExecutionLog
        // ============================================================
        private static AgentWorkflow BuildAgentWorkflow(
            Guid tripId,
            string? objective,
            PlannerResult plannerResult,
            DateTime workflowStartTime)
        {
            var workflow = new AgentWorkflow
            {
                TripId = tripId,
                Status = plannerResult.ApprovalStatus,
                Objective = objective ?? string.Empty,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                TotalSteps = plannerResult.ExecutionLog.Count,
                TotalEstimatedCost = plannerResult.TotalEstimatedCost,
                BudgetValid = plannerResult.BudgetValid,
                WinningGuideName = plannerResult.WinningGuideName
            };

            DateTime? previous = workflowStartTime;
            int seq = 1;
            foreach (var entry in plannerResult.ExecutionLog)
            {
                // ✅ FIX: Python sends ISO-8601 with +00:00 offset.
                // Use AdjustToUniversal + AssumeUniversal so the resulting
                // DateTime has Kind=Utc — required by Npgsql for timestamptz.
                DateTime current = DateTime.TryParse(
                    entry.Timestamp,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AdjustToUniversal
                        | System.Globalization.DateTimeStyles.AssumeUniversal,
                    out var parsed)
                    ? parsed
                    : DateTime.UtcNow;

                long elapsed = previous.HasValue
                    ? (long)(current - previous.Value).TotalMilliseconds
                    : 0;

                workflow.ExecutionLogs.Add(new AgentExecutionLog
                {
                    AgentWorkflowId = workflow.Id,
                    SequenceNumber = seq++,
                    AgentName = entry.Agent,
                    Action = entry.Action,
                    Status = entry.Status,
                    Details = entry.Details,
                    ExecutedAt = current,
                    ElapsedMs = elapsed
                });

                previous = current;
            }

            return workflow;
        }

        // ============================================================
        // PATCH: api/Trips/{id}/review
        // ============================================================
        [Authorize(Roles = "TravelAgent")]
        [HttpPatch("{id:guid}/review")]
        public async Task<IActionResult> ReviewTrip(Guid id, [FromBody] TripReviewDto request)
        {
            var agentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == id);
            if (trip == null) return NotFound(new { message = "Trip not found." });

            if (request.Status != "Approved" && request.Status != "Rejected")
                return BadRequest(new { message = "Status must be 'Approved' or 'Rejected'." });

            if (trip.Status != "Pending")
                return BadRequest(new { message = $"Trip has already been {trip.Status}." });

            trip.Status = request.Status;

            // 👇 Save rejection reason when rejecting
            if (request.Status == "Rejected")
            {
                trip.RejectionReason = string.IsNullOrWhiteSpace(request.RejectionReason)
                    ? "Rejected by Travel Agent."
                    : request.RejectionReason.Trim();
            }
            else if (request.Status == "Approved")
            {
                trip.RejectionReason = null;   // clear any prior reason
            }

            if (Guid.TryParse(agentIdClaim, out var agentId))
            {
                trip.TravelAgentId = agentId;
            }

            // ✅ Sync the AI workflow status so the AI Performance page
            //    reflects the human decision, not just the AI's initial pause.
            var workflow = await _context.AgentWorkflows
                .Where(w => w.TripId == trip.Id)
                .OrderByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync();

            if (workflow != null)
            {
                workflow.Status = request.Status.ToUpperInvariant();   // APPROVED | REJECTED
                workflow.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Trip successfully {request.Status}.", tripId = trip.Id });
        }
        // ============================================================
        // DELETE: api/Trips/{id}
        // Admin or Traveler owner — Only Approved or Rejected trips
        // ============================================================
        [Authorize(Roles = "Admin, Traveler")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTrip(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == id);
            if (trip == null) return NotFound(new { message = "Trip not found." });

            // Ensure travelers can only delete their own trips
            if (userRole == "Traveler" && trip.TravelerId.ToString() != userIdClaim)
            {
                return Forbid();
            }

            // Pending trips cannot be deleted
            if (trip.Status == "Pending")
            {
                return BadRequest(new { message = "Pending trips cannot be deleted. Only Approved or Rejected trips can be deleted." });
            }

            // 1. Delete all bookings and reviews related to this trip
            var bookings = await _context.Bookings.Where(b => b.TripId == id).ToListAsync();
            if (bookings.Any())
            {
                var bookingIds = bookings.Select(b => b.Id).ToList();
                var reviews = await _context.Reviews.Where(r => bookingIds.Contains(r.BookingId)).ToListAsync();
                _context.Reviews.RemoveRange(reviews);
                _context.Bookings.RemoveRange(bookings);
            }

            // 2. Delete agent workflows (cascades to execution logs)
            var workflows = await _context.AgentWorkflows.Where(w => w.TripId == id).ToListAsync();
            _context.AgentWorkflows.RemoveRange(workflows);

            // 3. Delete trip stops
            var stops = await _context.TripStops.Where(s => s.TripId == id).ToListAsync();
            _context.TripStops.RemoveRange(stops);

            // 4. Delete the trip entity
            _context.Trips.Remove(trip);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Trip and all associated data deleted successfully." });
        }
    
    }
}