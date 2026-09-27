using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _payments;
        private readonly PayHereService _payhere;

        public PaymentsController(IPaymentService payments, PayHereService payhere)
        {
            _payments = payments;
            _payhere = payhere;
        }

        private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // ============================================================
        // POST: api/Payments/process/{bookingId}   (Mock / offline)
        // ============================================================
        [Authorize(Roles = "Traveler")]
        [HttpPost("process/{bookingId:guid}")]
        public async Task<IActionResult> Process(Guid bookingId, [FromBody] PaymentProcessDto dto)
        {
            try { return Ok(await _payments.ProcessAsync(bookingId, UserId, dto)); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // POST: api/Payments/initiate-payhere/{bookingId}
        // Traveler → gets a payload to pass to PayHere SDK
        // ============================================================
        [Authorize(Roles = "Traveler")]
        [HttpPost("initiate-payhere/{bookingId:guid}")]
        public async Task<IActionResult> InitiatePayHere(Guid bookingId)
        {
            try { return Ok(await _payhere.BuildCheckoutAsync(bookingId, UserId)); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ============================================================
        // POST: api/Payments/payhere-notify  (PayHere server → us)
        // Anonymous — PayHere does not send a JWT
        // ============================================================
        [AllowAnonymous]
        [HttpPost("payhere-notify")]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> PayHereNotify()
        {
            var form = Request.Form;
            var merchantId = form["merchant_id"].ToString();
            var orderId    = form["order_id"].ToString();
            var amount     = form["payhere_amount"].ToString();
            var currency   = form["payhere_currency"].ToString();
            var statusCode = form["status_code"].ToString();
            var md5sig     = form["md5sig"].ToString();

            var expectedMerchant = Environment.GetEnvironmentVariable("PAYHERE_MERCHANT_ID") ?? "";
            if (merchantId != expectedMerchant)
                return BadRequest(new { message = "Bad merchant." });

            if (!_payhere.VerifyNotifySignature(merchantId, orderId, amount, currency, statusCode, md5sig))
                return BadRequest(new { message = "Bad signature." });

            if (statusCode == "2")
                await _payhere.HandleSuccessfulPaymentAsync(orderId);

            return Ok();
        }

        // ============================================================
        // Redirect stubs (web flow only)
        // ============================================================
        [AllowAnonymous]
        [HttpGet("payhere-return")]
        public IActionResult PayHereReturn() => Ok(new { message = "Payment completed." });

        [AllowAnonymous]
        [HttpGet("payhere-cancel")]
        public IActionResult PayHereCancel() => Ok(new { message = "Payment cancelled." });

        // ============================================================
        // GET: api/Payments/{bookingId}/refund-preview
        // ============================================================
        [Authorize(Roles = "Traveler,Admin")]
        [HttpGet("{bookingId:guid}/refund-preview")]
        public async Task<IActionResult> PreviewRefund(Guid bookingId)
        {
            try { return Ok(await _payments.PreviewRefundAsync(bookingId)); }
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
            try { return Ok(await _payments.RefundAsync(bookingId, dto?.Reason)); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}