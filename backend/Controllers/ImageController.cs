using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly ImageUploadService _imageService;

        // ✅ Allow-listed folders
        private static readonly string[] AllowedFolders = new[]
        {
            "profile-photos",
            "experiences",
            "destinations",
            "categories",
            "reviews"
        };

        public ImageController(ImageUploadService imageService)
        {
            _imageService = imageService;
        }

        [Authorize]
        [HttpPost("upload/{folder}")]
        public async Task<IActionResult> Upload(string folder, IFormFile file)
        {
            // Validate folder name
            if (!AllowedFolders.Contains(folder))
            {
                return BadRequest(new { message = $"Invalid folder. Allowed: {string.Join(", ", AllowedFolders)}" });
            }

            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File must be less than 5MB." });

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Only JPEG, PNG, WEBP allowed." });

            try
            {
                var url = await _imageService.UploadImageAsync(file, folder);
                return Ok(new { url, folder });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Upload failed.", details = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
                return BadRequest(new { message = "URL required." });

            var success = await _imageService.DeleteImageAsync(url);
            if (!success)
                return BadRequest(new { message = "Delete failed." });

            return Ok(new { message = "Image deleted." });
        }
    }
}