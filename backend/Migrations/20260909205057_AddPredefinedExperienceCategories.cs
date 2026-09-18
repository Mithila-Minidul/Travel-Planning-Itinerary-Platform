using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPredefinedExperienceCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                columns: new[] { "Name", "UpdatedAt" },
                values: new object[] { "Hiking", new DateTime(2026, 9, 9, 20, 50, 57, 78, DateTimeKind.Utc).AddTicks(9995) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 57, 78, DateTimeKind.Utc).AddTicks(9999));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(2));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Description", "IconName", "IsActive", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("22222222-2222-2222-2222-222222222224"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Coastal escapes, swimming, and surfing", "beach", true, "Beach & Surfing", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(5) },
                    { new Guid("22222222-2222-2222-2222-222222222225"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Wildlife encounters and safari tours", "wildlife", true, "Wildlife & Safari", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(7) },
                    { new Guid("22222222-2222-2222-2222-222222222226"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Scenic railway journeys across Sri Lanka", "train", true, "Train Journeys", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(9) },
                    { new Guid("22222222-2222-2222-2222-222222222227"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Waterfalls, forests, and natural landscapes", "nature", true, "Nature & Waterfalls", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(11) },
                    { new Guid("22222222-2222-2222-2222-222222222228"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Local food, markets, and cooking experiences", "food", true, "Food & Cooking", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(16) },
                    { new Guid("22222222-2222-2222-2222-222222222229"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Local festivals, celebrations, and events", "festival", true, "Festivals & Events", new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(18) }
                });

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(91));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 57, 79, DateTimeKind.Utc).AddTicks(96));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$hhxOUzke7HNBmYsqORwPWOFrOE69ToqtiNmi5YgoU59QXlK3NApCa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                columns: new[] { "Name", "UpdatedAt" },
                values: new object[] { "Hiking & Trekking", new DateTime(2026, 9, 9, 20, 50, 9, 783, DateTimeKind.Utc).AddTicks(9587) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 9, 783, DateTimeKind.Utc).AddTicks(9604));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 9, 783, DateTimeKind.Utc).AddTicks(9606));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 9, 783, DateTimeKind.Utc).AddTicks(9667));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 9, 20, 50, 9, 783, DateTimeKind.Utc).AddTicks(9673));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$47yKoY82ZDQOpjz7Uerw5OLsHIH96AvRHzUG1GZdJTRSCnDxfr/PG");
        }
    }
}
