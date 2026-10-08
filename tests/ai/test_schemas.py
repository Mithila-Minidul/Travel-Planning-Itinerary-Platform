import pytest
from pydantic import ValidationError
from models.schemas import (
    ResearchAgentRequest,
    DestinationWeather,
    RecommendedExperience,
    ResearchAgentResponse,
    ExecutionLogEntry,
    DayPlanItem,
    PlannerRequest,
    PlannerResponse,
    BudgetRequest,
    BudgetResponse,
    ApprovalRequest,
    ApprovalResponse,
    TripStop,
    ItineraryRequest,
    ItineraryResponse,
)


# ============================================================
# 1. RESEARCH & WEATHER SCHEMAS
# ============================================================

def test_research_agent_request_defaults_and_validation():
    req = ResearchAgentRequest(destination_name="Ella")
    assert req.destination_name == "Ella"
    assert req.category_name is None
    assert req.max_budget is None
    assert req.travel_date is None


def test_destination_weather_schema():
    weather = DestinationWeather(
        destination_name="Kandy",
        temperature_celsius=22.0,
        condition="Rain",
        description="Light rain",
        humidity=85,
        wind_speed_kmh=15.0,
        weather_suitability="Caution",
    )
    assert weather.temperature_celsius == 22.0
    assert weather.condition == "Rain"


def test_recommended_experience_all_fields():
    exp = RecommendedExperience(
        experience_id="exp-123",
        title="Temple Tour",
        guide_id="guide-1",
        guide_name="Kamal",
        category="Culture",
        calculated_price=40.0,
        duration_hours=3,
        start_time="08:00",
        end_time="11:00",
        max_capacity=15,
        weather_match_status="OPTIMAL",
        recommendation_reason="Great tour",
    )
    assert exp.max_capacity == 15
    assert exp.weather_match_status == "OPTIMAL"


def test_research_agent_response_defaults():
    res = ResearchAgentResponse(
        destination="Ella",
        total_found=0,
        recommended_experiences=[],
        agent_reasoning="No matches found",
    )
    assert res.agent_name == "Research Agent"
    assert res.execution_status == "COMPLETED"
    assert res.total_found == 0


# ============================================================
# 2. PLANNER SCHEMAS
# ============================================================

def test_day_plan_item_schema():
    item = DayPlanItem(day_number=1, theme="Arrival", preferred_categories=["Hiking", "Nature"])
    assert item.day_number == 1
    assert len(item.preferred_categories) == 2


def test_planner_request_defaults():
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
    )
    assert req.travel_pace == "Balanced"
    assert req.interests == []
    assert req.special_requests == ""


def test_planner_response_schema():
    res = PlannerResponse(days=[], reasoning="Test reason")
    assert res.agent_name == "Planner Agent"
    assert res.execution_status == "COMPLETED"


# ============================================================
# 3. BUDGET SCHEMAS
# ============================================================

def test_budget_request_defaults():
    req = BudgetRequest(budget=500.0)
    assert req.number_of_travelers == 1
    assert req.selected_prices == []


def test_budget_response_schema():
    res = BudgetResponse(
        valid=False,
        total_cost=600.0,
        warnings=["Over budget by $100"],
    )
    assert res.agent_name == "Budget Agent"
    assert res.valid is False
    assert len(res.warnings) == 1


# ============================================================
# 4. APPROVAL SCHEMAS
# ============================================================

def test_approval_request_schema():
    req = ApprovalRequest(
        trip_id="trip-1",
        total_cost=300.0,
        budget=350.0,
        has_warnings=False,
    )
    assert req.total_cost == 300.0
    assert req.has_warnings is False


def test_approval_response_enforces_pending_gate():
    res = ApprovalResponse()
    assert res.agent_name == "Approval Agent"
    assert res.status == "PENDING"
    assert res.requires_human_approval is True
    assert res.execution_status == "COMPLETED"


# ============================================================
# 5. FULL WORKFLOW SCHEMAS & ERROR HANDLING
# ============================================================

def test_trip_stop_schema():
    stop = TripStop(
        day_number=1,
        title="Stop 1",
        estimated_cost=25.0,
        order_index=0,
    )
    assert stop.estimated_cost == 25.0
    assert stop.experience_id is None


def test_itinerary_request_validation_error_on_missing_fields():
    with pytest.raises(ValidationError):
        ItineraryRequest(trip_id="only-id")


def test_itinerary_response_full_model_dump():
    log = ExecutionLogEntry(
        agent="Planner",
        action="Created plan",
        status="SUCCESS",
        timestamp="2026-10-10T00:00:00Z",
        details="Details",
    )
    res = ItineraryResponse(
        trip_id="trip-100",
        stops=[],
        budget_valid=True,
        total_estimated_cost=0.0,
        approval_status="PENDING",
        execution_log=[log],
        errors=[],
    )
    dumped = res.model_dump()
    assert dumped["trip_id"] == "trip-100"
    assert len(dumped["execution_log"]) == 1