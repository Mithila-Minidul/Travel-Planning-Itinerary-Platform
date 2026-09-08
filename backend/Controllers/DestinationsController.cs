using System;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DestinationsController : ControllerBase
    {
        private readonly IDestinationService _destinationService;
        public DestinationsController(IDestinationService destinationService) => _destinationService = destinationService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _destinationService.GetAllAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id) => Ok(await _destinationService.GetByIdAsync(id));

        [HttpGet("{id:guid}/weather")]
        public async Task<IActionResult> GetWeather(Guid id) => Ok(await _destinationService.GetDestinationWeatherAsync(id));

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DestinationCreateDto dto)
        {
            var result = await _destinationService.CreateAsync(dto);
            return StatusCode(201, result);
        }
    }
}