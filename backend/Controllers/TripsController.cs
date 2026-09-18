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
    public class TripsController : ControllerBase
    {
        private readonly ITripService _tripService;
        private readonly ITripValidationService _validationService;

        public TripsController(ITripService tripService, ITripValidationService validationService)
        {
            _tripService = tripService;
            _validationService = validationService;
        }

        // ── Private helper: extract & validate the authenticated user's Guid ──
        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out userId);
        }


        [Authorize(Roles = "TravelAgent,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetTrips()
        {
            try
            {
                if (User.IsInRole("Admin"))
                {
                    return Ok(await _tripService.GetAllForAdminAsync());
                }

                if (!TryGetUserId(out var userId))
                    return Unauthorized(new { message = "Invalid token claims." });

                return Ok(await _tripService.GetByTravelerAsync(userId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving trips.", details = ex.Message });
            }
        }

          [Authorize(Roles = ",Admin")]
                [HttpGet("{id:guid}")]
                public async Task<IActionResult> GetById(Guid id)
                {
                    try
                    {
                        if (!TryGetUserId(out var userId))
                            return Unauthorized(new { message = "Invalid token claims." });

                        bool isAdmin = User.IsInRole("Admin");
                        var trip = await _tripService.GetByIdAsync(id, userId, isAdmin);
                        return Ok(trip);
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
                        return StatusCode(500, new { message = "An error occurred while retrieving the trip.", details = ex.Message });
                    }
                }

                [Authorize(Roles = "TravelAgent")]
                        [HttpPost]
                        public async Task<IActionResult> Create([FromBody] TripCreateDto dto)
                        {
                            try
                            {
                                if (!TryGetUserId(out var userId))
                                    return Unauthorized(new { message = "Invalid token claims." });

                                var result = await _tripService.CreateAsync(userId, dto);
                                return StatusCode(201, result);
                            }
                            catch (InvalidOperationException ex)
                            {
                                return BadRequest(new { message = ex.Message });
                            }
                            catch (KeyNotFoundException ex)
                            {
                                return NotFound(new { message = ex.Message });
                            }
                            catch (Exception ex)
                            {
                                return StatusCode(500, new { message = "An error occurred while creating the trip.", details = ex.Message });
                            }
                        }

                        // ══════════════════════════════════════════════════════════════════════
                        // PUT /api/Trips/{id}
                        // Updates a trip.  Only the owning Traveler may update (Draft only).
                        // ══════════════════════════════════════════════════════════════════════
                        [Authorize(Roles = "TravelAgent")]
                        [HttpPut("{id:guid}")]
                        public async Task<IActionResult> Update(Guid id, [FromBody] TripUpdateDto dto)
                        {
                            try
                            {
                                if (!TryGetUserId(out var userId))
                                    return Unauthorized(new { message = "Invalid token claims." });

                                var result = await _tripService.UpdateAsync(userId, id, dto);
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
                            catch (Exception ex)
                            {
                                return StatusCode(500, new { message = "An error occurred while updating the trip.", details = ex.Message });
                            }
                        }

                        // ══════════════════════════════════════════════════════════════════════
                        // DELETE /api/Trips/{id}
                        // Traveler: soft-deletes their own trip.
                        // Admin:    soft-deletes any trip.
                        // ══════════════════════════════════════════════════════════════════════
                        [Authorize(Roles = "Traveler,Admin")]
                        [HttpDelete("{id:guid}")]
                        public async Task<IActionResult> Delete(Guid id)
                        {
                            try
                            {
                                if (!TryGetUserId(out var userId))
                                    return Unauthorized(new { message = "Invalid token claims." });

                                if (User.IsInRole("Admin"))
                                {
                                    await _tripService.DeleteByAdminAsync(id);
                                }
                                else
                                {
                                    await _tripService.DeleteAsync(userId, id);
                                }

                                return NoContent();
                            }
                            catch (KeyNotFoundException ex)
                            {
                                return NotFound(new { message = ex.Message });
                            }
                            catch (Exception ex)
                            {
                                return StatusCode(500, new { message = "An error occurred while deleting the trip.", details = ex.Message });
                            }
                        }


    }
}
