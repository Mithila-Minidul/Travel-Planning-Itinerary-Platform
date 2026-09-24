using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    /// <summary>
    /// Full result of the Python 4-agent workflow.
    /// </summary>
    public class PlannerResult
    {
        public List<TripStop> Stops { get; set; } = new();
        public Guid? WinningGuideId { get; set; }
        public string? WinningGuideName { get; set; }
        public bool BudgetValid { get; set; }
        public decimal TotalEstimatedCost { get; set; }
        public string ApprovalStatus { get; set; } = "PENDING";
        public List<ExecutionLogEntry> ExecutionLog { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// One audit-log row from the Python workflow.
    /// </summary>
    public class ExecutionLogEntry
    {
        [JsonPropertyName("agent")]     public string Agent { get; set; } = "";
        [JsonPropertyName("action")]    public string Action { get; set; } = "";
        [JsonPropertyName("status")]    public string Status { get; set; } = "SUCCESS";
        [JsonPropertyName("timestamp")] public string Timestamp { get; set; } = "";
        [JsonPropertyName("details")]   public string Details { get; set; } = "";
    }

    public interface IPlannerAgentService
    {
        Task<PlannerResult> GenerateItineraryAsync(
            Guid tripId,
            Guid destinationId,
            string destinationName,
            DateTime startDate,
            DateTime endDate,
            decimal budget,
            string interests,
            string travelGroup,
            int numberOfTravelers,
            string budgetTier,
            string travelPace,
            string preferredTimes,
            string specialRequests);
    }

    /// <summary>
    /// Phase A: Calls the Python AI microservice
    /// (Planner → Research → Budget → Approval).
    /// Returns the itinerary + audit log to the controller.
    /// </summary>
    public class PlannerAgentService : IPlannerAgentService
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<PlannerAgentService> _logger;

        public PlannerAgentService(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<PlannerAgentService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _config = config;
            _logger = logger;
        }

        public async Task<PlannerResult> GenerateItineraryAsync(
            Guid tripId,
            Guid destinationId,
            string destinationName,
            DateTime startDate,
            DateTime endDate,
            decimal budget,
            string interests,
            string travelGroup,
            int numberOfTravelers,
            string budgetTier,
            string travelPace,
            string preferredTimes,
            string specialRequests)
        {
            // ---- Build the request body Python expects (snake_case) ----
            var requestBody = new
            {
                trip_id = tripId.ToString(),
                destination_id = destinationId.ToString(),
                destination_name = destinationName,
                start_date = startDate.ToUniversalTime().ToString("o"),
                end_date = endDate.ToUniversalTime().ToString("o"),
                budget = (double)budget,
                interests = ParseCommaList(interests),
                travel_group = string.IsNullOrWhiteSpace(travelGroup) ? "Solo" : travelGroup,
                number_of_travelers = numberOfTravelers <= 0 ? 1 : numberOfTravelers,
                budget_tier = string.IsNullOrWhiteSpace(budgetTier) ? "Mid" : budgetTier,
                travel_pace = string.IsNullOrWhiteSpace(travelPace) ? "Balanced" : travelPace,
                preferred_times = ParseCommaList(preferredTimes),
                special_requests = specialRequests ?? ""
            };

            var baseUrl = _config["AI_SERVICE_URL"] ?? "http://localhost:8000";
            var url = $"{baseUrl}/api/agents/generate-itinerary";

            _logger.LogInformation("Calling Python AI service: {Url}", url);

            try
            {
                var client = _httpClientFactory.CreateClient("AiService");
                client.Timeout = TimeSpan.FromSeconds(60);

                var response = await client.PostAsJsonAsync(url, requestBody);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var dto = JsonSerializer.Deserialize<ItineraryResponseDto>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                if (dto == null)
                    throw new Exception("AI service returned an empty response.");

                // ---- Map Python stops → C# TripStop entities ----
                var stops = (dto.Stops ?? new List<StopDto>())
                    .Select(s => new TripStop
                    {
                        ExperienceId = Guid.TryParse(s.ExperienceId, out var expId) ? expId : null,
                        DayNumber = s.DayNumber,
                        Title = s.Title,
                        Description = s.Description,
                        Location = s.Location,
                        EstimatedCost = (decimal)s.EstimatedCost,
                        OrderIndex = s.OrderIndex
                    })
                    .ToList();

                // ---- Parse winning guide id ----
                Guid? winnerGuideId = null;
                if (!string.IsNullOrWhiteSpace(dto.WinningGuideId) &&
                    Guid.TryParse(dto.WinningGuideId, out var gid))
                {
                    winnerGuideId = gid;
                }

                return new PlannerResult
                {
                    Stops = stops,
                    WinningGuideId = winnerGuideId,
                    WinningGuideName = dto.WinningGuideName,
                    BudgetValid = dto.BudgetValid,
                    TotalEstimatedCost = (decimal)dto.TotalEstimatedCost,
                    ApprovalStatus = dto.ApprovalStatus ?? "PENDING",
                    ExecutionLog = dto.ExecutionLog ?? new List<ExecutionLogEntry>(),
                    Errors = dto.Errors ?? new List<string>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI service call failed.");
                return new PlannerResult
                {
                    Stops = new List<TripStop>(),
                    Errors = new List<string> { $"AI service unavailable: {ex.Message}" },
                    ApprovalStatus = "ERROR"
                };
            }
        }

        // ---------- Helpers ----------
        private static List<string> ParseCommaList(string? input)
        {
            if (string.IsNullOrWhiteSpace(input)) return new List<string>();
            return input
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
        }

        // ---------- Response DTOs (snake_case from Python) ----------
        private class ItineraryResponseDto
        {
            [JsonPropertyName("trip_id")]              public string? TripId { get; set; }
            [JsonPropertyName("stops")]                public List<StopDto>? Stops { get; set; }
            [JsonPropertyName("winning_guide_id")]     public string? WinningGuideId { get; set; }
            [JsonPropertyName("winning_guide_name")]   public string? WinningGuideName { get; set; }
            [JsonPropertyName("budget_valid")]         public bool BudgetValid { get; set; }
            [JsonPropertyName("total_estimated_cost")] public double TotalEstimatedCost { get; set; }
            [JsonPropertyName("approval_status")]      public string? ApprovalStatus { get; set; }
            [JsonPropertyName("execution_log")]        public List<ExecutionLogEntry>? ExecutionLog { get; set; }
            [JsonPropertyName("errors")]               public List<string>? Errors { get; set; }
        }

        private class StopDto
        {
            [JsonPropertyName("experience_id")]  public string? ExperienceId { get; set; }
            [JsonPropertyName("day_number")]     public int DayNumber { get; set; }
            [JsonPropertyName("title")]          public string Title { get; set; } = "";
            [JsonPropertyName("description")]    public string Description { get; set; } = "";
            [JsonPropertyName("location")]       public string Location { get; set; } = "";
            [JsonPropertyName("estimated_cost")] public double EstimatedCost { get; set; }
            [JsonPropertyName("order_index")]    public int OrderIndex { get; set; }
        }
    }
}