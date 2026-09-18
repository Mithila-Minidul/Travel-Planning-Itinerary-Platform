from pydantic import BaseModel, Field
from typing import List, Optional

# Request coming into the Agent
class ResearchAgentRequest(BaseModel):
    destination_name: str = Field(..., description="E.g. Ella")
    category_name: Optional[str] = Field(None, description="E.g. Hiking & Trekking")
    max_budget: Optional[float] = Field(None, description="Max budget in USD")
    travel_date: Optional[str] = Field(None, description="E.g. 2026-09-12T00:00:00Z")

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