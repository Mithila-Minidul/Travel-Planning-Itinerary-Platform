using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Backend.DTOs;
using Xunit;

namespace Backend.Tests
{
    public class AuthDtoValidationTests
    {
        private static List<ValidationResult> Validate(object dto)
        {
            var results = new List<ValidationResult>();
            var ctx = new ValidationContext(dto);
            Validator.TryValidateObject(dto, ctx, results, validateAllProperties: true);
            return results;
        }

        // ==========================================
        // 1. REGISTER & LOGIN DTOs
        // ==========================================

        [Fact]
        public void RegisterRequest_ValidTraveler_HasNoValidationErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Valid Traveler",
                Email = "traveler@test.com",
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "Traveler"
            };
            Assert.Empty(Validate(dto));
        }

        [Fact]
        public void RegisterRequest_ValidLocalGuide_HasNoValidationErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Valid Guide",
                Email = "guide@test.com",
                Password = "Password123!",
                PhoneNumber = "+94771234567",
                Role = "LocalGuide",
                ProfileImageUrl = "https://example.com/photo.jpg",
                GuideBio = "Certified wildlife guide with 8 years experience.",
                GuideCity = "Kandy",
                LicenseNumber = "LG-9988",
                YearsOfExperience = 8
            };
            Assert.Empty(Validate(dto));
        }

        [Fact]
        public void RegisterRequest_ValidTravelAgent_HasNoValidationErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Valid Agent",
                Email = "agent@test.com",
                Password = "Password123!",
                PhoneNumber = "0094771234567",
                Role = "TravelAgent",
                ProfileImageUrl = "https://example.com/agent.jpg",
                AgencyName = "Lanka Holidays Pvt Ltd",
                AgentLicenseNumber = "TA-2026-01"
            };
            Assert.Empty(Validate(dto));
        }

        [Theory]
        [InlineData("")]
        [InlineData("not-an-email")]
        [InlineData("@missingusername.com")]
        [InlineData("missingatsign.com")]
        public void RegisterRequest_InvalidEmail_ReturnsError(string email)
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Name",
                Email = email,
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "Traveler"
            };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(RegisterRequestDto.Email)));
        }

        [Theory]
        [InlineData("")]
        [InlineData("12345")]
        public void RegisterRequest_ShortPassword_ReturnsError(string pass)
        {
            var dto = new RegisterRequestDto { FullName = "Name", Email = "a@b.com", Password = pass, PhoneNumber = "0771234567", Role = "Traveler" };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(RegisterRequestDto.Password)));
        }

        [Theory]
        [InlineData("12345")]
        [InlineData("0112345678")]
        [InlineData("+14155552671")]
        [InlineData("abcdefghij")]
        public void RegisterRequest_InvalidPhoneNumber_ReturnsError(string phone)
        {
            var dto = new RegisterRequestDto { FullName = "Name", Email = "a@b.com", Password = "Password123!", PhoneNumber = phone, Role = "Traveler" };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(RegisterRequestDto.PhoneNumber)));
        }

        [Fact]
        public void RegisterRequest_LocalGuideMissingRequiredFields_ReturnsErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Guide",
                Email = "g@test.com",
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "LocalGuide",
                ProfileImageUrl = "",
                GuideBio = "",
                GuideCity = "",
                LicenseNumber = ""
            };
            var errors = Validate(dto);
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.ProfileImageUrl)));
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.GuideBio)));
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.GuideCity)));
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.LicenseNumber)));
        }

        [Fact]
        public void RegisterRequest_TravelAgentMissingRequiredFields_ReturnsErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Agent",
                Email = "a@test.com",
                Password = "Password123!",
                PhoneNumber = "0771234567",
                Role = "TravelAgent",
                ProfileImageUrl = "",
                AgencyName = "",
                AgentLicenseNumber = ""
            };
            var errors = Validate(dto);
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.ProfileImageUrl)));
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.AgencyName)));
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(RegisterRequestDto.AgentLicenseNumber)));
        }

        [Fact]
        public void LoginRequest_EmptyFields_ReturnsErrors()
        {
            Assert.Contains(Validate(new LoginRequestDto { Email = "", Password = "Password123!" }), e => e.MemberNames.Contains(nameof(LoginRequestDto.Email)));
            Assert.Contains(Validate(new LoginRequestDto { Email = "user@test.com", Password = "" }), e => e.MemberNames.Contains(nameof(LoginRequestDto.Password)));
        }

        // ==========================================
        // 2. DESTINATION & EXPERIENCE DTOs
        // ==========================================

        [Fact]
        public void CategoryCreateDto_EmptyName_ReturnsError()
        {
            var dto = new CategoryCreateDto { Name = "", Description = "Test" };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(CategoryCreateDto.Name)));
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        [InlineData(51)]
        public void ExperienceCreateDto_CapacityOutOfRange_ReturnsError(int capacity)
        {
            var dto = new ExperienceCreateDto
            {
                DestinationId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid(),
                Title = "Hike",
                Description = "Description",
                BasePrice = 50,
                DurationHours = 3,
                MaxCapacity = capacity,
                AvailableWeekdays = new List<string> { "Monday" },
                StartTime = "08:00",
                EndTime = "12:00"
            };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(ExperienceCreateDto.MaxCapacity)));
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-10)]
        [InlineData(1001)]
        public void ExperienceCreateDto_BasePriceOutOfRange_ReturnsError(decimal price)
        {
            var dto = new ExperienceCreateDto
            {
                DestinationId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid(),
                Title = "Hike",
                Description = "Description",
                BasePrice = price,
                DurationHours = 3,
                MaxCapacity = 10,
                AvailableWeekdays = new List<string> { "Monday" },
                StartTime = "08:00",
                EndTime = "12:00"
            };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(ExperienceCreateDto.BasePrice)));
        }

        [Theory]
        [InlineData("25:00")]
        [InlineData("8:00")]
        [InlineData("invalid")]
        public void ExperienceCreateDto_InvalidTimeRegex_ReturnsError(string time)
        {
            var dto = new ExperienceCreateDto
            {
                DestinationId = Guid.NewGuid(),
                CategoryId = Guid.NewGuid(),
                Title = "Hike",
                Description = "Description",
                BasePrice = 50,
                DurationHours = 3,
                MaxCapacity = 10,
                AvailableWeekdays = new List<string> { "Monday" },
                StartTime = time,
                EndTime = "12:00"
            };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(ExperienceCreateDto.StartTime)));
        }

        // ==========================================
        // 3. TRIP & BOOKING DTOs
        // ==========================================

        [Theory]
        [InlineData(0)]
        [InlineData(-50)]
        public void TripCreateDto_InvalidBudget_ReturnsError(decimal budget)
        {
            var dto = new TripCreateDto
            {
                Title = "Trip",
                DestinationId = Guid.NewGuid(),
                StartDate = DateTime.UtcNow.AddDays(1),
                EndDate = DateTime.UtcNow.AddDays(3),
                Budget = budget
            };
            Assert.Contains(Validate(dto), e => e.MemberNames.Contains(nameof(TripCreateDto.Budget)));
        }

        [Fact]
        public void BookingPaymentDtos_DefaultValues_AreCorrect()
        {
            var bookingDto = new BookingCreateDto();
            Assert.Equal(1, bookingDto.NumberOfGuests);

            var paymentDto = new PaymentProcessDto();
            Assert.Equal("Mock", paymentDto.Method);
        }
    }
}