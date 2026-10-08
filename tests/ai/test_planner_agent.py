import pytest
from unittest.mock import MagicMock, AsyncMock
from agents.planner_agent import PlannerAgent, _PlannerOutput, _DayPlanOutput
from models.schemas import PlannerRequest


# ============================================================
# 1. DURATION & DAY COMPUTATION (ALL BRANCHES)
# ============================================================

def test_planner_computes_exact_days_between_dates():
    agent = PlannerAgent()
    assert agent._compute_days("2026-10-10T00:00:00Z", "2026-10-12T00:00:00Z") == 3


def test_planner_clamps_single_day_trip():
    agent = PlannerAgent()
    assert agent._compute_days("2026-10-10T00:00:00Z", "2026-10-10T00:00:00Z") == 1


def test_planner_end_date_before_start_date_returns_one():
    agent = PlannerAgent()
    # Reversed dates: end date is before start date -> returns 1
    assert agent._compute_days("2026-10-15T00:00:00Z", "2026-10-10T00:00:00Z") == 1


def test_planner_clamps_trip_duration_to_maximum_14_days():
    agent = PlannerAgent()
    assert agent._compute_days("2026-10-01T00:00:00Z", "2026-11-15T00:00:00Z") == 14


def test_planner_handles_invalid_date_strings_with_safe_default():
    agent = PlannerAgent()
    assert agent._compute_days("invalid-date", "bad-date") == 3


# ============================================================
# 2. PACE MAPPING
# ============================================================

def test_planner_pace_to_activities_mapping():
    assert PlannerAgent.PACE_TO_ACTIVITIES["Relaxed"] == 1
    assert PlannerAgent.PACE_TO_ACTIVITIES["Balanced"] == 2
    assert PlannerAgent.PACE_TO_ACTIVITIES["Fast"] == 3


# ============================================================
# 3. FALLBACK PLAN GENERATION (ALL BRANCHES)
# ============================================================

def test_planner_fallback_plan_with_interests():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        interests=["Hiking", "Nature"],
        travel_pace="Balanced",
    )
    days = agent._fallback_plan(req, total_days=3, per_day=2)

    assert len(days) == 3
    assert days[0].theme == "Arrival & Orientation"
    assert days[1].theme == "Explore & Experience"
    assert days[2].theme == "Relaxation & Departure"
    assert len(days[0].preferred_categories) == 2


def test_planner_fallback_plan_with_empty_interests():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        interests=[],  # Empty interests
        travel_pace="Relaxed",
    )
    days = agent._fallback_plan(req, total_days=2, per_day=1)

    assert len(days) == 2
    assert days[0].preferred_categories == []
    assert days[1].preferred_categories == []


# ============================================================
# 4. EXECUTE() METHOD: HAPPY PATH, LLM CLAMPING & RECOVERY
# ============================================================

@pytest.mark.asyncio
async def test_planner_execute_happy_path():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        interests=["Hiking", "Tea"],
        travel_pace="Balanced",
        special_requests="Quiet places",
    )

    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    mock_judge.ainvoke.return_value = _PlannerOutput(
        days=[
            _DayPlanOutput(day_number=1, theme="Arrival & Orientation", preferred_categories=["Hiking"]),
            _DayPlanOutput(day_number=2, theme="Tea Estate Day", preferred_categories=["Tea"]),
            _DayPlanOutput(day_number=3, theme="Departure", preferred_categories=["Hiking"]),
        ],
        reasoning="Custom LLM reasoning for Ella.",
    )
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm  # Safe class-level mock

    res = await agent.execute(req)

    assert res.execution_status == "COMPLETED"
    assert len(res.days) == 3
    assert res.days[1].theme == "Tea Estate Day"
    assert "Quiet places" in res.reasoning


@pytest.mark.asyncio
async def test_planner_execute_clamps_llm_hallucinated_categories():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-11T00:00:00Z",
        interests=["Hiking"],  # Only Hiking is allowed
        travel_pace="Relaxed",
    )

    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    mock_judge.ainvoke.return_value = _PlannerOutput(
        days=[
            # LLM hallucinated 'Scuba Diving' which is not in traveler's interests
            _DayPlanOutput(day_number=1, theme="Day 1", preferred_categories=["Scuba Diving"]),
            _DayPlanOutput(day_number=2, theme="Day 2", preferred_categories=["Hiking"]),
        ],
        reasoning="Reason",
    )
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm

    res = await agent.execute(req)

    assert res.execution_status == "COMPLETED"
    # Scuba Diving was clamped out, fell back to allowed interest
    assert "Scuba Diving" not in res.days[0].preferred_categories
    assert "Hiking" in res.days[0].preferred_categories


@pytest.mark.asyncio
async def test_planner_execute_recovers_gracefully_when_llm_fails():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        interests=["Hiking"],
        travel_pace="Balanced",
    )

    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    # Simulate LLM API failure / network timeout
    mock_judge.ainvoke.side_effect = Exception("Google Generative AI quota exceeded")
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm

    res = await agent.execute(req)

    # Must NOT crash! Must recover cleanly via fallback rules
    assert res.execution_status == "COMPLETED"
    assert len(res.days) == 3
    assert "[Planner Agent fell back to rules:" in res.reasoning


@pytest.mark.asyncio
async def test_planner_execute_recovers_when_llm_returns_mismatched_day_numbers():
    agent = PlannerAgent()
    req = PlannerRequest(
        destination_name="Ella",
        start_date="2026-10-10T00:00:00Z",
        end_date="2026-10-12T00:00:00Z",
        interests=["Hiking"],
    )

    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    # LLM returned wrong day numbers: Day 1 and Day 5 instead of [1, 2, 3]
    mock_judge.ainvoke.return_value = _PlannerOutput(
        days=[
            _DayPlanOutput(day_number=1, theme="D1", preferred_categories=["Hiking"]),
            _DayPlanOutput(day_number=5, theme="D5", preferred_categories=["Hiking"]),
        ],
        reasoning="Mismatched days",
    )
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm

    res = await agent.execute(req)

    # Catches the ValueError and falls back to correct 3 days
    assert res.execution_status == "COMPLETED"
    assert len(res.days) == 3
    assert [d.day_number for d in res.days] == [1, 2, 3]