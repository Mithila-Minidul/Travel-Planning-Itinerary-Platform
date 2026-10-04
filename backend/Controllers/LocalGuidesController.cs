using System;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocalGuidesController : ControllerBase
    {
        private readonly ILocalGuideService _guideService;
        public LocalGuidesController(ILocalGuideService guideService) => _guideService = guideService;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GuideStatus? status) 
            => Ok(await _guideService.GetAllGuidesAsync(status));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id) 
            => Ok(await _guideService.GetGuideByIdAsync(id));

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:guid}/status")]
        // ✅ FIX: Use [FromQuery] instead of [FromBody]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] GuideStatus status) 
            => Ok(await _guideService.UpdateGuideStatusAsync(id, status));
        
                // 👇 ADDED: Get the logged-in guide's live stats (avg rating + review count)
        [Authorize(Roles = "LocalGuide")]
        [HttpGet("me/stats")]
        public async Task<IActionResult> GetMyStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            return Ok(await _guideService.GetMyStatsAsync(userId));
        }
        // 👇 ADDED: Delete guide account
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteGuide(Guid id)
        {
            try
            {
                await _guideService.DeleteGuideAsync(id);
                return Ok(new { message = "Guide account and all related data deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the guide.", details = ex.Message });
            }
        }
    }
}