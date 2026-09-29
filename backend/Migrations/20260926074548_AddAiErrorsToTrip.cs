using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAiErrorsToTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiErrors",
                table: "Trips",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiErrors",
                table: "Trips");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9369));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9388));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9391));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9393));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9396));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9398));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9400));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9402));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9403));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9466));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 26, 4, 18, 48, 206, DateTimeKind.Utc).AddTicks(9470));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$TRKfxWWRseOVUPHoMsSF3eVJf8LMYOfuw9a8YFKSd52c0M7DWElRG");
        }
    }
}
