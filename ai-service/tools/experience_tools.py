import httpx
from typing import List, Optional
from config.settings import settings

async def search_experiences_tool(
    destination_name: str,
    category_name: Optional[str] = None,
    max_budget: Optional[float] = None,
    travel_date: Optional[str] = None
) -> List[dict]:
    """
    Allow-listed tool that calls ASP.NET Core Web API search tool endpoint.
    """
    payload = {
        "destinationName": destination_name,
        "categoryName": category_name,
        "maxBudget": max_budget,
        "travelDate": travel_date
    }

    url = f"{settings.BACKEND_API_BASE_URL}/Experiences/search-agent-tool"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        return response.json()