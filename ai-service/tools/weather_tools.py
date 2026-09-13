import httpx
from typing import Optional
from config.settings import settings
from models.schemas import DestinationWeather

async def get_destination_weather_tool(destination_name: str) -> Optional[DestinationWeather]:
    """
    Allow-listed tool that gets live weather from ASP.NET Core Web API.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Step 1: Find Destination ID
        dest_url = f"{settings.BACKEND_API_BASE_URL}/Destinations"
        dest_response = await client.get(dest_url)
        dest_response.raise_for_status()
        destinations = dest_response.json()

        target_dest = next((d for d in destinations if d["name"].lower() == destination_name.lower()), None)
        if not target_dest:
            return None

        # Step 2: Fetch Weather for that Destination
        dest_id = target_dest["id"]
        weather_url = f"{settings.BACKEND_API_BASE_URL}/Destinations/{dest_id}/weather"
        weather_response = await client.get(weather_url)
        weather_response.raise_for_status()
        w = weather_response.json()

        return DestinationWeather(
            destination_name=w.get("destinationName", destination_name),
            temperature_celsius=float(w.get("temperatureCelsius", 0)),
            condition=w.get("condition", "Unknown"),
            description=w.get("description", ""),
            humidity=int(w.get("humidity", 0)),
            wind_speed_kmh=float(w.get("windSpeedKmh", 0)),
            weather_suitability=w.get("weatherSuitability", "")
        )