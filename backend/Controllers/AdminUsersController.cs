using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            // ✅ FIX: Compare string with string
            var agents = await _context.Users
                .Where(u => u.Role == "TravelAgent")  // ✅ String, not enum
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
                    IsActive = u.IsActive
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
        /// Admin approves or disables a Travel Agent account
        /// </summary>
        [HttpPatch("travel-agents/{id:guid}/status")]
        public async Task<IActionResult> UpdateAgentStatus(Guid id, [FromBody] UserStatusUpdateDto dto)
        {
            // ✅ FIX: Compare string with string
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == "TravelAgent");  // ✅ String, not enum

            if (user == null)
            {
                return NotFound(new { message = "Travel Agent not found." });
            }

            user.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Travel Agent status updated to {(user.IsActive ? "Active/Approved" : "Inactive")}" });
        }
    }
}