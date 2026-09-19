using System.Text;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Load .env file
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Build PostgreSQL Connection String from .env
var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "travel_agentic_db";
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "postgres";
var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "postgres";

var connectionString =
    $"Host={dbHost};" +
    $"Port={dbPort};" +
    $"Database={dbName};" +
    $"Username={dbUser};" +
    $"Password={dbPass};" +
    "SSL Mode=Disable;" +
    "Trust Server Certificate=true;" +
    "Pooling=true;" +
    "Timeout=30;" +
    "Command Timeout=60;" +
    "Keepalive=30;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        connectionString,
        npgsqlOptions =>
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null
            )
    )
);

// ========================================
// Register Application Services
// ========================================

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddHttpClient<IWeatherService, WeatherService>();

builder.Services.AddHttpClient<
    Backend.Interfaces.ITravelTimeService,
    Backend.Services.TravelTimeService
>();

builder.Services.AddScoped<ImageUploadService>();

// Member 1 Services
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDestinationService, DestinationService>();
builder.Services.AddScoped<ILocalGuideService, LocalGuideService>();
builder.Services.AddScoped<IExperienceService, ExperienceService>();

// Trip Services
builder.Services.AddScoped<
    Backend.Interfaces.ITripService,
    Backend.Services.TripService
>();

builder.Services.AddScoped<
    Backend.Interfaces.ITripStopService,
    Backend.Services.TripStopService
>();

builder.Services.AddScoped<
    Backend.Interfaces.ITripValidationService,
    Backend.Services.TripValidationService
>();

// AI Itinerary Service
builder.Services.AddHttpClient<
    Backend.Interfaces.IAiItineraryService,
    Backend.Services.AiItineraryService
>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(90);
});

// ========================================
// Configure JWT Authentication
// ========================================

var jwtSecret =
    Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? "SuperSecretKeyForSE3090Assignment2026MustBeAtLeast32CharsLong!";

var jwtIssuer =
    Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? "TravelAppBackend";

var jwtAudience =
    Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? "TravelAppClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,

        IssuerSigningKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret)
            ),

        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,

        ValidateAudience = true,
        ValidAudience = jwtAudience,

        ValidateLifetime = true,

        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ========================================
// Controllers
// ========================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        )
    );

// ========================================
// CORS
// ========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// ========================================
// Swagger with JWT Support
// ========================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "Travel App Backend - SE3090",
            Version = "v1"
        }
    );

    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter 'Bearer' [space] followed by your JWT token"
        }
    );

    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        }
    );
});

// ========================================
// Build Application
// ========================================

var app = builder.Build();

// ========================================
// Swagger
// ========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ========================================
// Middleware
// ========================================

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// ========================================
// Controllers
// ========================================

app.MapControllers();

app.Run();