using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviews;
        public ReviewsController(IReviewService reviews) => _reviews = reviews;

        private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        private string Role => User.FindFirst(ClaimTypes.Role)!.Value;

        [Authorize(Roles = "Traveler")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReviewCreateDto dto)
        {
            try
            {
                return StatusCode(201, await _reviews.CreateAsync(UserId, dto));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize(Roles = "Traveler,Admin")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ReviewUpdateDto dto)
        {
            try
            {
                // 👇 FIXED: Passed Role to service
                return Ok(await _reviews.UpdateAsync(id, UserId, Role, dto));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [Authorize(Roles = "Traveler,Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _reviews.DeleteAsync(id, UserId, Role);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [Authorize(Roles = "LocalGuide,Admin")] // 👈 ADDED Admin
        [HttpPatch("{id:guid}/reply")]
        public async Task<IActionResult> Reply(Guid id, [FromBody] ReviewReplyDto dto)
        {
            try
            {
                // 👈 PASSED Role
                return Ok(await _reviews.ReplyAsync(id, UserId, Role, dto.Reply));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [Authorize(Roles = "LocalGuide,Admin")]
        [HttpDelete("{id:guid}/reply")]
        public async Task<IActionResult> DeleteReply(Guid id)
        {
            try
            {
                await _reviews.DeleteReplyAsync(id, UserId, Role);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [AllowAnonymous]
        [HttpGet("experience/{experienceId:guid}")]
        public async Task<IActionResult> GetForExperience(Guid experienceId)
        {
            return Ok(await _reviews.GetForExperienceAsync(experienceId));
        }

        [Authorize(Roles = "LocalGuide")]
        [HttpGet("guide")]
        public async Task<IActionResult> GetForGuide()
        {
            return Ok(await _reviews.GetForGuideAsync(UserId));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _reviews.GetAllAsync());
        }
    }
}