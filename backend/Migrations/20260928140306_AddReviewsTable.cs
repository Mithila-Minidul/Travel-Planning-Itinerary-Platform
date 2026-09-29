using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookingId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExperienceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TravelerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    GuideReply = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RepliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Experiences_ExperienceId",
                        column: x => x.ExperienceId,
                        principalTable: "Experiences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_TravelerId",
                        column: x => x.TravelerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5950));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5958));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5961));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5963));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5965));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5979));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5981));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5983));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(5985));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(6181));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 28, 14, 3, 5, 745, DateTimeKind.Utc).AddTicks(6185));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$EUK9WXDAfEwDt4QtN9j6DOsisn1R5H3BfrBN5wi958gTicu9syf3W");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_BookingId",
                table: "Reviews",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ExperienceId",
                table: "Reviews",
                column: "ExperienceId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TravelerId",
                table: "Reviews",
                column: "TravelerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3918));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3938));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3942));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3945));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3949));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3952));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3955));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3958));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(3961));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(4069));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 7, 45, 47, 845, DateTimeKind.Utc).AddTicks(4076));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$.8B8VdYOb8w8/48bXCMqZe/m/PzkJZojbrrPWJRweq8lIxSPuLZRm");
        }
    }
}
