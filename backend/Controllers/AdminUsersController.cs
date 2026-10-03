using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all registered Travel Agents (Pending & Approved)
        /// </summary>
                [HttpGet("travel-agents")]
        public async Task<IActionResult> GetTravelAgents()
        {
            var agents = await _context.Users
                .Where(u => u.Role == "TravelAgent")
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    ProfileImageUrl = u.ProfileImageUrl,
                    AgencyName = u.AgencyName,
                    AgentLicenseNumber = u.AgentLicenseNumber,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    Status = u.Status   // 👈 ADDED
                })
                .ToListAsync();

            return Ok(agents);
        }
                /// <summary>
        /// Get all registered Travelers (Auto-approved, just for viewing)
        /// </summary>
        [HttpGet("travelers")]
        public async Task<IActionResult> GetTravelers()
        {
            var travelers = await _context.Users
                .Where(u => u.Role == "Traveler")
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    ProfileImageUrl = u.ProfileImageUrl,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(travelers);
        }

        /// <summary>
        /// Admin approves or rejects a Travel Agent account.
        /// Status values: "Active" | "Rejected"
        /// </summary>
        [HttpPatch("travel-agents/{id:guid}/status")]
        public async Task<IActionResult> UpdateAgentStatus(Guid id, [FromBody] UserStatusUpdateDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "TravelAgent");

            if (user == null)
            {
                return NotFound(new { message = "Travel Agent not found." });
            }

            var newStatus = dto.Status?.Trim() ?? string.Empty;

            if (newStatus != "Active" && newStatus != "Rejected")
            {
                return BadRequest(new { message = "Status must be 'Active' or 'Rejected'." });
            }

            user.Status = newStatus;
            user.IsActive = newStatus == "Active";  // keep the old boolean in sync

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Travel Agent status updated to {newStatus}.",
                status = user.Status,
                isActive = user.IsActive
            });
        }
        /// <summary>
        /// Aggregated recent activity feed for the Admin dashboard.
        /// Merges latest events across Users, Experiences, Bookings, Payments, Reviews.
        /// </summary>
        [HttpGet("recent-activity")]
        public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 5)
        {
            if (limit < 1) limit = 5;
            if (limit > 20) limit = 20;

            var items = new List<RecentActivityDto>();

            // 1) Recent user registrations (Travelers, Local Guides, Travel Agents — not Admin)
            var recentUsers = await _context.Users
                .Where(u => u.Role != "Admin")
                .OrderByDescending(u => u.CreatedAt)
                .Take(limit)
                .Select(u => new { u.Id, u.Role, u.FullName, u.Email, u.CreatedAt })
                .ToListAsync();

            items.AddRange(recentUsers.Select(u => new RecentActivityDto
            {
                Id = u.Id,
                Type = "user",
                Title = u.Role == "LocalGuide" ? "New Local Guide registered"
                    : u.Role == "TravelAgent" ? "New Travel Agent registered"
                    : "New Traveler registered",
                Subtitle = $"{u.FullName} · {u.Email}",
                Timestamp = DateTime.SpecifyKind(u.CreatedAt, DateTimeKind.Utc),
                Role = u.Role
            }));

            // 2) Recent pending experiences
            var recentExperiences = await _context.Experiences
                .Where(e => e.Status == ExperienceStatus.PendingApproval)
                .OrderByDescending(e => e.CreatedAt)
                .Take(limit)
                .Select(e => new { e.Id, e.Title, e.CreatedAt, GuideName = e.Guide.User.FullName })
                .ToListAsync();

            items.AddRange(recentExperiences.Select(e => new RecentActivityDto
            {
                Id = e.Id,
                Type = "experience",
                Title = "New experience awaiting approval",
                Subtitle = $"{e.Title} · by {e.GuideName}",
                Timestamp = DateTime.SpecifyKind(e.CreatedAt, DateTimeKind.Utc),
                Role = null
            }));

            // 3) Recent bookings
            var recentBookings = await _context.Bookings
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .Select(b => new
                {
                    b.Id,
                    b.CreatedAt,
                    TravelerName = b.Traveler.FullName,
                    ExperienceTitle = b.Experience.Title
                })
                .ToListAsync();

            items.AddRange(recentBookings.Select(b => new RecentActivityDto
            {
                Id = b.Id,
                Type = "booking",
                Title = "New booking placed",
                Subtitle = $"{b.TravelerName} · {b.ExperienceTitle}",
                Timestamp = DateTime.SpecifyKind(b.CreatedAt, DateTimeKind.Utc),
                Role = null
            }));

            // 4) Recent payments
            var recentPayments = await _context.Payments
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.CreatedAt,
                    p.Status,
                    p.Amount,
                    p.Currency,
                    TravelerName = p.Booking.Traveler.FullName
                })
                .ToListAsync();

            items.AddRange(recentPayments.Select(p => new RecentActivityDto
            {
                Id = p.Id,
                Type = "payment",
                Title = p.Status == "Succeeded" ? "Payment received" : $"Payment {p.Status}",
                Subtitle = $"{p.Currency} {p.Amount:0.00} · {p.TravelerName}",
                Timestamp = DateTime.SpecifyKind(p.CreatedAt, DateTimeKind.Utc),
                Role = null
            }));

            // 5) Recent reviews
            var recentReviews = await _context.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .Select(r => new
                {
                    r.Id,
                    r.CreatedAt,
                    r.Rating,
                    TravelerName = r.Traveler.FullName,
                    ExperienceTitle = r.Experience.Title
                })
                .ToListAsync();

            items.AddRange(recentReviews.Select(r => new RecentActivityDto
            {
                Id = r.Id,
                Type = "review",
                Title = $"New {r.Rating}-star review",
                Subtitle = $"{r.TravelerName} · {r.ExperienceTitle}",
                Timestamp = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc),
                Role = null
            }));

            // Merge and take the top N newest across all categories
            var result = items
                .OrderByDescending(i => i.Timestamp)
                .Take(limit)
                .ToList();

            return Ok(result);
        }
        /// <summary>
        /// Admin permanently deletes a Travel Agent account and unlinks associated trips.
        /// </summary>
        [HttpDelete("travel-agents/{id:guid}")]
        public async Task<IActionResult> DeleteTravelAgent(Guid id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "TravelAgent");

            if (user == null)
            {
                return NotFound(new { message = "Travel Agent not found." });
            }

            // Unlink travel agent from any assigned trips safely
            var trips = await _context.Trips
                .Where(t => t.TravelAgentId == id)
                .ToListAsync();

            foreach (var trip in trips)
            {
                trip.TravelAgentId = null;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel Agent account deleted successfully." });
        }
    }
}