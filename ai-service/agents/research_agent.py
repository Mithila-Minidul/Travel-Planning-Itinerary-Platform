from models.schemas import (
    ResearchAgentRequest,
    ResearchAgentResponse,
    RecommendedExperience,
)
from tools.experience_tools import search_experiences_tool
from tools.weather_tools import get_destination_weather_tool

class ResearchAgent:
    """
    Member 1 Agent: Researches experiences and evaluates weather suitability.
    """

    async def execute(self, request: ResearchAgentRequest) -> ResearchAgentResponse:
        # 1. Tool Call -> Get Weather
        weather_info = await get_destination_weather_tool(request.destination_name)

        # 2. Tool Call -> Search Experiences from .NET Backend
        experiences = await search_experiences_tool(
            destination_name=request.destination_name,
            category_name=request.category_name,
            max_budget=request.max_budget,
            travel_date=request.travel_date
        )

        if not experiences:
            return ResearchAgentResponse(
                destination=request.destination_name,
                travel_date=request.travel_date,
                weather_summary=weather_info,
                total_found=0,
                recommended_experiences=[],
                agent_reasoning=f"No experiences found matching your criteria in {request.destination_name}.",
                execution_status="NO_MATCHES"
            )

        # 3. Deterministic Validation & Weather Reasonings
        recommendations = []
        is_rainy = weather_info and "rain" in weather_info.condition.lower()

        for exp in experiences:
            cat_name = exp.get("categoryName", "")
            title = exp.get("title", "")
            guide = exp.get("guideName", "Local Guide")
            price = float(exp.get("currentCalculatedPrice", 0))
            duration = int(exp.get("durationHours", 0))

            if is_rainy and "hiking" in cat_name.lower():
                weather_status = "CAUTION_WEATHER"
                reason = f"Rain forecast ({weather_info.description}). Rain gear recommended for {title}."
            else:
                weather_status = "OPTIMAL"
                reason = f"Guided by {guide}. Excellent conditions for {title}."

            recommendations.append(
                RecommendedExperience(
                    experience_id=exp.get("id", ""),
                    title=title,
                    guide_name=guide,
                    category=cat_name,
                    calculated_price=price,
                    duration_hours=duration,
                    weather_match_status=weather_status,
                    recommendation_reason=reason
                )
            )

        summary = (
            f"Evaluated {len(recommendations)} candidate experience(s) for {request.destination_name}. "
            f"Weather: {weather_info.condition if weather_info else 'Normal'} "
            f"({weather_info.temperature_celsius if weather_info else 25}°C). "
            f"All prices calculated using dynamic seasonal and weekend rates."
        )

        return ResearchAgentResponse(
            destination=request.destination_name,
            travel_date=request.travel_date,
            weather_summary=weather_info,
            total_found=len(recommendations),
            recommended_experiences=recommendations,
            agent_reasoning=summary,
            execution_status="COMPLETED"
        )