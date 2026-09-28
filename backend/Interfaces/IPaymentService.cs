using System;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> ProcessAsync(Guid bookingId, Guid travelerUserId, PaymentProcessDto dto);
        Task<PaymentResponseDto> RefundAsync(Guid bookingId, string? reason);
        Task<RefundPreviewDto> PreviewRefundAsync(Guid bookingId);
    }
}