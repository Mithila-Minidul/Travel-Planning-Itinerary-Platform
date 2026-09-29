using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTripBuilderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BudgetTier",
                table: "Trips",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfTravelers",
                table: "Trips",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PreferredTimes",
                table: "Trips",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecialRequests",
                table: "Trips",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelGroup",
                table: "Trips",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelPace",
                table: "Trips",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1054));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1065));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1070));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1075));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1079));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1083));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1106));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1111));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1277));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1422));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 23, 5, 5, 26, 734, DateTimeKind.Utc).AddTicks(1432));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$JlJ.Fny92I2fdDYAqiXYx.Y5Ph0dPyQUi/NwWeDo0Af1IqRNvcE7S");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BudgetTier",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "NumberOfTravelers",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "PreferredTimes",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "SpecialRequests",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "TravelGroup",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "TravelPace",
                table: "Trips");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8002));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8114));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8119));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8123));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8128));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8133));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8137));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8140));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8142));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8458));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 12, 3, 35, 686, DateTimeKind.Utc).AddTicks(8468));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$PlL5A0S2G35wtcF.24d/6.vWXmkIa185EnkvYYZFwQLG/BIfzouAe");
        }
    }
}
