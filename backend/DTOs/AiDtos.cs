using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    public class GenerateItineraryRequestDto
    {
        public Guid TripId { get; set; }
    }

    public class AiReviewRequestDto
    {
        public string? Notes { get; set; }
    }

    public class AiItineraryEditRequestDto
    {
        public List<PlannerStopPlanDto> Plan { get; set; } = new();
    }

    public class AiWorkflowSummaryDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string TripTitle { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CurrentStep { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ReviewNotes { get; set; }
    }

    public class AiExecutionLogDto
    {
        public int Sequence { get; set; }
        public string Step { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Message { get; set; }
        public DateTime OccurredAt { get; set; }
    }

    public class AiWorkflowResponseDto : AiWorkflowSummaryDto
    {
        public TripResponseDto? Trip { get; set; }
        public PlannerAgentResponseDto? PlannerResult { get; set; }
        public TripValidationResult? Validation { get; set; }
        public List<AiExecutionLogDto> Logs { get; set; } = new();
    }

    // Mirrors only the structured fields returned by the internal Python service.
    public class PlannerAgentResponseDto
    {
        public string AgentName { get; set; } = string.Empty;
        public string TripId { get; set; } = string.Empty;
        public string ExecutionStatus { get; set; } = string.Empty;
        public string DecisionSummary { get; set; } = string.Empty;
        public List<PlannerStopPlanDto> Plan { get; set; } = new();
        public List<PlannerResearchSummaryDto> Research { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class PlannerStopPlanDto
    {
        public string StopId { get; set; } = string.Empty;
        public int StopOrder { get; set; }
        public string DestinationName { get; set; } = string.Empty;
        public int DayNumber { get; set; }
        public DateTime PlannedArrival { get; set; }
        public DateTime PlannedDeparture { get; set; }
        public string? ExperienceId { get; set; }
        public string? ExperienceTitle { get; set; }
        public double EstimatedDurationHours { get; set; }
        public string? WeatherStatus { get; set; }
        public string? Notes { get; set; }
    }

    public class PlannerResearchSummaryDto
    {
        public string Destination { get; set; } = string.Empty;
        public string? WeatherCondition { get; set; }
        public string? WeatherSuitability { get; set; }
        public int CandidatesFound { get; set; }
        public string? SelectedExperience { get; set; }
        public string? SelectedExperienceId { get; set; }
    }
}
