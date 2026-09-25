using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    /// <summary>
    /// Exposes AI workflow audit data to the React web app.
    /// Travel Agents and Admins use this to review what the AI did.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AgentWorkflowsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgentWorkflowsController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // GET: api/AgentWorkflows?tripId={optional}
        // ============================================================
        [Authorize(Roles = "Admin,TravelAgent")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? tripId)
        {
            var query = _context.AgentWorkflows
                .Include(w => w.Trip).ThenInclude(t => t.Traveler)
                .Include(w => w.Trip).ThenInclude(t => t.Destination)
                .AsQueryable();

            if (tripId.HasValue)
                query = query.Where(w => w.TripId == tripId.Value);

            var list = await query
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new AgentWorkflowListDto
                {
                    Id = w.Id,
                    TripId = w.TripId,
                    TripTitle = w.Trip.Title,
                    TravelerName = w.Trip.Traveler.FullName,
                    DestinationName = w.Trip.Destination.Name,
                    Status = w.Status,
                    Objective = w.Objective,
                    TotalSteps = w.TotalSteps,
                    TotalEstimatedCost = w.TotalEstimatedCost,
                    BudgetValid = w.BudgetValid,
                    WinningGuideName = w.WinningGuideName,
                    StartedAt = w.StartedAt,
                    CompletedAt = w.CompletedAt,
                    CreatedAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(list);
        }

        // ============================================================
        // GET: api/AgentWorkflows/{id}
        // Full detail with all execution log rows, ordered.
        // ============================================================
        [Authorize(Roles = "Admin,TravelAgent")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var w = await _context.AgentWorkflows
                .Include(x => x.Trip).ThenInclude(t => t.Traveler)
                .Include(x => x.Trip).ThenInclude(t => t.Destination)
                .Include(x => x.ExecutionLogs)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (w == null)
                return NotFound(new { message = "Workflow not found." });

            var dto = new AgentWorkflowDetailDto
            {
                Id = w.Id,
                TripId = w.TripId,
                TripTitle = w.Trip.Title,
                TravelerName = w.Trip.Traveler.FullName,
                DestinationName = w.Trip.Destination.Name,
                Status = w.Status,
                Objective = w.Objective,
                TotalSteps = w.TotalSteps,
                TotalEstimatedCost = w.TotalEstimatedCost,
                BudgetValid = w.BudgetValid,
                WinningGuideName = w.WinningGuideName,
                StartedAt = w.StartedAt,
                CompletedAt = w.CompletedAt,
                CreatedAt = w.CreatedAt,
                ExecutionLogs = w.ExecutionLogs
                    .OrderBy(l => l.SequenceNumber)
                    .Select(l => new AgentExecutionLogDto
                    {
                        Id = l.Id,
                        SequenceNumber = l.SequenceNumber,
                        AgentName = l.AgentName,
                        Action = l.Action,
                        Status = l.Status,
                        Details = l.Details,
                        ExecutedAt = l.ExecutedAt,
                        ElapsedMs = l.ElapsedMs
                    })
                    .ToList()
            };

            return Ok(dto);
        }

        // ============================================================
        // GET: api/AgentWorkflows/by-trip/{tripId}
        // Returns the most recent workflow for a given trip.
        // Useful for showing the log directly on the Trip Detail page.
        // ============================================================
        [Authorize(Roles = "Admin,TravelAgent")]
        [HttpGet("by-trip/{tripId:guid}")]
        public async Task<IActionResult> GetByTrip(Guid tripId)
        {
            var w = await _context.AgentWorkflows
                .Include(x => x.Trip).ThenInclude(t => t.Traveler)
                .Include(x => x.Trip).ThenInclude(t => t.Destination)
                .Include(x => x.ExecutionLogs)
                .Where(x => x.TripId == tripId)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (w == null)
                return NotFound(new { message = "No workflow found for this trip." });

            var dto = new AgentWorkflowDetailDto
            {
                Id = w.Id,
                TripId = w.TripId,
                TripTitle = w.Trip.Title,
                TravelerName = w.Trip.Traveler.FullName,
                DestinationName = w.Trip.Destination.Name,
                Status = w.Status,
                Objective = w.Objective,
                TotalSteps = w.TotalSteps,
                TotalEstimatedCost = w.TotalEstimatedCost,
                BudgetValid = w.BudgetValid,
                WinningGuideName = w.WinningGuideName,
                StartedAt = w.StartedAt,
                CompletedAt = w.CompletedAt,
                CreatedAt = w.CreatedAt,
                ExecutionLogs = w.ExecutionLogs
                    .OrderBy(l => l.SequenceNumber)
                    .Select(l => new AgentExecutionLogDto
                    {
                        Id = l.Id,
                        SequenceNumber = l.SequenceNumber,
                        AgentName = l.AgentName,
                        Action = l.Action,
                        Status = l.Status,
                        Details = l.Details,
                        ExecutedAt = l.ExecutedAt,
                        ElapsedMs = l.ElapsedMs
                    })
                    .ToList()
            };

            return Ok(dto);
        }
    }
}