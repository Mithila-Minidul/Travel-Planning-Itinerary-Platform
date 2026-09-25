"""
Research Agent — finds experiences and evaluates weather suitability.

Owner: Member 1

Phase D: LLM-backed reasoning. The two tool calls (weather + experience
search) stay deterministic HTTP calls, but the LLM generates the
personalised recommendation reason and weather-match status for each
experience in a single structured call.
"""
from typing import List

from pydantic import BaseModel, Field

from models.schemas import (
    ResearchAgentRequest,
    ResearchAgentResponse,
    RecommendedExperience,
)
from tools.experience_tools import search_experiences_tool
from tools.weather_tools import get_destination_weather_tool
from utils.llm_client import get_llm


class _ExperienceVerdict(BaseModel):
    experience_id: str = Field(..., description="ID of the experience")
    weather_match_status: str = Field(
        ...,
        description="OPTIMAL | CAUTION_WEATHER | INDOOR_RECOMMENDED | NOT_RECOMMENDED",
    )
    reason: str = Field(
        ...,
        description="One or two sentences for the traveler — mentions the guide, "
                    "the activity, and the weather suitability.",
    )


class _ResearchVerdict(BaseModel):
    summary: str = Field(
        default="",
        description="One or two sentences summarising the destination's "
                    "weather and overall suitability.",
    )
    verdicts: List[_ExperienceVerdict] = Field(default_factory=list)


class ResearchAgent:
    """
    Member 1 Agent: Researches experiences and evaluates weather
    suitability.

    Deterministic steps (never delegated):
        - Call weather tool for the destination
        - Call C# search tool for matching experiences

    LLM role (Phase D):
        - Judge weather suitability per experience
        - Produce a personalised recommendation reason per experience
        - Summarise the destination's weather at a glance
    """

    def __init__(self):
        self.llm = get_llm()

    async def execute(self, request: ResearchAgentRequest) -> ResearchAgentResponse:
        # ---------- Deterministic: call tools ----------
        weather_info = await get_destination_weather_tool(request.destination_name)

        experiences = await search_experiences_tool(
            destination_name=request.destination_name,
            category_name=request.category_name,
            max_budget=request.max_budget,
            travel_date=request.travel_date,
        )

        if not experiences:
            return ResearchAgentResponse(
                destination=request.destination_name,
                travel_date=request.travel_date,
                weather_summary=weather_info,
                total_found=0,
                recommended_experiences=[],
                agent_reasoning=(
                    f"No experiences found matching your criteria in "
                    f"{request.destination_name}."
                ),
                execution_status="NO_MATCHES",
            )

        # ---------- LLM: reason about weather + each experience ----------
        try:
            verdicts = await self._llm_verdicts(weather_info, experiences)

            # Build the final list — attach LLM text to each experience
            verdict_by_id = {v.experience_id: v for v in verdicts.verdicts}
            recommendations: List[RecommendedExperience] = []

            for exp in experiences:
                exp_id = exp.get("id", "")
                v = verdict_by_id.get(exp_id)

                if v:
                    status = v.weather_match_status or "OPTIMAL"
                    reason = v.reason or self._fallback_reason(exp, weather_info)
                else:
                    # LLM skipped this one — fall back to deterministic
                    status = self._fallback_status(exp, weather_info)
                    reason = self._fallback_reason(exp, weather_info)

                recommendations.append(
                    RecommendedExperience(
                        experience_id=exp_id,
                        title=exp.get("title", ""),
                        guide_id=exp.get("guideId", "") or exp.get("guide_id", ""),
                        guide_name=exp.get("guideName", "Local Guide"),
                        category=exp.get("categoryName", ""),
                        calculated_price=float(exp.get("currentCalculatedPrice", 0)),
                        duration_hours=int(exp.get("durationHours", 0)),
                        start_time=exp.get("startTime"),
                        end_time=exp.get("endTime"),
                        weather_match_status=status,
                        recommendation_reason=reason,
                    )
                )

            summary = verdicts.summary or self._fallback_summary(
                weather_info, len(recommendations), request.destination_name
            )

            return ResearchAgentResponse(
                destination=request.destination_name,
                travel_date=request.travel_date,
                weather_summary=weather_info,
                total_found=len(recommendations),
                recommended_experiences=recommendations,
                agent_reasoning=summary,
                execution_status="COMPLETED",
            )

        except Exception as e:
            # Fallback: deterministic logic if the LLM call fails
            recommendations = [self._fallback_recommendation(exp, weather_info)
                               for exp in experiences]
            summary = self._fallback_summary(
                weather_info, len(recommendations), request.destination_name
            )
            summary += f" [Research Agent fell back to rules: {type(e).__name__}]"

            return ResearchAgentResponse(
                destination=request.destination_name,
                travel_date=request.travel_date,
                weather_summary=weather_info,
                total_found=len(recommendations),
                recommended_experiences=recommendations,
                agent_reasoning=summary,
                execution_status="COMPLETED",
            )

    # ============================================================
    # LLM call
    # ============================================================
    async def _llm_verdicts(self, weather_info, experiences) -> _ResearchVerdict:
        weather_line = "Unknown"
        if weather_info:
            weather_line = (
                f"{weather_info.condition} ({weather_info.temperature_celsius}°C), "
                f"{weather_info.description}, humidity {weather_info.humidity}%, "
                f"wind {weather_info.wind_speed_kmh} km/h. "
                f"Suitability: {weather_info.weather_suitability}"
            )

        experience_lines = "\n".join(
            f"- id={exp.get('id', '')} | title={exp.get('title', '')} | "
            f"category={exp.get('categoryName', '')} | "
            f"guide={exp.get('guideName', 'Local Guide')} | "
            f"duration={exp.get('durationHours', 0)}h"
            for exp in experiences
        )

        messages = [
            (
                "system",
                "You are the RESEARCHER on a travel-planning team. "
                "You are given the destination's weather and a list of "
                "candidate experiences. For EACH experience, decide a "
                "weather_match_status (OPTIMAL | CAUTION_WEATHER | "
                "INDOOR_RECOMMENDED | NOT_RECOMMENDED) and write a "
                "1-2 sentence recommendation_reason for the traveler. "
                "Mention the guide, the activity and how the weather fits. "
                "Return ONLY verdicts for the experiences provided.",
            ),
            (
                "user",
                f"Destination: {experiences[0].get('destinationName', 'Unknown')}\n"
                f"Weather: {weather_line}\n\n"
                f"Experiences:\n{experience_lines}",
            ),
        ]

        judge = self.llm.with_structured_output(_ResearchVerdict)
        return await judge.ainvoke(messages)

    # ============================================================
    # Deterministic fallbacks
    # ============================================================
    def _fallback_status(self, exp: dict, weather_info) -> str:
        is_rainy = weather_info and "rain" in (weather_info.condition or "").lower()
        cat = (exp.get("categoryName") or "").lower()
        if is_rainy and "hiking" in cat:
            return "CAUTION_WEATHER"
        return "OPTIMAL"

    def _fallback_reason(self, exp: dict, weather_info) -> str:
        guide = exp.get("guideName", "Local Guide")
        title = exp.get("title", "")
        if weather_info and "rain" in (weather_info.condition or "").lower():
            return (
                f"Rain forecast ({weather_info.description}). "
                f"Rain gear recommended for {title}. Guided by {guide}."
            )
        return f"Guided by {guide}. Excellent conditions for {title}."

    def _fallback_recommendation(
        self, exp: dict, weather_info
    ) -> RecommendedExperience:
        return RecommendedExperience(
            experience_id=exp.get("id", ""),
            title=exp.get("title", ""),
            guide_id=exp.get("guideId", "") or exp.get("guide_id", ""),
            guide_name=exp.get("guideName", "Local Guide"),
            category=exp.get("categoryName", ""),
            calculated_price=float(exp.get("currentCalculatedPrice", 0)),
            duration_hours=int(exp.get("durationHours", 0)),
            start_time=exp.get("startTime"),
            end_time=exp.get("endTime"),
            weather_match_status=self._fallback_status(exp, weather_info),
            recommendation_reason=self._fallback_reason(exp, weather_info),
        )

    def _fallback_summary(
        self, weather_info, count: int, destination_name: str
    ) -> str:
        if weather_info:
            return (
                f"Evaluated {count} candidate experience(s) for {destination_name}. "
                f"Weather: {weather_info.condition} ({weather_info.temperature_celsius}°C). "
                f"All prices calculated using dynamic seasonal and weekend rates."
            )
        return f"Evaluated {count} candidate experience(s) for {destination_name}."