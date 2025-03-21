using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "TimeSpent",
                table: "TaskItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItems",
                type: "TEXT",
                nullable: false,
                defaultValue: "NotStarted",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.CreateIndex(
                name: "IX_TaskItems_StartTime",
                table: "TaskItems",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_TaskItems_Status",
                table: "TaskItems",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskItems_StartTime",
                table: "TaskItems");

            migrationBuilder.DropIndex(
                name: "IX_TaskItems_Status",
                table: "TaskItems");

            migrationBuilder.AlterColumn<long>(
                name: "TimeSpent",
                table: "TaskItems",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "INTEGER",
                oldDefaultValue: 0L);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItems",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldDefaultValue: "NotStarted");
        }
    }
}
