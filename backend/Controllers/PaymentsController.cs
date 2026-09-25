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
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _payments;
        public PaymentsController(IPaymentService payments) => _payments = payments;

        private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // ============================================================
        // POST: api/Payments/process/{bookingId}   (Traveler pays)
        // ============================================================
        [Authorize(Roles = "Traveler")]
        [HttpPost("process/{bookingId:guid}")]
        public async Task<IActionResult> Process(Guid bookingId, [FromBody] PaymentProcessDto dto)
        {
            try
            {
                return Ok(await _payments.ProcessAsync(bookingId, UserId, dto));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // GET: api/Payments/{bookingId}/refund-preview
        // ============================================================
        [Authorize(Roles = "Traveler,Admin")]
        [HttpGet("{bookingId:guid}/refund-preview")]
        public async Task<IActionResult> PreviewRefund(Guid bookingId)
        {
            try
            {
                return Ok(await _payments.PreviewRefundAsync(bookingId));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // POST: api/Payments/{bookingId}/refund   (Admin override)
        // ============================================================
        [Authorize(Roles = "Admin")]
        [HttpPost("{bookingId:guid}/refund")]
        public async Task<IActionResult> Refund(Guid bookingId, [FromBody] RefundRequestDto dto)
        {
            try
            {
                return Ok(await _payments.RefundAsync(bookingId, dto?.Reason));
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}