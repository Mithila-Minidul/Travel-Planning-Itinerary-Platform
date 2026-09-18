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

    }
}
