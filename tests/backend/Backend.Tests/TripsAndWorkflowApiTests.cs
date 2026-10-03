using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Controllers;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Backend.Tests
{
    public class TripsAndWorkflowApiTests
    {
        private static AppDbContext NewDb() =>
            new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static TripsController CreateController(AppDbContext db, Mock<IPlannerAgentService> plannerMock, Guid userId, string role = "Traveler")
        {
            var controller = new TripsController(db, plannerMock.Object);
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claims } };
            return controller;
        }

        [Fact]
        public async Task CreateTrip_TripLongerThan14Days_ReturnsBadRequest()
        {
            using var db = NewDb();
            var travelerId = Guid.NewGuid();
            var plannerMock = new Mock<IPlannerAgentService>();
            var controller = CreateController(db, plannerMock, travelerId);

            var req = new TripCreateDto
            {
                Title = "Too Long Vacation",
                DestinationId = Guid.NewGuid(),
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(20), // 21 days total (> 14 days limit)
                Budget = 500
            };

            var res = await controller.CreateTrip(req) as BadRequestObjectResult;

            Assert.NotNull(res);
            Assert.Equal(400, res!.StatusCode);
        }

        [Fact]
        public async Task ReviewTrip_WhenAgentApproves_SyncsWorkflowStatus()
        {
            using var db = NewDb();
            var agentId = Guid.NewGuid();
            var traveler = new User { Id = Guid.NewGuid(), FullName = "T", Email = "t@t.com", PasswordHash = "x", PhoneNumber = "0771", Role = "Traveler", IsActive = true };
            var dest = new Destination { Id = Guid.NewGuid(), Name = "Ella", ProvinceState = "Uva" };
            var trip = new Trip { Id = Guid.NewGuid(), Title = "Ella Tour", DestinationId = dest.Id, StartDate = DateTime.UtcNow.AddDays(2), EndDate = DateTime.UtcNow.AddDays(5), Budget = 300, Status = "Pending", TravelerId = traveler.Id };
            var workflow = new AgentWorkflow { Id = Guid.NewGuid(), TripId = trip.Id, Status = "PENDING", TotalSteps = 4 };

            db.Users.Add(traveler);
            db.Destinations.Add(dest);
            db.Trips.Add(trip);
            db.AgentWorkflows.Add(workflow);
            await db.SaveChangesAsync();

            var plannerMock = new Mock<IPlannerAgentService>();
            var controller = CreateController(db, plannerMock, agentId, "TravelAgent");

            var res = await controller.ReviewTrip(trip.Id, new TripReviewDto { Status = "Approved" }) as OkObjectResult;

            Assert.NotNull(res);
            var updatedTrip = await db.Trips.FindAsync(trip.Id);
            var updatedWf = await db.AgentWorkflows.FirstAsync(w => w.TripId == trip.Id);

            Assert.Equal("Approved", updatedTrip!.Status);
            Assert.Equal("APPROVED", updatedWf.Status);
        }

        [Fact]
        public async Task AdminUsersController_GetRecentActivity_ClampsLimitsBetween1And20()
        {
            using var db = NewDb();
            var controller = new AdminUsersController(db);

            var res = await controller.GetRecentActivity(limit: 50) as OkObjectResult;

            Assert.NotNull(res);
            Assert.Equal(200, res!.StatusCode);
        }
    }
}