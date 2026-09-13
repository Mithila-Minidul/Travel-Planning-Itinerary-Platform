using System;
using Backend.Models;

namespace Backend.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user, Guid? guideId = null);
    }
}