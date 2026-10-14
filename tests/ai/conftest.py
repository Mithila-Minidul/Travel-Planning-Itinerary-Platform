import sys
from pathlib import Path
import pytest

# Ensure Python can import modules from ai-service
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent.parent / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from models.schemas import (
    ItineraryRequest,
    PlannerRequest,
    BudgetRequest,
    ApprovalRequest,
    ResearchAgentRequest,
    DestinationWeather,
    RecommendedExperience,
)


@pytest.fixture
def sample_itinerary_request():
    return ItineraryRequest(
        trip_id="11111111-1111-1111-1111-111111111111",
        destination_id="33333333-3333-3333-3333-333333333331",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        budget=450.0,
        interests=["Hiking", "Nature"],
        travel_group="Couple",
        number_of_travelers=2,
        budget_tier="Mid",
        travel_pace="Balanced",
        preferred_times=["Morning", "Afternoon"],
        special_requests="Vegetarian options preferred",
    )


@pytest.fixture
def sample_weather():
    return DestinationWeather(
        destination_name="Ella",
        temperature_celsius=24.5,
        condition="Clear",
        description="Clear blue skies",
        humidity=60,
        wind_speed_kmh=12.0,
        weather_suitability="Optimal for outdoor activities and hiking",
    )


@pytest.fixture
def sample_experiences():
    return [
        RecommendedExperience(
            experience_id="exp-001",
            title="Ella Rock Sunrise Hike",
            guide_id="guide-101",
            guide_name="Kamal Perera",
            category="Hiking",
            calculated_price=35.0,
            duration_hours=4,
            start_time="06:00",
            end_time="10:00",
            max_capacity=10,
            weather_match_status="OPTIMAL",
            recommendation_reason="Clear conditions make this sunrise hike optimal with guide Kamal.",
        ),
        RecommendedExperience(
            experience_id="exp-002",
            title="Ravana Falls & Tea Tasting",
            guide_id="guide-101",
            guide_name="Kamal Perera",
            category="Nature",
            calculated_price=25.0,
            duration_hours=3,
            start_time="13:00",
            end_time="16:00",
            max_capacity=12,
            weather_match_status="OPTIMAL",
            recommendation_reason="Great afternoon activity guided by Kamal.",
        ),
    ]