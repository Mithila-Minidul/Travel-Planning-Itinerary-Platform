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
    }
}
