using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Authorize(Roles = "Admin, TravelAgent, Traveler")]
    [ApiController]
    [Route("api/[controller]")]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/trips
        [HttpGet]
        public async Task<IActionResult> GetAllTrips()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Trip> query = _context.Trips
                .Include(t => t.TripStops)
                .Include(t => t.Traveler)
                .Include(t => t.TravelAgent);

            // Travelers only see their own trips
            if (userRole == "Traveler")
            {
                query = query.Where(t => t.TravelerId.ToString() == userId);
            }

            var trips = await query.Select(t => new TripResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Objective = t.Objective,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Budget = t.Budget,
                Status = t.Status,
                TravelerName = t.Traveler.FullName,
                TravelAgentName = t.TravelAgent != null ? t.TravelAgent.FullName : null,
                TripStops = t.TripStops.Select(s => new TripStopDto
                {
                    DayNumber = s.DayNumber,
                    Title = s.Title,
                    Description = s.Description,
                    Location = s.Location,
                    EstimatedCost = s.EstimatedCost,
                    OrderIndex = s.OrderIndex
                }).ToList()
            }).ToListAsync();

            return Ok(trips);
        }

        // POST: api/trips
        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromBody] TripCreateDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var trip = new Trip
            {
                Title = request.Title,
                Objective = request.Objective,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Budget = request.Budget,
                Constraints = request.Constraints,
                Status = "Pending",
                TravelerId = Guid.Parse(userId),
                TripStops = request.TripStops.Select(s => new TripStop
                {
                    DayNumber = s.DayNumber,
                    Title = s.Title,
                    Description = s.Description,
                    Location = s.Location,
                    EstimatedCost = s.EstimatedCost,
                    OrderIndex = s.OrderIndex
                }).ToList()
            };

            // TODO: Call the AI Python Service here to generate the itinerary
            // For now, we save the manually provided stops.

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Trip created successfully", tripId = trip.Id });
        }

        // PATCH: api/trips/{id}/review
        [HttpPatch("{id:guid}/review")]
        [Authorize(Roles = "Admin, TravelAgent")]
        public async Task<IActionResult> ReviewTrip(Guid id, [FromBody] TripReviewDto request)
        {
            var trip = await _context.Trips.FirstOrDefaultAsync(t => t.Id == id);
            if (trip == null) return NotFound(new { message = "Trip not found" });

            if (request.Status != "Approved" && request.Status != "Rejected")
                return BadRequest(new { message = "Status must be 'Approved' or 'Rejected'" });

            trip.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Trip successfully {request.Status}" });
        }
    }
}