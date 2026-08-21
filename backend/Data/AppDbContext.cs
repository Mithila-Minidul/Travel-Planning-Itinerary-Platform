using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<LocalGuide> LocalGuides => Set<LocalGuide>();
        public DbSet<Destination> Destinations => Set<Destination>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Experience> Experiences => Set<Experience>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<LocalGuide>(entity =>
            {
                entity.HasOne(g => g.User)
                      .WithOne(u => u.LocalGuideProfile)
                      .HasForeignKey<LocalGuide>(g => g.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Experience>(entity =>
            {
                entity.HasOne(e => e.Guide)
                      .WithMany(g => g.Experiences)
                      .HasForeignKey(e => e.GuideId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Destination)
                      .WithMany(d => d.Experiences)
                      .HasForeignKey(e => e.DestinationId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Experiences)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Admin & Default categories
            SeedInitialData(modelBuilder);
        }

        private static void SeedInitialData(ModelBuilder modelBuilder)
        {
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456");

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = adminId,
                FullName = "System Administrator",
                Email = "admin@travelapp.com",
                PasswordHash = adminPasswordHash,
                PhoneNumber = "+94770000000",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });

            var catHikingId = Guid.Parse("22222222-2222-2222-2222-222222222221");
            var catTeaId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var catCultureId = Guid.Parse("22222222-2222-2222-2222-222222222223");

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = catHikingId, Name = "Hiking & Trekking", Description = "Scenic mountain and forest trails", IconName = "hiking", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = catTeaId, Name = "Tea & Plantation", Description = "Tea factory visits and tasting sessions", IconName = "tea", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = catCultureId, Name = "Culture & Heritage", Description = "Temples, historic monuments, and heritage sites", IconName = "temple", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            var destEllaId = Guid.Parse("33333333-3333-3333-3333-333333333331");
            var destKandyId = Guid.Parse("33333333-3333-3333-3333-333333333332");

            modelBuilder.Entity<Destination>().HasData(
                new Destination
                {
                    Id = destEllaId,
                    Name = "Ella",
                    ProvinceState = "Uva Province",
                    Country = "Sri Lanka",
                    Description = "A scenic mountain town famous for hiking trails, waterfalls, and tea plantations.",
                    Latitude = 6.8667,
                    Longitude = 81.0466,
                    CurrentSeason = SeasonType.Peak,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Destination
                {
                    Id = destKandyId,
                    Name = "Kandy",
                    ProvinceState = "Central Province",
                    Country = "Sri Lanka",
                    Description = "The cultural capital home to the Temple of the Sacred Tooth Relic.",
                    Latitude = 7.2906,
                    Longitude = 80.6337,
                    CurrentSeason = SeasonType.Regular,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}