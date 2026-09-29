using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;
        public ReviewService(AppDbContext context) => _context = context;

        public async Task<ReviewResponseDto> CreateAsync(Guid travelerId, ReviewCreateDto dto)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == dto.BookingId && b.TravelerId == travelerId)
                ?? throw new KeyNotFoundException("Booking not found or not yours.");

            if (booking.Status != "Completed")
                throw new InvalidOperationException("You can only review completed trips.");

            var tripStop = await _context.TripStops.FirstOrDefaultAsync(ts => ts.TripId == booking.TripId && ts.ExperienceId == dto.ExperienceId);
            if (tripStop == null)
                throw new InvalidOperationException("This experience is not part of your trip.");

            var existing = await _context.Reviews.FirstOrDefaultAsync(r => r.BookingId == dto.BookingId && r.ExperienceId == dto.ExperienceId);
            if (existing != null)
                throw new InvalidOperationException("You have already reviewed this experience for this trip.");

            var review = new Review
            {
                BookingId = dto.BookingId,
                ExperienceId = dto.ExperienceId,
                TravelerId = travelerId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.Reviews.Add(review);
            await UpdateExperienceRating(dto.ExperienceId);
            await _context.SaveChangesAsync();
            return await MapAsync(review.Id);
        }

        public async Task<ReviewResponseDto> UpdateAsync(Guid reviewId, Guid userId, string role, ReviewUpdateDto dto)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId)
                ?? throw new KeyNotFoundException("Review not found.");

            // 👇 FIXED: Admin can edit any review, Traveler can only edit their own
            if (role != "Admin" && review.TravelerId != userId)
                throw new UnauthorizedAccessException("You can only edit your own reviews.");

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            
            await UpdateExperienceRating(review.ExperienceId);
            await _context.SaveChangesAsync();
            return await MapAsync(review.Id);
        }

        public async Task DeleteAsync(Guid reviewId, Guid userId, string role)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId)
                ?? throw new KeyNotFoundException("Review not found.");

            if (role != "Admin" && review.TravelerId != userId)
                throw new UnauthorizedAccessException("You can only delete your own reviews.");

            _context.Reviews.Remove(review);
            await UpdateExperienceRating(review.ExperienceId);
            await _context.SaveChangesAsync();
        }

        public async Task<ReviewResponseDto> ReplyAsync(Guid reviewId, Guid userId, string role, string reply)
{
        var review = await _context.Reviews.Include(r => r.Experience).ThenInclude(e => e.Guide)
            .FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new KeyNotFoundException("Review not found.");

        // 👇 FIXED: Allow Admin to reply/edit reply
        if (role != "Admin" && review.Experience.Guide.UserId != userId)
            throw new UnauthorizedAccessException("You can only reply to reviews for your own experiences.");

        review.GuideReply = reply;
        review.RepliedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await MapAsync(review.Id);
    }

        public async Task DeleteReplyAsync(Guid reviewId, Guid userId, string role)
        {
            var review = await _context.Reviews.Include(r => r.Experience).ThenInclude(e => e.Guide)
                .FirstOrDefaultAsync(r => r.Id == reviewId)
                ?? throw new KeyNotFoundException("Review not found.");

            if (role != "Admin" && review.Experience.Guide.UserId != userId)
                throw new UnauthorizedAccessException("You can only delete replies for your own experiences.");

            review.GuideReply = null;
            review.RepliedAt = null;
            await _context.SaveChangesAsync();
        }

        // Helper to recalculate average rating
        private async Task UpdateExperienceRating(Guid experienceId)
        {
            var experience = await _context.Experiences.FindAsync(experienceId);
            if (experience != null)
            {
                var reviews = await _context.Reviews.Where(r => r.ExperienceId == experienceId).ToListAsync();
                experience.Rating = reviews.Any() ? (decimal)reviews.Average(r => r.Rating) : 0.0m;
            }
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetForExperienceAsync(Guid experienceId)
        {
            return await _context.Reviews
                .Include(r => r.Experience)
                .Include(r => r.Traveler)
                .Where(r => r.ExperienceId == experienceId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapDto(r))
                .ToListAsync();
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetForGuideAsync(Guid guideUserId)
        {
            var guide = await _context.LocalGuides.FirstOrDefaultAsync(g => g.UserId == guideUserId);
            if (guide == null) return new List<ReviewResponseDto>();

            return await _context.Reviews
                .Include(r => r.Experience)
                .Include(r => r.Traveler)
                .Where(r => r.Experience.GuideId == guide.Id)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapDto(r))
                .ToListAsync();
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(r => r.Experience)
                .Include(r => r.Traveler)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapDto(r))
                .ToListAsync();
        }

        private async Task<ReviewResponseDto> MapAsync(Guid id)
        {
            var r = await _context.Reviews
                .Include(x => x.Experience)
                .Include(x => x.Traveler)
                .FirstAsync(x => x.Id == id);
            return MapDto(r);
        }

        private static ReviewResponseDto MapDto(Review r) => new()
        {
            Id = r.Id,
            ExperienceId = r.ExperienceId,
            ExperienceTitle = r.Experience?.Title ?? "",
            TravelerId = r.TravelerId, // 👈 ADDED
            TravelerName = r.Traveler?.FullName ?? "Traveler",
            TravelerProfileImageUrl = r.Traveler?.ProfileImageUrl,
            Rating = r.Rating,
            Comment = r.Comment,
            GuideReply = r.GuideReply,
            RepliedAt = r.RepliedAt,
            CreatedAt = r.CreatedAt
        };
    }
}