using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace Backend.Services
{
    public class ImageUploadService
    {
        private readonly Cloudinary _cloudinary;

        public ImageUploadService(IConfiguration config)
        {
            var account = new Account(
                config["CLOUDINARY_CLOUD_NAME"],
                config["CLOUDINARY_API_KEY"],
                config["CLOUDINARY_API_SECRET"]
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0) throw new ArgumentException("No image was provided.");

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"tripcraft/{folder}"
            };
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                throw new InvalidOperationException(uploadResult.Error.Message);

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<bool> DeleteImageAsync(string url)
        {
            var match = Regex.Match(url, @"/upload/(?:v\d+/)?(?<publicId>.+)\.[^/.]+$", RegexOptions.IgnoreCase);
            if (!match.Success) return false;

            var result = await _cloudinary.DestroyAsync(new DeletionParams(match.Groups["publicId"].Value)
            {
                ResourceType = ResourceType.Image
            });
            return result.Result == "ok" || result.Result == "not found";
        }
    }
}