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

            // ── Private helper: extract & validate the authenticated user's Guid ──
            // Exact same pattern as TripsController.TryGetUserId().
            private bool TryGetUserId(out Guid userId)
            {
                userId = Guid.Empty;
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return !string.IsNullOrEmpty(claim) && Guid.TryParse(claim, out userId);
            }

    }
}
