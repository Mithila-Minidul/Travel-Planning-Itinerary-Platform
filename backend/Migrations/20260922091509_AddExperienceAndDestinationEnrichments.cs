using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExperienceAndDestinationEnrichments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationPolicy",
                table: "Experiences",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FitnessLevel",
                table: "Experiences",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImportantNotes",
                table: "Experiences",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Languages",
                table: "Experiences",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinAge",
                table: "Experiences",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatIncluded",
                table: "Experiences",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatNotIncluded",
                table: "Experiences",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatToBring",
                table: "Experiences",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BestTimeToVisit",
                table: "Destinations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Highlights",
                table: "Destinations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdealDuration",
                table: "Destinations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222221"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5645));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5651));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222223"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5654));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222224"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5658));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222225"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5675));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222226"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5678));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222227"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5681));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222228"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5684));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222229"),
                column: "UpdatedAt",
                value: new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5687));

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333331"),
                columns: new[] { "BestTimeToVisit", "Highlights", "IdealDuration", "UpdatedAt" },
                values: new object[] { null, null, null, new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5778) });

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333332"),
                columns: new[] { "BestTimeToVisit", "Highlights", "IdealDuration", "UpdatedAt" },
                values: new object[] { null, null, null, new DateTime(2026, 9, 22, 9, 15, 8, 959, DateTimeKind.Utc).AddTicks(5784) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$YgMGRT/vI6lgFEkqZQ3FPecmlA1NZFfsFAG0pqJF0eJrxTdhSbyCm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancellationPolicy",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "FitnessLevel",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "ImportantNotes",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "MinAge",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "WhatIncluded",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "WhatNotIncluded",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "WhatToBring",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "BestTimeToVisit",
                table: "Destinations");

            migrationBuilder.DropColumn(
                name: "Highlights",
                table: "Destinations");

            migrationBuilder.DropColumn(
                name: "IdealDuration",
                table: "Destinations");

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
        }
    }
}
