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
    [Route("api/trips/{tripId:guid}/stops")]
    public class TripStopsController : ControllerBase
    {

    private readonly ITripStopService _tripStopService;

            public TripStopsController(ITripStopService tripStopService)
            {
                _tripStopService = tripStopService;
            }


            private bool TryGetUserId(out Guid userId)
            {
                userId = Guid.Empty;
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out userId);
            }

                     [Authorize(Roles = "Traveler,Admin")]
                     [HttpGet]
                    public async Task<IActionResult> GetStops(Guid tripId)
                    {
                        try
                        {
                            if (!TryGetUserId(out var userId))
                                return Unauthorized(new { message = "Invalid token claims." });

                            bool isAdmin = User.IsInRole("Admin");
                            var stops = await _tripStopService.GetByTripAsync(tripId, userId, isAdmin);
                            return Ok(stops);
                        }
                        catch (KeyNotFoundException ex)
                        {
                            return NotFound(new { message = ex.Message });
                        }
                        catch (UnauthorizedAccessException ex)
                        {
                            return StatusCode(403, new { message = ex.Message });
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, new { message = "An error occurred while retrieving trip stops.", details = ex.Message });
                        }
                    }


                    [Authorize(Roles = "Traveler,Admin")]
                    [HttpGet("{stopId:guid}")]
                    public async Task<IActionResult> GetById(Guid tripId, Guid stopId)
                    {
                        try
                        {
                            if (!TryGetUserId(out var userId))
                                return Unauthorized(new { message = "Invalid token claims." });

                            bool isAdmin = User.IsInRole("Admin");
                            var stop = await _tripStopService.GetByIdAsync(stopId, userId, isAdmin);
                            return Ok(stop);
                        }
                        catch (KeyNotFoundException ex)
                        {
                            return NotFound(new { message = ex.Message });
                        }
                        catch (UnauthorizedAccessException ex)
                        {
                            return StatusCode(403, new { message = ex.Message });
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, new { message = "An error occurred while retrieving the trip stop.", details = ex.Message });
                        }
                    }


        [Authorize(Roles = "Traveler")]
        [HttpPost]
        public async Task<IActionResult> Create(Guid tripId, [FromBody] TripStopCreateDto dto)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { message = "Invalid token claims." });

                var result = await _tripStopService.CreateAsync(tripId, userId, dto);
                return StatusCode(201, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the trip stop.", details = ex.Message });
            }
        }


        [Authorize(Roles = "Traveler")]
        [HttpPut("{stopId:guid}")]
        public async Task<IActionResult> Update(Guid tripId, Guid stopId, [FromBody] TripStopUpdateDto dto)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { message = "Invalid token claims." });

                var result = await _tripStopService.UpdateAsync(stopId, userId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the trip stop.", details = ex.Message });
            }
        }


        [Authorize(Roles = "Traveler")]
        [HttpDelete("{stopId:guid}")]
        public async Task<IActionResult> Delete(Guid tripId, Guid stopId)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { message = "Invalid token claims." });

                await _tripStopService.DeleteAsync(stopId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the trip stop.", details = ex.Message });
            }
        }


    }
}
