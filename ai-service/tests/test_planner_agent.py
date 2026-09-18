import pytest

from agents.planner_agent import PlannerAgent
from models.schemas import (
    DestinationWeather,
    PlannerAgentRequest,
    PlannerStopInput,
    PlannerTripInput,
    RecommendedExperience,
    ResearchAgentResponse,
)


@pytest.mark.asyncio
async def test_planner_requires_stops():
    agent = PlannerAgent()
    request = PlannerAgentRequest(
        trip=PlannerTripInput(
            trip_id="trip-1",
            title="Test",
            start_date="2026-10-10T00:00:00Z",
            end_date="2026-10-12T00:00:00Z",
            stops=[],
        )
    )

    result = await agent.execute(request)

    assert result.execution_status == "NO_STOPS"
    assert result.plan == []


@pytest.mark.asyncio
async def test_planner_creates_structured_schedule(monkeypatch):
    async def fake_research(_request):
        return ResearchAgentResponse(
            destination="Ella",
            weather_summary=DestinationWeather(
                destination_name="Ella",
                temperature_celsius=24,
                condition="Clear",
                description="Clear",
                humidity=70,
                wind_speed_kmh=10,
                weather_suitability="Ideal for outdoor hiking",
            ),
            total_found=1,
            recommended_experiences=[
                RecommendedExperience(
                    experience_id="exp-1",
                    title="Little Adam's Peak Hike",
                    guide_name="Guide",
                    category="Hiking",
                    calculated_price=20,
                    duration_hours=2,
                    weather_match_status="OPTIMAL",
                    recommendation_reason="Good conditions.",
                )
            ],
            agent_reasoning="Evaluated one candidate.",
        )

    agent = PlannerAgent()
    monkeypatch.setattr(agent.research_agent, "execute", fake_research)

    request = PlannerAgentRequest(
        trip=PlannerTripInput(
            trip_id="trip-1",
            title="Ella",
            objective="Hiking",
            start_date="2026-10-10T00:00:00Z",
            end_date="2026-10-12T00:00:00Z",
            stops=[
                PlannerStopInput(
                    id="stop-1",
                    stop_order=1,
                    destination_id="dest-1",
                    destination_name="Ella",
                )
            ],
        )
    )

    result = await agent.execute(request)

    assert result.execution_status == "COMPLETED"
    assert len(result.plan) == 1
    assert result.plan[0].experience_id == "exp-1"
    assert result.plan[0].day_number == 1
