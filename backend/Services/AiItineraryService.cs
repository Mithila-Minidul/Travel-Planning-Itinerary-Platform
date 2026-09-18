using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class AiItineraryService : IAiItineraryService
    {
        private readonly AppDbContext _context;
        private readonly ITripValidationService _validationService;
        private readonly HttpClient _httpClient;
        private readonly ILogger<AiItineraryService> _logger;

        private static readonly JsonSerializerOptions JsonOptions =
            new()
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                PropertyNameCaseInsensitive = true
            };

        public AiItineraryService(
            AppDbContext context,
            ITripValidationService validationService,
            HttpClient httpClient,
            ILogger<AiItineraryService> logger)
        {
            _context = context;
            _validationService = validationService;
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<AiWorkflowResponseDto> GenerateAsync(Guid tripId, Guid travelerId)
        {
            var trip = await LoadTrip(tripId);
            if (trip == null || trip.TravelerId != travelerId)
                throw new UnauthorizedAccessException("You do not have permission to generate an itinerary for this trip.");

            if (trip.Status != TripStatus.Draft &&
                trip.Status != TripStatus.Rejected &&
                trip.Status != TripStatus.RevisionRequested)
            {
                throw new InvalidOperationException(
                    "AI generation can only be started for Draft, Rejected, or Revision Requested trips.");
            }

            if (!trip.Stops.Any(s => s.IsActive))
                throw new InvalidOperationException("Add at least one TripStop before generating an AI itinerary.");

            var workflow = new AiWorkflow
            {
                TripId = trip.Id,
                RequestedByUserId = travelerId,
                Status = "Generating",
                CurrentStep = "Preparing trip context",
                StartedAt = DateTime.UtcNow
            };

            _context.AiWorkflows.Add(workflow);
            trip.Status = TripStatus.Generating;
            await _context.SaveChangesAsync();

            await AddLog(workflow.Id, 1, "Context preparation", "COMPLETED",
                $"Prepared {trip.Stops.Count(s => s.IsActive)} active TripStop(s).");

            try
            {
                workflow.CurrentStep = "Planner Agent research";
                await _context.SaveChangesAsync();

             var request = new
             {
                 trip = new
                 {
                     trip_id = trip.Id.ToString(),
                     title = trip.Title,
                     objective = trip.Objective,
                     start_date = trip.StartDate,
                     end_date = trip.EndDate,
                     constraints = trip.Constraints,
                     stops = trip.Stops
                         .Where(s => s.IsActive)
                         .OrderBy(s => s.StopOrder)
                         .Select(s => new
                         {
                             id = s.Id.ToString(),
                             stop_order = s.StopOrder,
                             destination_id = s.DestinationId.ToString(),
                             destination_name = s.Destination?.Name ?? string.Empty,
                             latitude = s.Destination?.Latitude ?? 0,
                             longitude = s.Destination?.Longitude ?? 0,
                             experience_id = s.ExperienceId?.ToString(),
                             experience_title = s.Experience?.Title,
                             planned_arrival = s.PlannedArrival,
                             planned_departure = s.PlannedDeparture,
                             notes = s.Notes
                         })
                         .ToList()
                 }
             };

                var aiUrl = Environment.GetEnvironmentVariable("AI_SERVICE_BASE_URL")
                            ?? "http://localhost:8000";

                using var message = new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{aiUrl.TrimEnd('/')}/api/agents/planner")
                {
                    Content = JsonContent.Create(request)
                };

                var aiKey = Environment.GetEnvironmentVariable("AI_SERVICE_API_KEY");
                if (!string.IsNullOrWhiteSpace(aiKey))
                    message.Headers.Add("X-AI-Service-Key", aiKey);

                using var response = await _httpClient.SendAsync(message);
                if (!response.IsSuccessStatusCode)
                {
                    var upstream = await response.Content.ReadAsStringAsync();
                    throw new InvalidOperationException(
                        $"Planner Agent returned HTTP {(int)response.StatusCode}: {upstream}");
                }

                var planner = await response.Content.ReadFromJsonAsync<PlannerAgentResponseDto>(JsonOptions);
                if (planner == null || planner.ExecutionStatus != "COMPLETED")
                {
                    throw new InvalidOperationException(
                        planner?.DecisionSummary ?? "Planner Agent did not return a completed itinerary.");
                }

                workflow.CurrentStep = "Applying generated itinerary";
                workflow.ResultJson = JsonSerializer.Serialize(planner, JsonOptions);
                await AddLog(workflow.Id, 2, "Planner Agent research",
                    "COMPLETED", planner.DecisionSummary);

                await ApplyPlan(trip, planner);

                workflow.CurrentStep = "Deterministic validation";
                await _context.SaveChangesAsync();

                var validation = await _validationService.ValidateTripAsync(trip.Id);
                workflow.ValidationJson = JsonSerializer.Serialize(validation, JsonOptions);

                await AddLog(workflow.Id, 3, "Backend itinerary validation",
                    validation.IsValid ? "PASSED" : "REVIEW_REQUIRED",
                    validation.IsValid
                        ? "No deterministic errors or conflicts were found."
                        : $"Validation returned {validation.Errors.Count} error(s) and {validation.Conflicts.Count} conflict(s).");

                trip.Status = TripStatus.PendingReview;
                workflow.Status = "PendingReview";
                workflow.CurrentStep = "Waiting for Travel Agent review";
                workflow.CompletedAt = DateTime.UtcNow;

                await AddLog(workflow.Id, 4, "Review queue",
                    "PENDING", "AI itinerary is ready for Travel Agent/Admin review.");

                await _context.SaveChangesAsync();
                return await BuildResponse(workflow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI itinerary generation failed for trip {TripId}", tripId);

                trip.Status = TripStatus.Draft;
                workflow.Status = "Failed";
                workflow.CurrentStep = "Generation failed";
                workflow.ErrorMessage = "The Planner Agent could not complete this itinerary.";
                workflow.CompletedAt = DateTime.UtcNow;

                await AddLog(workflow.Id, 2, "Planner Agent",
                    "FAILED", "Generation failed; the trip was returned to Draft so the traveler can retry.");

                await _context.SaveChangesAsync();

                // Keep detailed upstream data in server logs, not in the API response.
                throw new InvalidOperationException(
                    "AI itinerary generation failed. The trip remains in Draft and can be retried.");
            }
        }

        public async Task<AiWorkflowResponseDto> GetWorkflowAsync(
            Guid workflowId, Guid requesterId, bool canReviewAll)
        {
            var workflow = await LoadWorkflow(workflowId);
            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            if (!canReviewAll && workflow.RequestedByUserId != requesterId)
                throw new UnauthorizedAccessException("You do not have permission to view this AI workflow.");

            return await BuildResponse(workflow);
        }

        public async Task<AiWorkflowResponseDto> GetLatestForTripAsync(
            Guid tripId, Guid requesterId, bool canReviewAll)
        {
            var workflow = await _context.AiWorkflows
                .Where(w => w.IsActive && w.TripId == tripId)
                .OrderByDescending(w => w.StartedAt)
                .FirstOrDefaultAsync();

            if (workflow == null)
                throw new KeyNotFoundException("No AI workflow exists for this trip.");

            return await GetWorkflowAsync(workflow.Id, requesterId, canReviewAll);
        }

        public async Task<IEnumerable<AiWorkflowSummaryDto>> GetPendingReviewsAsync()
        {
            var workflows = await _context.AiWorkflows
                .Include(w => w.Trip)
                .Where(w => w.IsActive && w.Status == "PendingReview")
                .OrderBy(w => w.StartedAt)
                .ToListAsync();

            return workflows.Select(MapSummary);
        }

        public async Task<AiWorkflowResponseDto> EditItineraryAsync(
            Guid workflowId, Guid reviewerId, AiItineraryEditRequestDto request)
        {
            var workflow = await LoadWorkflow(workflowId);
            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            if (workflow.Status != "PendingReview")
                throw new InvalidOperationException(
                    "Only itineraries waiting for review can be edited.");

            if (request.Plan.Count == 0)
                throw new InvalidOperationException("At least one itinerary stop is required.");

            var activeStops = workflow.Trip.Stops
                .Where(s => s.IsActive)
                .ToDictionary(s => s.Id);

            var seenOrders = new HashSet<int>();

            foreach (var item in request.Plan)
            {
                if (!Guid.TryParse(item.StopId, out var stopId) ||
                    !activeStops.TryGetValue(stopId, out var stop))
                    throw new InvalidOperationException("The review payload contains an invalid TripStop.");

                if (item.StopOrder < 1 || !seenOrders.Add(item.StopOrder))
                    throw new InvalidOperationException("Each TripStop must have a unique StopOrder of 1 or greater.");

                if (item.PlannedArrival >= item.PlannedDeparture)
                    throw new InvalidOperationException(
                        $"Arrival must be before departure for {item.DestinationName}.");

                stop.StopOrder = item.StopOrder;
                stop.PlannedArrival = item.PlannedArrival.ToUniversalTime();
                stop.PlannedDeparture = item.PlannedDeparture.ToUniversalTime();
                stop.Notes = item.Notes;

                if (Guid.TryParse(item.ExperienceId, out var experienceId))
                {
                    var experience = await _context.Experiences.FirstOrDefaultAsync(e =>
                        e.Id == experienceId &&
                        e.IsActive &&
                        e.Status == ExperienceStatus.Approved &&
                        e.DestinationId == stop.DestinationId);

                    if (experience == null)
                        throw new InvalidOperationException(
                            $"Experience '{item.ExperienceTitle ?? item.ExperienceId}' is not an approved experience for this destination.");

                    stop.ExperienceId = experience.Id;
                }
                else
                {
                    stop.ExperienceId = null;
                }
            }

            var validation = await _validationService.ValidateTripAsync(workflow.TripId);
            workflow.ValidationJson = JsonSerializer.Serialize(validation, JsonOptions);
            workflow.CurrentStep = "Waiting for Travel Agent review";
            workflow.ReviewNotes = "Itinerary edited by reviewer; approval remains pending.";

            await AddLog(
                workflow.Id,
                4,
                "Travel Agent itinerary edit",
                validation.IsValid ? "UPDATED" : "UPDATED_WITH_ISSUES",
                validation.IsValid
                    ? "Reviewer changes passed deterministic validation."
                    : "Reviewer changes were saved; validation still reports issues.");

            await _context.SaveChangesAsync();
            return await BuildResponse(workflow);
        }

        public async Task<AiWorkflowResponseDto> ApproveAsync(Guid workflowId, Guid reviewerId)
        {
            var workflow = await LoadWorkflow(workflowId);
            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            if (workflow.Status != "PendingReview")
                throw new InvalidOperationException(
                    $"This workflow cannot be approved from its current status '{workflow.Status}'.");

            var validation = workflow.ValidationJson == null
                ? await _validationService.ValidateTripAsync(workflow.TripId)
                : JsonSerializer.Deserialize<TripValidationResult>(workflow.ValidationJson, JsonOptions)
                  ?? await _validationService.ValidateTripAsync(workflow.TripId);

            if (!validation.IsValid)
                throw new InvalidOperationException(
                    "This itinerary cannot be approved until all validation errors and conflicts are resolved.");

            workflow.Trip.Status = TripStatus.Approved;
            workflow.Trip.ReviewedByAgentId = reviewerId;
            workflow.Trip.ReviewedAt = DateTime.UtcNow;
            workflow.Status = "Approved";
            workflow.CurrentStep = "Approved by Travel Agent";
            workflow.ReviewNotes = "Approved after deterministic itinerary validation.";
            workflow.CompletedAt ??= DateTime.UtcNow;

            await AddLog(workflow.Id, 5, "Travel Agent approval",
                "APPROVED", "Itinerary approved after validation.");

            await _context.SaveChangesAsync();
            return await BuildResponse(workflow);
        }

        public async Task<AiWorkflowResponseDto> RejectAsync(
            Guid workflowId, Guid reviewerId, string? notes)
        {
            var workflow = await LoadWorkflow(workflowId);
            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            workflow.Trip.Status = TripStatus.Rejected;
            workflow.Trip.ReviewedByAgentId = reviewerId;
            workflow.Trip.ReviewedAt = DateTime.UtcNow;
            workflow.Trip.ReviewNotes = notes?.Trim();
            workflow.Status = "Rejected";
            workflow.CurrentStep = "Rejected by Travel Agent";
            workflow.ReviewNotes = notes?.Trim();
            workflow.CompletedAt = DateTime.UtcNow;

            await AddLog(workflow.Id, 5, "Travel Agent rejection",
                "REJECTED", notes?.Trim() ?? "Itinerary rejected during review.");

            await _context.SaveChangesAsync();
            return await BuildResponse(workflow);
        }

        public async Task<AiWorkflowResponseDto> RequestRevisionAsync(
            Guid workflowId, Guid reviewerId, string? notes)
        {
            var workflow = await LoadWorkflow(workflowId);
            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            workflow.Trip.Status = TripStatus.RevisionRequested;
            workflow.Trip.ReviewedByAgentId = reviewerId;
            workflow.Trip.ReviewedAt = DateTime.UtcNow;
            workflow.Trip.ReviewNotes = notes?.Trim();
            workflow.Status = "RevisionRequested";
            workflow.CurrentStep = "Revision requested by Travel Agent";
            workflow.ReviewNotes = notes?.Trim();
            workflow.CompletedAt = DateTime.UtcNow;

            await AddLog(workflow.Id, 5, "Travel Agent revision request",
                "REVISION_REQUESTED", notes?.Trim() ?? "Please revise the itinerary.");

            await _context.SaveChangesAsync();
            return await BuildResponse(workflow);
        }

        public async Task<IEnumerable<AiExecutionLogDto>> GetLogsAsync(
            Guid workflowId, Guid requesterId, bool canReviewAll)
        {
            var workflow = await _context.AiWorkflows
                .FirstOrDefaultAsync(w => w.Id == workflowId && w.IsActive);

            if (workflow == null)
                throw new KeyNotFoundException("AI workflow not found.");

            if (!canReviewAll && workflow.RequestedByUserId != requesterId)
                throw new UnauthorizedAccessException("You do not have permission to view these execution logs.");

            return await _context.AiExecutionLogs
                .Where(l => l.AiWorkflowId == workflowId && l.IsActive)
                .OrderBy(l => l.Sequence)
                .Select(l => new AiExecutionLogDto
                {
                    Sequence = l.Sequence,
                    Step = l.Step,
                    Status = l.Status,
                    Message = l.Message,
                    OccurredAt = l.OccurredAt
                })
                .ToListAsync();
        }

        private async Task ApplyPlan(Trip trip, PlannerAgentResponseDto planner)
        {
            var stopIds = trip.Stops.Where(s => s.IsActive).ToDictionary(s => s.Id);

            foreach (var item in planner.Plan)
            {
                if (!Guid.TryParse(item.StopId, out var stopId) ||
                    !stopIds.TryGetValue(stopId, out var stop))
                    continue;

                stop.PlannedArrival = item.PlannedArrival.ToUniversalTime();
                stop.PlannedDeparture = item.PlannedDeparture.ToUniversalTime();

                // The Planner Agent only selects from Research Agent results,
                // but the backend re-checks the FK and approval state.
                if (Guid.TryParse(item.ExperienceId, out var experienceId))
                {
                    var experience = await _context.Experiences
                        .FirstOrDefaultAsync(e =>
                            e.Id == experienceId &&
                            e.IsActive &&
                            e.Status == ExperienceStatus.Approved &&
                            e.DestinationId == stop.DestinationId);

                    if (experience != null)
                        stop.ExperienceId = experience.Id;
                }

                if (!string.IsNullOrWhiteSpace(item.Notes))
                    stop.Notes = item.Notes;
            }
        }

        private async Task AddLog(
            Guid workflowId, int sequence, string step, string status, string message)
        {
            _context.AiExecutionLogs.Add(new AiExecutionLog
            {
                AiWorkflowId = workflowId,
                Sequence = sequence,
                Step = step,
                Status = status,
                Message = message,
                OccurredAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        private Task<AiWorkflow?> LoadWorkflow(Guid id) =>
            _context.AiWorkflows
                .Include(w => w.Trip)
                    .ThenInclude(t => t.Traveler)
                .Include(w => w.Trip)
                    .ThenInclude(t => t.Stops)
                        .ThenInclude(s => s.Destination)
                .Include(w => w.Trip)
                    .ThenInclude(t => t.Stops)
                        .ThenInclude(s => s.Experience)
                .Include(w => w.ExecutionLogs)
                .FirstOrDefaultAsync(w => w.Id == id && w.IsActive);

        private Task<Trip?> LoadTrip(Guid id) =>
            _context.Trips
                .Include(t => t.Traveler)
                .Include(t => t.Stops)
                    .ThenInclude(s => s.Destination)
                .Include(t => t.Stops)
                    .ThenInclude(s => s.Experience)
                .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

        private async Task<AiWorkflowResponseDto> BuildResponse(AiWorkflow workflow)
        {
            var planner = string.IsNullOrWhiteSpace(workflow.ResultJson)
                ? null
                : JsonSerializer.Deserialize<PlannerAgentResponseDto>(
                    workflow.ResultJson, JsonOptions);

            var validation = string.IsNullOrWhiteSpace(workflow.ValidationJson)
                ? null
                : JsonSerializer.Deserialize<TripValidationResult>(
                    workflow.ValidationJson, JsonOptions);

            return new AiWorkflowResponseDto
            {
                Id = workflow.Id,
                TripId = workflow.TripId,
                TripTitle = workflow.Trip.Title,
                Status = workflow.Status,
                CurrentStep = workflow.CurrentStep,
                StartedAt = workflow.StartedAt,
                CompletedAt = workflow.CompletedAt,
                ErrorMessage = workflow.ErrorMessage,
                ReviewNotes = workflow.ReviewNotes,
                Trip = MapTrip(workflow.Trip),
                PlannerResult = planner,
                Validation = validation,
                Logs = workflow.ExecutionLogs
                    .OrderBy(l => l.Sequence)
                    .Select(l => new AiExecutionLogDto
                    {
                        Sequence = l.Sequence,
                        Step = l.Step,
                        Status = l.Status,
                        Message = l.Message,
                        OccurredAt = l.OccurredAt
                    })
                    .ToList()
            };
        }

        private static AiWorkflowSummaryDto MapSummary(AiWorkflow w) => new()
        {
            Id = w.Id,
            TripId = w.TripId,
            TripTitle = w.Trip?.Title ?? "Trip",
            Status = w.Status,
            CurrentStep = w.CurrentStep,
            StartedAt = w.StartedAt,
            CompletedAt = w.CompletedAt,
            ErrorMessage = w.ErrorMessage,
            ReviewNotes = w.ReviewNotes
        };

        private static TripResponseDto MapTrip(Trip trip) => new()
        {
            Id = trip.Id,
            TravelerId = trip.TravelerId,
            TravelerName = trip.Traveler?.FullName ?? string.Empty,
            Title = trip.Title,
            Objective = trip.Objective,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            Constraints = trip.Constraints,
            Status = trip.Status.ToString(),
            ReviewNotes = trip.ReviewNotes,
            ReviewedAt = trip.ReviewedAt,
            CreatedAt = trip.CreatedAt,
            UpdatedAt = trip.UpdatedAt,
            Stops = trip.Stops
                .Where(s => s.IsActive)
                .OrderBy(s => s.StopOrder)
                .Select(s => new TripStopSummaryDto
                {
                    Id = s.Id,
                    StopOrder = s.StopOrder,
                    DestinationId = s.DestinationId,
                    DestinationName = s.Destination?.Name ?? string.Empty,
                    ExperienceId = s.ExperienceId,
                    ExperienceTitle = s.Experience?.Title,
                    PlannedArrival = s.PlannedArrival,
                    PlannedDeparture = s.PlannedDeparture,
                    Notes = s.Notes
                }).ToList()
        };
    }
}
