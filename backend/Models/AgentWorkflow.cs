using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    /// <summary>
    /// One workflow run of the Python 4-agent system, linked to a Trip.
    /// Spec requires persisting workflow state for observability.
    /// </summary>
    public class AgentWorkflow : BaseEntity
    {
        // Link back to the Trip this workflow generated
        [Required]
        public Guid TripId { get; set; }
        public Trip Trip { get; set; } = null!;

        // PENDING | APPROVED | REJECTED | ERROR
        [Required, MaxLength(50)]
        public string Status { get; set; } = "PENDING";

        [MaxLength(500)]
        public string Objective { get; set; } = string.Empty;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Summary statistics
        public int TotalSteps { get; set; }
        public decimal TotalEstimatedCost { get; set; }
        public bool BudgetValid { get; set; }

        [MaxLength(200)]
        public string? WinningGuideName { get; set; }

        public ICollection<AgentExecutionLog> ExecutionLogs { get; set; }
            = new List<AgentExecutionLog>();
    }
}