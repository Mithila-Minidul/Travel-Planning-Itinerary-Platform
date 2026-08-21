using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialDatabaseSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IconName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Destinations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ProvinceState = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    CurrentSeason = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Destinations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LocalGuides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Bio = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LicenseNumber = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric", nullable: false),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalGuides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocalGuides_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Experiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GuideId = table.Column<Guid>(type: "uuid", nullable: false),
                    DestinationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DurationHours = table.Column<int>(type: "integer", nullable: false),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: false),
                    MeetingPoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CoverImageUrl = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsDynamicPricingEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    WeekendMultiplier = table.Column<decimal>(type: "numeric", nullable: false),
                    PeakSeasonMultiplier = table.Column<decimal>(type: "numeric", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalBookingsCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Experiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Experiences_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Experiences_Destinations_DestinationId",
                        column: x => x.DestinationId,
                        principalTable: "Destinations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Experiences_LocalGuides_GuideId",
                        column: x => x.GuideId,
                        principalTable: "LocalGuides",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Description", "IconName", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("22222222-2222-2222-2222-222222222221"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Scenic mountain and forest trails", "hiking", true, "Hiking & Trekking", new DateTime(2026, 8, 21, 17, 1, 9, 147, DateTimeKind.Utc).AddTicks(4463) },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tea factory visits and tasting sessions", "tea", true, "Tea & Plantation", new DateTime(2026, 8, 21, 17, 1, 9, 147, DateTimeKind.Utc).AddTicks(4484) },
                    { new Guid("22222222-2222-2222-2222-222222222223"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Temples, historic monuments, and heritage sites", "temple", true, "Culture & Heritage", new DateTime(2026, 8, 21, 17, 1, 9, 147, DateTimeKind.Utc).AddTicks(4488) }
                });

            migrationBuilder.InsertData(
                table: "Destinations",
                columns: new[] { "Id", "Country", "CreatedAt", "CurrentSeason", "Description", "ImageUrl", "IsActive", "Latitude", "Longitude", "Name", "ProvinceState", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333331"), "Sri Lanka", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "A scenic mountain town famous for hiking trails, waterfalls, and tea plantations.", null, true, 6.8666999999999998, 81.046599999999998, "Ella", "Uva Province", new DateTime(2026, 8, 21, 17, 1, 9, 147, DateTimeKind.Utc).AddTicks(4760) },
                    { new Guid("33333333-3333-3333-3333-333333333332"), "Sri Lanka", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 0, "The cultural capital home to the Temple of the Sacred Tooth Relic.", null, true, 7.2906000000000004, 80.633700000000005, "Kandy", "Central Province", new DateTime(2026, 8, 21, 17, 1, 9, 147, DateTimeKind.Utc).AddTicks(4767) }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "IsActive", "PasswordHash", "PhoneNumber", "Role", "UpdatedAt" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@travelapp.com", "System Administrator", true, "$2a$11$FDmBmJoiKkPRSap.yBW6u.E5U/Yxwol3wdarfvqgUiQLXpwTKGLCy", "+94770000000", 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_CategoryId",
                table: "Experiences",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_DestinationId",
                table: "Experiences",
                column: "DestinationId");

            migrationBuilder.CreateIndex(
                name: "IX_Experiences_GuideId",
                table: "Experiences",
                column: "GuideId");

            migrationBuilder.CreateIndex(
                name: "IX_LocalGuides_UserId",
                table: "LocalGuides",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Experiences");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Destinations");

            migrationBuilder.DropTable(
                name: "LocalGuides");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
