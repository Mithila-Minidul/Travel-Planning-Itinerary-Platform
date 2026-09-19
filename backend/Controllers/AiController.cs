using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AiController : ControllerBase
    {
        private readonly IAiItineraryService _aiService;

        public AiController(IAiItineraryService aiService) => _aiService = aiService;

        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return !string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out userId);
        }

        [Authorize(Roles = "Traveler,TravelAgent")]
        [HttpPost("generate-itinerary")]
        public async Task<IActionResult> Generate([FromBody] GenerateItineraryRequestDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                return Ok(await _aiService.GenerateAsync(dto.TripId, userId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "AI itinerary generation failed.", details = ex.Message });
            }
        }

        [Authorize(Roles = "Traveler,TravelAgent,Admin")]
        [HttpGet("workflows/{id:guid}")]
        public async Task<IActionResult> GetWorkflow(Guid id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var canReviewAll = User.IsInRole("TravelAgent") || User.IsInRole("Admin");
                return Ok(await _aiService.GetWorkflowAsync(id, userId, canReviewAll));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Traveler,TravelAgent,Admin")]
        [HttpGet("trips/{tripId:guid}/latest")]
        public async Task<IActionResult> GetLatestForTrip(Guid tripId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                var canReviewAll = User.IsInRole("TravelAgent") || User.IsInRole("Admin");
                return Ok(await _aiService.GetLatestForTripAsync(tripId, userId, canReviewAll));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [Authorize(Roles = "TravelAgent,Admin,TravelAgent")]
        [HttpGet("workflows/pending")]
        public async Task<IActionResult> GetPending()
            => Ok(await _aiService.GetPendingReviewsAsync());

        [Authorize(Roles = "TravelAgent,Admin")]
        [HttpPut("workflows/{id:guid}/itinerary")]
        public async Task<IActionResult> EditItinerary(Guid id, [FromBody] AiItineraryEditRequestDto request)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                return Ok(await _aiService.EditItineraryAsync(id, userId, request));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "TravelAgent,Admin")]
        [HttpPut("workflows/{id:guid}/approve")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] AiReviewRequestDto? dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                return Ok(await _aiService.ApproveAsync(id, userId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "TravelAgent,Admin")]
        [HttpPut("workflows/{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] AiReviewRequestDto? dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                return Ok(await _aiService.RejectAsync(id, userId, dto?.Notes));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "TravelAgent,Admin")]
        [HttpPut("workflows/{id:guid}/revise")]
        public async Task<IActionResult> Revise(Guid id, [FromBody] AiReviewRequestDto? dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            try
            {
                return Ok(await _aiService.RequestRevisionAsync(id, userId, dto?.Notes));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Traveler,TravelAgent,Admin")]
        [HttpGet("execution-logs/{id:guid}")]
        public async Task<IActionResult> Logs(Guid id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Invalid token claims." });

            var canReviewAll = User.IsInRole("TravelAgent") || User.IsInRole("Admin");
            try
            {
                return Ok(await _aiService.GetLogsAsync(id, userId, canReviewAll));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }
    }
}
