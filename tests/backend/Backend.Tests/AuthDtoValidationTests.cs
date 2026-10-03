using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Backend.DTOs;
using Xunit;

namespace Backend.Tests
{
    /// <summary>
    /// Member 1 – Backend/API & Database Testing.
    /// Validation tests for input DTOs using System.ComponentModel.DataAnnotations.
    /// Covers normal, invalid and boundary cases.
    /// </summary>
    public class AuthDtoValidationTests
    {
        // Triggers both property-level attributes AND IValidatableObject.Validate()
        private static List<ValidationResult> Validate(object dto)
        {
            var results = new List<ValidationResult>();
            var ctx = new ValidationContext(dto);
            Validator.TryValidateObject(dto, ctx, results, validateAllProperties: true);
            return results;
        }

        private static RegisterRequestDto ValidTraveler() => new RegisterRequestDto
        {
            FullName = "Test Traveler",
            Email = "traveler@test.com",
            Password = "Passw0rd!",
            PhoneNumber = "+94771234567",
            Role = "Traveler"
        };

        // ---------------- Normal case ----------------

        [Fact]
        public void RegisterRequest_ValidTraveler_HasNoValidationErrors()
        {
            var errors = Validate(ValidTraveler());
            Assert.Empty(errors);
        }

        [Fact]
        public void RegisterRequest_ValidLocalGuide_HasNoValidationErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Guide",
                Email = "guide@test.com",
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "LocalGuide",
                ProfileImageUrl = "https://example.com/photo.jpg",
                GuideBio = "Experienced guide",
                GuideCity = "Ella",
                LicenseNumber = "LG-001",
                YearsOfExperience = 5
            };

            var errors = Validate(dto);
            Assert.Empty(errors);
        }

        [Fact]
        public void RegisterRequest_ValidTravelAgent_HasNoValidationErrors()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Agent",
                Email = "agent@test.com",
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "TravelAgent",
                ProfileImageUrl = "https://example.com/photo.jpg",
                AgencyName = "Travel Co",
                AgentLicenseNumber = "TA-001"
            };

            var errors = Validate(dto);
            Assert.Empty(errors);
        }

        // ---------------- Invalid cases ----------------

        [Fact]
        public void RegisterRequest_InvalidEmail_ReturnsError()
        {
            var dto = ValidTraveler();
            dto.Email = "not-an-email";

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.Email)));
        }

        [Fact]
        public void RegisterRequest_ShortPassword_ReturnsError()
        {
            var dto = ValidTraveler();
            dto.Password = "123"; // less than 6

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.Password)));
        }

        [Fact]
        public void RegisterRequest_InvalidPhoneNumber_ReturnsError()
        {
            var dto = ValidTraveler();
            dto.PhoneNumber = "12345";

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.PhoneNumber)));
        }

        [Fact]
        public void RegisterRequest_EmptyFullName_ReturnsError()
        {
            var dto = ValidTraveler();
            dto.FullName = "";

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.FullName)));
        }

        // ---------------- Boundary cases ----------------

        [Fact]
        public void RegisterRequest_PasswordExactly6Chars_IsValid()
        {
            var dto = ValidTraveler();
            dto.Password = "123456"; // exactly 6

            var errors = Validate(dto);
            Assert.Empty(errors);
        }

        [Fact]
        public void RegisterRequest_PhoneStartingWith07_IsValid()
        {
            var dto = ValidTraveler();
            dto.PhoneNumber = "0712345678";

            var errors = Validate(dto);
            Assert.Empty(errors);
        }

        // ---------------- Role-specific rules ----------------

        [Fact]
        public void RegisterRequest_LocalGuideMissingBio_ReturnsError()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Guide",
                Email = "guide@test.com",
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "LocalGuide",
                ProfileImageUrl = "https://example.com/photo.jpg",
                GuideBio = "", // missing
                GuideCity = "Ella",
                LicenseNumber = "LG-001"
            };

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.GuideBio)));
        }

        [Fact]
        public void RegisterRequest_LocalGuideMissingProfileImage_ReturnsError()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Guide",
                Email = "guide@test.com",
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "LocalGuide",
                ProfileImageUrl = null, // missing
                GuideBio = "Bio",
                GuideCity = "Ella",
                LicenseNumber = "LG-001"
            };

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.ProfileImageUrl)));
        }

        [Fact]
        public void RegisterRequest_TravelAgentMissingAgencyName_ReturnsError()
        {
            var dto = new RegisterRequestDto
            {
                FullName = "Agent",
                Email = "agent@test.com",
                Password = "Passw0rd!",
                PhoneNumber = "+94771234567",
                Role = "TravelAgent",
                ProfileImageUrl = "https://example.com/photo.jpg",
                AgencyName = "", // missing
                AgentLicenseNumber = "TA-001"
            };

            var errors = Validate(dto);
            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(RegisterRequestDto.AgencyName)));
        }

        [Fact]
        public void RegisterRequest_TravelerWithNoPhoto_IsValid()
        {
            var dto = ValidTraveler();
            dto.ProfileImageUrl = null; // Traveler does NOT need a photo

            var errors = Validate(dto);
            Assert.Empty(errors);
        }

        // ---------------- LoginRequestDto ----------------

        [Fact]
        public void LoginRequest_EmptyEmail_ReturnsError()
        {
            var errors = Validate(new LoginRequestDto
            {
                Email = "",
                Password = "Passw0rd!"
            });

            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(LoginRequestDto.Email)));
        }

        [Fact]
        public void LoginRequest_EmptyPassword_ReturnsError()
        {
            var errors = Validate(new LoginRequestDto
            {
                Email = "user@test.com",
                Password = ""
            });

            Assert.Contains(errors, e =>
                e.MemberNames.Contains(nameof(LoginRequestDto.Password)));
        }

        [Fact]
        public void LoginRequest_ValidData_HasNoErrors()
        {
            var errors = Validate(new LoginRequestDto
            {
                Email = "user@test.com",
                Password = "Passw0rd!"
            });

            Assert.Empty(errors);
        }

        // ---------------- Default values (document current behavior) ----------------

        [Fact]
        public void BookingCreateDto_DefaultNumberOfGuests_IsOne()
        {
            var dto = new BookingCreateDto();
            Assert.Equal(1, dto.NumberOfGuests);
        }

        [Fact]
        public void PaymentProcessDto_DefaultMethod_IsMock()
        {
            var dto = new PaymentProcessDto();
            Assert.Equal("Mock", dto.Method);
        }
        // ============================================================
        // DEFECT REPRODUCTION TEST: DEF-001 (Review Rating Range)
        // ============================================================

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(6)]
        [InlineData(100)]
        public void ReviewCreateDto_RatingOutsideOneToFive_ReturnsValidationError(int invalidRating)
        {
            var dto = new ReviewCreateDto
            {
                BookingId = Guid.NewGuid(),
                ExperienceId = Guid.NewGuid(),
                Rating = invalidRating,
                Comment = "Test comment"
            };

            var errors = Validate(dto);

            // This assertion demands that Rating has validation errors when out of range (1-5)
            Assert.Contains(errors, e => e.MemberNames.Contains(nameof(ReviewCreateDto.Rating)));
        }
    }
}