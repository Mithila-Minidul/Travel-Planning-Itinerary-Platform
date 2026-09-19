using System;
using System.Collections.Generic;

namespace Backend.Models
{
    /// <summary>
    /// Persisted AI execution record for Member 2 itinerary generation.
    /// Stores workflow state and the structured result, not hidden model reasoning.
    /// </summary>
    public class AiWorkflow : BaseEntity
    {
        public Guid TripId { get; set; }
        public Trip Trip { get; set; } = null!;

        public Guid RequestedByUserId { get; set; }
        public User RequestedByUser { get; set; } = null!;

        public string Status { get; set; } = "Generating";
        public string CurrentStep { get; set; } = "Starting";
        public string? ErrorMessage { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        /// <summary>Structured Planner Agent response as JSON.</summary>
        public string? ResultJson { get; set; }

        /// <summary>Deterministic backend validation result as JSON.</summary>
        public string? ValidationJson { get; set; }

        public string? ReviewNotes { get; set; }

        public ICollection<AiExecutionLog> ExecutionLogs { get; set; } =
            new List<AiExecutionLog>();
    }

    public class AiExecutionLog : BaseEntity
    {
        public Guid AiWorkflowId { get; set; }
        public AiWorkflow AiWorkflow { get; set; } = null!;

        public int Sequence { get; set; }
        public string Step { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Message { get; set; }
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    }
}
