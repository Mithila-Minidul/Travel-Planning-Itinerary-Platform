import pytest
from unittest.mock import AsyncMock
from workflows.trip_planner_workflow import TripPlannerWorkflow
from models.schemas import (
    ItineraryRequest,
    PlannerResponse,
    DayPlanItem,
    ResearchAgentResponse,
    RecommendedExperience,
    BudgetResponse,
    ApprovalResponse,
)


@pytest.fixture
def workflow():
    """
    Creates the workflow with downstream agents (Budget & Approval)
    mocked by default so no test accidentally calls Google Gemini live.
    """
    wf = TripPlannerWorkflow()

    # Default Mock for Budget Agent
    wf.budget.execute = AsyncMock(
        return_value=BudgetResponse(
            valid=True,
            total_cost=80.0,
            warnings=[],
            execution_status="COMPLETED",
        )
    )

    # Default Mock for Approval Agent
    wf.approval.execute = AsyncMock(
        return_value=ApprovalResponse(
            status="PENDING",
            requires_human_approval=True,
            notes="Trip awaiting Travel Agent review.",
            execution_status="COMPLETED",
        )
    )

    return wf


@pytest.fixture
def mock_experiences():
    return [
        RecommendedExperience(
            experience_id="e1",
            title="Sunrise Hike",
            guide_id="guide-A",
            guide_name="Guide Alice",
            category="Hiking",
            calculated_price=50.0,
            duration_hours=3,
            start_time="08:00",
            max_capacity=4,
            weather_match_status="OPTIMAL",
            recommendation_reason="Morning hike with clear skies",
        ),
        RecommendedExperience(
            experience_id="e2",
            title="Tea Plantation Walk",
            guide_id="guide-A",
            guide_name="Guide Alice",
            category="Tea & Plantation",
            calculated_price=30.0,
            duration_hours=2,
            start_time="14:00",
            max_capacity=6,
            weather_match_status="OPTIMAL",
            recommendation_reason="Afternoon tea stroll",
        ),
        RecommendedExperience(
            experience_id="e3",
            title="Luxury Spa Experience",
            guide_id="guide-B",
            guide_name="Guide Bob",
            category="Wellness",
            calculated_price=250.0,
            duration_hours=2,
            start_time="18:00",
            max_capacity=2,
            weather_match_status="OPTIMAL",
            recommendation_reason="Evening relaxation",
        ),
        RecommendedExperience(
            experience_id="e4",
            title="Cooking Class",
            guide_id="guide-A",
            guide_name="Guide Alice",
            category="Food & Cooking",
            calculated_price=40.0,
            duration_hours=3,
            start_time="18:00",
            max_capacity=10,
            weather_match_status="OPTIMAL",
            recommendation_reason="Dinner cooking class",
        ),
    ]


# ============================================================
# 1. COMPLETE 4-AGENT E2E INTEGRATION PIPELINE
# ============================================================

@pytest.mark.asyncio
async def test_full_workflow_happy_path(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(
            days=[
                DayPlanItem(day_number=1, theme="Arrival & Hiking", preferred_categories=["Hiking"]),
                DayPlanItem(day_number=2, theme="Tea & Relaxation", preferred_categories=["Tea & Plantation"]),
            ],
            reasoning="2-day balanced plan",
        )
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found candidate experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-100",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        budget=500.0,
        interests=["Hiking", "Tea & Plantation"],
        number_of_travelers=1,
    )

    res = await workflow.run(req)

    assert res.trip_id == "trip-100"
    assert res.budget_valid is True
    assert res.approval_status == "PENDING"
    assert res.winning_guide_id == "guide-A"
    assert res.winning_guide_name == "Guide Alice"
    assert len(res.stops) == 2
    # Verify execution log captures all 4 agents + Orchestrator
    agents_logged = {entry.agent for entry in res.execution_log}
    assert {"Planner", "Research", "Orchestrator", "Budget", "Approval"}.issubset(agents_logged)


# ============================================================
# 2. FILTER 1: NO EXPERIENCES MATCH SELECTED INTERESTS
# ============================================================

@pytest.mark.asyncio
async def test_workflow_no_interest_match_returns_empty_and_warning(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(return_value=PlannerResponse(days=[]))
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Candidates available",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-101",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        budget=500.0,
        interests=["Scuba Diving"],
    )

    res = await workflow.run(req)

    assert len(res.stops) == 0
    assert res.approval_status == "PENDING"
    assert any("No experiences available for interests: Scuba Diving" in err for err in res.errors)


# ============================================================
# 3. FILTER 2: PREFERRED TIMES STRICT FILTERING
# ============================================================

@pytest.mark.asyncio
async def test_workflow_preferred_times_filter(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(days=[DayPlanItem(day_number=1, theme="Day 1")])
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-102",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-10T00:00:00Z",
        budget=500.0,
        preferred_times=["Evening"],
        interests=["Food & Cooking"],
    )

    res = await workflow.run(req)

    assert len(res.stops) == 1
    assert res.stops[0].title == "Cooking Class"


# ============================================================
# 4. FILTER 3: BUDGET EXCLUSION (COST PER TRAVELER > BUDGET)
# ============================================================

@pytest.mark.asyncio
async def test_workflow_budget_fit_exclusion(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(days=[DayPlanItem(day_number=1, theme="Day 1")])
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-103",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-10T00:00:00Z",
        budget=20.0,
        number_of_travelers=1,
    )

    res = await workflow.run(req)

    assert len(res.stops) == 0
    assert any("No experiences fit your $20.00 budget" in err for err in res.errors)


# ============================================================
# 5. FILTER 4: GROUP CAPACITY CONSTRAINT
# ============================================================

@pytest.mark.asyncio
async def test_workflow_capacity_filter_exceeds_group_size(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(days=[DayPlanItem(day_number=1, theme="Day 1")])
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-104",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-10T00:00:00Z",
        budget=5000.0,
        number_of_travelers=15,
    )

    res = await workflow.run(req)

    assert len(res.stops) == 0
    assert any("No experiences can host 15 traveler(s)" in err for err in res.errors)


# ============================================================
# 6. FILTER 5: LUXURY BRACKET (TOP 30% BY PRICE)
# ============================================================

@pytest.mark.asyncio
async def test_workflow_luxury_tier_filters_top_price(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(days=[DayPlanItem(day_number=1, theme="Day 1")])
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-105",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-10T00:00:00Z",
        budget=1000.0,
        budget_tier="Luxury",
        number_of_travelers=1,
    )

    res = await workflow.run(req)

    assert res.winning_guide_name == "Guide Bob"
    assert res.stops[0].title == "Luxury Spa Experience"


# ============================================================
# 7. FILTER 6: ONE GUIDE PER TRIP ENFORCEMENT
# ============================================================

@pytest.mark.asyncio
async def test_workflow_enforces_one_guide_per_trip(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(
            days=[
                DayPlanItem(day_number=1, theme="Day 1"),
                DayPlanItem(day_number=2, theme="Day 2"),
            ]
        )
    )
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=len(mock_experiences),
            recommended_experiences=mock_experiences,
            agent_reasoning="Found experiences",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-106",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        budget=500.0,
        budget_tier="Mid",
    )

    res = await workflow.run(req)

    assert res.winning_guide_id == "guide-A"
    for stop in res.stops:
        if stop.experience_id:
            exp_match = next(e for e in mock_experiences if e.experience_id == stop.experience_id)
            assert exp_match.guide_id == "guide-A"


# ============================================================
# 8. FREE DAY INSERTION WHEN EXPERIENCES ARE EXHAUSTED
# ============================================================

@pytest.mark.asyncio
async def test_workflow_inserts_free_day_when_experiences_run_out(workflow, mock_experiences):
    workflow.planner.execute = AsyncMock(
        return_value=PlannerResponse(
            days=[
                DayPlanItem(day_number=1, theme="Day 1"),
                DayPlanItem(day_number=2, theme="Day 2"),
                DayPlanItem(day_number=3, theme="Day 3"),
            ]
        )
    )
    single_exp = [mock_experiences[0]]
    workflow.researcher.execute = AsyncMock(
        return_value=ResearchAgentResponse(
            destination="Ella",
            total_found=1,
            recommended_experiences=single_exp,
            agent_reasoning="Single match",
        )
    )

    req = ItineraryRequest(
        trip_id="trip-107",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        budget=500.0,
        travel_pace="Relaxed",
    )

    res = await workflow.run(req)

    assert len(res.stops) == 3
    assert res.stops[0].title == "Sunrise Hike"
    assert "Free Day" in res.stops[1].title
    assert "Free Day" in res.stops[2].title
    assert res.stops[1].estimated_cost == 0.0


# ============================================================
# 9. UPSTREAM PLANNER EXCEPTION HANDLING
# ============================================================

@pytest.mark.asyncio
async def test_workflow_handles_planner_agent_exception(workflow):
    workflow.planner.execute = AsyncMock(side_effect=Exception("Planner model crashed"))

    req = ItineraryRequest(
        trip_id="trip-108",
        destination_id="dest-1",
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        budget=500.0,
    )

    res = await workflow.run(req)

    assert res.approval_status == "ERROR"
    assert any("Planner failed: Planner model crashed" in e for e in res.errors)