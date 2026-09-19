using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAiItineraryService
    {
        Task<AiWorkflowResponseDto> GenerateAsync(Guid tripId, Guid travelerId);
        Task<AiWorkflowResponseDto> GetWorkflowAsync(Guid workflowId, Guid requesterId, bool canReviewAll);
        Task<AiWorkflowResponseDto> GetLatestForTripAsync(Guid tripId, Guid requesterId, bool canReviewAll);
        Task<IEnumerable<AiWorkflowSummaryDto>> GetPendingReviewsAsync();
        Task<AiWorkflowResponseDto> EditItineraryAsync(Guid workflowId, Guid reviewerId, AiItineraryEditRequestDto request);
        Task<AiWorkflowResponseDto> ApproveAsync(Guid workflowId, Guid reviewerId);
        Task<AiWorkflowResponseDto> RejectAsync(Guid workflowId, Guid reviewerId, string? notes);
        Task<AiWorkflowResponseDto> RequestRevisionAsync(Guid workflowId, Guid reviewerId, string? notes);
        Task<IEnumerable<AiExecutionLogDto>> GetLogsAsync(Guid workflowId, Guid requesterId, bool canReviewAll);
    }
}
