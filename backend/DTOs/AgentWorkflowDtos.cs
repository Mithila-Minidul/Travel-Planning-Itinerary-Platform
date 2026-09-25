using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    /// <summary>
    /// Row shown on the React AI Execution Log list page.
    /// </summary>
    public class AgentWorkflowListDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public string TripTitle { get; set; } = string.Empty;
        public string TravelerName { get; set; } = string.Empty;
        public string DestinationName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;      // PENDING | APPROVED | REJECTED | ERROR
        public string Objective { get; set; } = string.Empty;
        public int TotalSteps { get; set; }
        public decimal TotalEstimatedCost { get; set; }
        public bool BudgetValid { get; set; }
        public string? WinningGuideName { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Full workflow detail — includes all AgentExecutionLog rows in order.
    /// </summary>
    public class AgentWorkflowDetailDto : AgentWorkflowListDto
    {
        public List<AgentExecutionLogDto> ExecutionLogs { get; set; } = new();
    }

    /// <summary>
    /// One agent step: who ran, what they did, when, how long.
    /// </summary>
    public class AgentExecutionLogDto
    {
        public Guid Id { get; set; }
        public int SequenceNumber { get; set; }
        public string AgentName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;      // SUCCESS | WARNING | ERROR
        public string Details { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; }
        public long ElapsedMs { get; set; }
    }
}