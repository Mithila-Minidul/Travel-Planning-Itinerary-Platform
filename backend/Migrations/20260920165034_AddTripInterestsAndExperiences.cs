using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTripInterestsAndExperiences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_TravelAgentId",
                table: "Trips");

            migrationBuilder.AddColumn<Guid>(
                name: "ExperienceId",
                table: "TripStops",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DestinationId",
                table: "Trips",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Interests",
                table: "Trips",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5267));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5277));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5282));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5287));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5292));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5298));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5302));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5316));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5320));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5470));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 16, 50, 33, 567, DateTimeKind.Utc).AddTicks(5481));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$LDZnGsY0wp7AntFlPZ4XkOlYr2wOeooScfoAJg.bR0e0roWhko5iG");

            migrationBuilder.CreateIndex(
                name: "IX_TripStops_ExperienceId",
                table: "TripStops",
                column: "ExperienceId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DestinationId",
                table: "Trips",
                column: "DestinationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Destinations_DestinationId",
                table: "Trips",
                column: "DestinationId",
                principalTable: "Destinations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_TravelAgentId",
                table: "Trips",
                column: "TravelAgentId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TripStops_Experiences_ExperienceId",
                table: "TripStops",
                column: "ExperienceId",
                principalTable: "Experiences",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Destinations_DestinationId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_Trips_Users_TravelAgentId",
                table: "Trips");

            migrationBuilder.DropForeignKey(
                name: "FK_TripStops_Experiences_ExperienceId",
                table: "TripStops");

            migrationBuilder.DropIndex(
                name: "IX_TripStops_ExperienceId",
                table: "TripStops");

            migrationBuilder.DropIndex(
                name: "IX_Trips_DestinationId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ExperienceId",
                table: "TripStops");

            migrationBuilder.DropColumn(
                name: "DestinationId",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Interests",
                table: "Trips");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5161));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5169));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5174));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5179));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5183));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5188));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5205));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5210));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5214));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5342));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 20, 15, 20, 59, 815, DateTimeKind.Utc).AddTicks(5349));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$ckweQ0Um9XnVNJzPKUAroe7S7YESl8fvIqQnVwzIQ3cb7zZfkyzMe");

            migrationBuilder.AddForeignKey(
                name: "FK_Trips_Users_TravelAgentId",
                table: "Trips",
                column: "TravelAgentId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
