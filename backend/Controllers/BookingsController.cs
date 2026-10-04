using System;
using System.Linq;
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
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookings;
        public BookingsController(IBookingService bookings) => _bookings = bookings;

        private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        private string Role => User.FindFirst(ClaimTypes.Role)!.Value;

        // ============================================================
        // POST: api/Bookings   (Traveler books a trip stop)
        // ============================================================
        [Authorize(Roles = "Traveler")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookingCreateDto dto)
        {
            try
            {
                var result = await _bookings.CreateAsync(UserId, dto);
                return StatusCode(201, result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // GET: api/Bookings   (role-aware list)
        // ============================================================
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Role switch
            {
                "Traveler"   => Ok(await _bookings.GetForTravelerAsync(UserId)),
                "LocalGuide" => Ok(await _bookings.GetForGuideAsync(UserId)),
                "Admin"      => Ok(await _bookings.GetAllAsync()),
                _            => Forbid()
            };
        }

        // ============================================================
        // GET: api/Bookings/{id}
        // ============================================================
        [Authorize]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                return Ok(await _bookings.GetByIdAsync(id, UserId, Role));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        // ============================================================
        // PATCH: api/Bookings/{id}/confirm   (Guide)
        // ============================================================
        [Authorize(Roles = "LocalGuide")]
        [HttpPatch("{id:guid}/confirm")]
        public async Task<IActionResult> Confirm(Guid id)
        {
            try
            {
                return Ok(await _bookings.ConfirmAsync(id, UserId));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
                // ============================================================
        // PATCH: api/Bookings/{id}/reject   (Guide)
        // ============================================================
        [Authorize(Roles = "LocalGuide")]
        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] BookingCancelDto dto)
        {
            try
            {
                return Ok(await _bookings.RejectAsync(id, UserId, dto?.Reason));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // PATCH: api/Bookings/{id}/cancel   (Traveler or Admin)
        // ============================================================
        [Authorize(Roles = "Traveler,Admin")]
        [HttpPatch("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id, [FromBody] BookingCancelDto dto)
        {
            try
            {
                return Ok(await _bookings.CancelAsync(id, UserId, Role, dto?.Reason));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // PATCH: api/Bookings/{id}/check-in   (Guide, with code)
        // ============================================================
        [Authorize(Roles = "LocalGuide")]
        [HttpPatch("{id:guid}/check-in")]
        public async Task<IActionResult> CheckIn(Guid id, [FromQuery] string code)
        {
            try
            {
                return Ok(await _bookings.CheckInAsync(id, code));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // POST: api/Bookings/check-in-by-code   (Guide scans QR)
        // ============================================================
        [Authorize(Roles = "LocalGuide")]
        [HttpPost("check-in-by-code")]
        public async Task<IActionResult> CheckInByCode([FromBody] CheckInByCodeDto dto)
        {
            try
            {
                return Ok(await _bookings.CheckInByCodeAsync(dto.ConfirmationCode));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================ // 👈 ADD THIS BLOCK
        // GET: api/Bookings/earnings   (Guide's total earnings)
        // ============================================================
        [Authorize(Roles = "LocalGuide")]
        [HttpGet("earnings")]
        public async Task<IActionResult> GetTotalEarnings()
        {
            try
            {
                var total = await _bookings.GetTotalEarningsAsync(UserId);
                return Ok(new { totalEarnings = total });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // ============================================================
        // DELETE: api/Bookings/{id}   (Admin or Traveler Owner)
        // ============================================================
        [Authorize(Roles = "Admin,Traveler")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _bookings.DeleteAsync(id, UserId, Role);
                return Ok(new { message = "Booking and related records deleted successfully." });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the booking.", details = ex.Message });
            }
        }
    }

    public class CheckInByCodeDto
    {
        public string ConfirmationCode { get; set; } = "";
    }
    
}