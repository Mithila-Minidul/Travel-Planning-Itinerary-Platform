import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from agents.research_agent import (
    ResearchAgent,
    _ResearchVerdict,
    _ExperienceVerdict,
)
from models.schemas import (
    ResearchAgentRequest,
    DestinationWeather,
)


@pytest.fixture
def sample_weather():
    return DestinationWeather(
        destination_name="Ella",
        temperature_celsius=24.5,
        condition="Rainy",
        description="Light rain showers",
        humidity=80,
        wind_speed_kmh=14.0,
        weather_suitability="Rain gear recommended",
    )


@pytest.fixture
def sample_experiences():
    return [
        {
            "id": "exp-1",
            "title": "Ella Rock Hiking",
            "guideId": "guide-101",
            "guideName": "Sunil Shantha",
            "categoryName": "Hiking",
            "currentCalculatedPrice": 45.0,
            "durationHours": 4,
            "startTime": "08:00",
            "endTime": "12:00",
            "maxCapacity": 8,
            "destinationName": "Ella",
        },
        {
            "id": "exp-2",
            "title": "Tea Factory Tour",
            "guideId": "guide-101",
            "guideName": "Sunil Shantha",
            "categoryName": "Tea & Plantation",
            "currentCalculatedPrice": 25.0,
            "durationHours": 2,
            "startTime": "14:00",
            "endTime": "16:00",
            "maxCapacity": 12,
            "destinationName": "Ella",
        },
    ]


# 1. TOOL-SELECTION & LLM REASONING
@pytest.mark.asyncio
@patch("agents.research_agent.search_experiences_tool")
@patch("agents.research_agent.get_destination_weather_tool")
async def test_research_agent_executes_tools_and_maps_llm_verdicts(
    mock_weather_tool, mock_search_tool, sample_weather, sample_experiences
):
    mock_weather_tool.return_value = sample_weather
    mock_search_tool.return_value = sample_experiences

    agent = ResearchAgent()
    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    mock_judge.ainvoke.return_value = _ResearchVerdict(
        summary="Ella has light rain today, but tea tours are ideal.",
        verdicts=[
            _ExperienceVerdict(
                experience_id="exp-1",
                weather_match_status="CAUTION_WEATHER",
                reason="Trail can be slippery due to light rain.",
            ),
            _ExperienceVerdict(
                experience_id="exp-2",
                weather_match_status="INDOOR_RECOMMENDED",
                reason="Indoor factory tasting shielded from rain.",
            ),
        ],
    )
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm

    req = ResearchAgentRequest(destination_name="Ella")
    res = await agent.execute(req)

    assert res.total_found == 2
    assert res.execution_status == "COMPLETED"
    assert res.recommended_experiences[0].weather_match_status == "CAUTION_WEATHER"
    assert res.recommended_experiences[1].weather_match_status == "INDOOR_RECOMMENDED"


# 2. SAFE-FAILURE TESTING (NO MATCHES)
@pytest.mark.asyncio
@patch("agents.research_agent.search_experiences_tool")
@patch("agents.research_agent.get_destination_weather_tool")
async def test_research_agent_safe_failure_when_no_experiences_found(
    mock_weather_tool, mock_search_tool, sample_weather
):
    mock_weather_tool.return_value = sample_weather
    mock_search_tool.return_value = []

    agent = ResearchAgent()
    req = ResearchAgentRequest(destination_name="Ella", category_name="Surfing")
    res = await agent.execute(req)

    assert res.total_found == 0
    assert res.execution_status == "NO_MATCHES"
    assert "No experiences found matching your criteria in Ella." in res.agent_reasoning


# 3. FAILURE-RECOVERY (FALLBACK ON LLM EXCEPTION)
@pytest.mark.asyncio
@patch("agents.research_agent.search_experiences_tool")
@patch("agents.research_agent.get_destination_weather_tool")
async def test_research_agent_falls_back_to_deterministic_rules_on_llm_error(
    mock_weather_tool, mock_search_tool, sample_weather, sample_experiences
):
    mock_weather_tool.return_value = sample_weather
    mock_search_tool.return_value = sample_experiences

    agent = ResearchAgent()
    mock_llm = MagicMock()
    mock_judge = AsyncMock()
    mock_judge.ainvoke.side_effect = RuntimeError("Gemini Quota Exceeded")
    mock_llm.with_structured_output.return_value = mock_judge
    agent.llm = mock_llm

    req = ResearchAgentRequest(destination_name="Ella")
    res = await agent.execute(req)

    assert res.execution_status == "COMPLETED"
    assert len(res.recommended_experiences) == 2
    assert res.recommended_experiences[0].weather_match_status == "CAUTION_WEATHER"
    assert res.recommended_experiences[1].weather_match_status == "OPTIMAL"
    assert "[Research Agent fell back to rules: RuntimeError]" in res.agent_reasoning