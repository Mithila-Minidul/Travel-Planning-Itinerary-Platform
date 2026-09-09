using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperiencesController : ControllerBase
    {
        private readonly IExperienceService _experienceService;

        public ExperiencesController(IExperienceService experienceService)
        {
            _experienceService = experienceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllApproved([FromQuery] Guid? destinationId, [FromQuery] Guid? categoryId)
            => Ok(await _experienceService.GetAllApprovedAsync(destinationId, categoryId));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, [FromQuery] DateTime? date)
            => Ok(await _experienceService.GetByIdAsync(id, date));

        [HttpGet("{id:guid}/price-calculation")]
        public async Task<IActionResult> CalculatePrice(Guid id, [FromQuery] DateTime date)
            => Ok(await _experienceService.CalculatePriceAsync(id, date));

        [Authorize(Roles = "LocalGuide")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var guideIdClaim = User.FindFirst("GuideId")?.Value;
            if (string.IsNullOrEmpty(guideIdClaim) || !Guid.TryParse(guideIdClaim, out var guideId))
            {
                return Forbid();
            }

            return Ok(await _experienceService.GetByGuideAsync(guideId));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
            => Ok(await _experienceService.GetPendingApprovalAsync());

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetForAdmin()
            => Ok(await _experienceService.GetForAdminAsync());

        [Authorize(Roles = "LocalGuide")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ExperienceCreateDto dto)
        {
            var guideIdClaim = User.FindFirst("GuideId")?.Value;
            if (string.IsNullOrEmpty(guideIdClaim) || !Guid.TryParse(guideIdClaim, out var guideId))
            {
                return Forbid();
            }

            var result = await _experienceService.CreateAsync(guideId, dto);
            return StatusCode(201, result);
        }

        [Authorize(Roles = "Admin,LocalGuide")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ExperienceCreateDto dto)
        {
            if (User.IsInRole("Admin"))
            {
                return Ok(await _experienceService.UpdateByAdminAsync(id, dto));
            }

            var guideIdClaim = User.FindFirst("GuideId")?.Value;
            if (string.IsNullOrEmpty(guideIdClaim) || !Guid.TryParse(guideIdClaim, out var guideId))
            {
                return Forbid();
            }

            return Ok(await _experienceService.UpdateAsync(guideId, id, dto));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _experienceService.DeleteByAdminAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] ExperienceStatus status)
            => Ok(await _experienceService.UpdateStatusAsync(id, status));

        // 🤖 Research Agent allow-listed Tool Endpoint
        [HttpPost("search-agent-tool")]
        public async Task<IActionResult> SearchForResearchAgent([FromBody] AgentExperienceSearchQueryDto query)
            => Ok(await _experienceService.SearchForResearchAgentAsync(query));
    }
}