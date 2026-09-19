from pydantic import BaseModel, Field
from typing import List, Optional


# ========================================
# Research Agent
# ========================================

# Request coming into the Agent
class ResearchAgentRequest(BaseModel):
    destination_name: str = Field(
        ...,
        description="E.g. Ella"
    )

    category_name: Optional[str] = Field(
        None,
        description="E.g. Hiking & Trekking"
    )

    max_budget: Optional[float] = Field(
        None,
        description="Max budget in USD"
    )

    travel_date: Optional[str] = Field(
        None,
        description="E.g. 2026-09-12T00:00:00Z"
    )


# Live Weather Model
class DestinationWeather(BaseModel):
    destination_name: str
    temperature_celsius: float
    condition: str
    description: str
    humidity: int
    wind_speed_kmh: float
    weather_suitability: str


# Evaluated Experience Recommendation
class RecommendedExperience(BaseModel):
    experience_id: str
    title: str
    guide_name: str
    category: str
    calculated_price: float
    duration_hours: int
    weather_match_status: str
    recommendation_reason: str


# Final Structured Agent Response Contract
class ResearchAgentResponse(BaseModel):
    agent_name: str = "Research Agent"
    destination: str
    travel_date: Optional[str] = None
    weather_summary: Optional[DestinationWeather] = None
    total_found: int
    recommended_experiences: List[RecommendedExperience] = []
    agent_reasoning: str
    execution_status: str = "COMPLETED"


# ========================================
# Planner Agent
# ========================================

class PlannerStopInput(BaseModel):
    id: str
    stop_order: int
    destination_id: str
    destination_name: str
    latitude: float = 0
    longitude: float = 0
    experience_id: Optional[str] = None
    experience_title: Optional[str] = None
    planned_arrival: Optional[str] = None
    planned_departure: Optional[str] = None
    notes: Optional[str] = None


class PlannerTripInput(BaseModel):
    trip_id: str
    title: str
    objective: str = ""
    start_date: str
    end_date: str
    constraints: Optional[str] = None
    stops: List[PlannerStopInput] = []


class PlannerStopPlan(BaseModel):
    stop_id: str
    stop_order: int
    destination_name: str
    day_number: int
    planned_arrival: str
    planned_departure: str
    experience_id: Optional[str] = None
    experience_title: Optional[str] = None
    estimated_duration_hours: float = 2
    weather_status: Optional[str] = None
    notes: Optional[str] = None


class PlannerResearchSummary(BaseModel):
    destination: str
    weather_condition: Optional[str] = None
    weather_suitability: Optional[str] = None
    candidates_found: int = 0
    selected_experience: Optional[str] = None
    selected_experience_id: Optional[str] = None


class PlannerAgentRequest(BaseModel):
    trip: PlannerTripInput


class PlannerAgentResponse(BaseModel):
    agent_name: str = "Planner Agent"
    trip_id: str
    execution_status: str
    decision_summary: str
    plan: List[PlannerStopPlan] = []
    research: List[PlannerResearchSummary] = []
    warnings: List[str] = []