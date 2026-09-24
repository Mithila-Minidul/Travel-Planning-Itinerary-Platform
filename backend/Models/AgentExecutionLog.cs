using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    /// <summary>
    /// One step in a workflow — one agent's action, timing, and result.
    /// Powers the React "AI Execution Log" observability page.
    /// </summary>
    public class AgentExecutionLog : BaseEntity
    {
        [Required]
        public Guid AgentWorkflowId { get; set; }
        public AgentWorkflow AgentWorkflow { get; set; } = null!;

        // 1, 2, 3... in the order they ran
        public int SequenceNumber { get; set; }

        // Planner | Research | Orchestrator | Budget | Approval
        [Required, MaxLength(50)]
        public string AgentName { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Action { get; set; } = string.Empty;

        // SUCCESS | WARNING | ERROR
        [Required, MaxLength(20)]
        public string Status { get; set; } = "SUCCESS";

        [MaxLength(2000)]
        public string Details { get; set; } = string.Empty;

        public DateTime ExecutedAt { get; set; }

        // Time elapsed since the previous step (or since workflow start for step 1)
        public long ElapsedMs { get; set; }
    }
}