﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TodoApp.Data;

#nullable disable

namespace TodoApp.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250307180042_UpdateTaskItemSchema")]
    partial class UpdateTaskItemSchema
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.1");

            modelBuilder.Entity("TodoApp.Models.TaskItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("StartTime")
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValue("NotStarted");

                    b.Property<long>("TimeSpent")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER")
                        .HasDefaultValue(0L);

                    b.HasKey("Id");

                    b.HasIndex("StartTime");

                    b.HasIndex("Status");

                    b.ToTable("TaskItems", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
