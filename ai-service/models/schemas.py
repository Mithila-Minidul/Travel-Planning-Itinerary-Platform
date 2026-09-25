from pydantic import BaseModel, Field
from typing import List, Optional


# ============================================================
# ========== EXISTING (Member 1 — Research Agent) ============
# ============================================================

class ResearchAgentRequest(BaseModel):
    destination_name: str = Field(..., description="E.g. Ella")
    category_name: Optional[str] = Field(None, description="E.g. Hiking & Trekking")
    max_budget: Optional[float] = Field(None, description="Max budget in USD")
    travel_date: Optional[str] = Field(
        None, description="E.g. 2026-09-12T00:00:00Z"
    )


class DestinationWeather(BaseModel):
    destination_name: str
    temperature_celsius: float
    condition: str
    description: str
    humidity: int
    wind_speed_kmh: float
    weather_suitability: str


class RecommendedExperience(BaseModel):
    experience_id: str
    title: str
    guide_id: Optional[str] = None          # used by Orchestrator (One Guide rule)
    guide_name: str
    category: str
    calculated_price: float
    duration_hours: int
    start_time: Optional[str] = None        # ✅ NEW — "HH:MM" (24h) for preferred-times filter
    end_time: Optional[str] = None          # ✅ NEW
    weather_match_status: str
    recommendation_reason: str


class ResearchAgentResponse(BaseModel):
    agent_name: str = "Research Agent"
    destination: str
    travel_date: Optional[str] = None
    weather_summary: Optional[DestinationWeather] = None
    total_found: int
    recommended_experiences: List[RecommendedExperience] = []
    agent_reasoning: str
    execution_status: str = "COMPLETED"


# ============================================================
# ============ SHARED (used by the full workflow) ============
# ============================================================

class ExecutionLogEntry(BaseModel):
    """Audit-log entry written by every agent during the workflow."""
    agent: str
    action: str
    status: str = "SUCCESS"  # SUCCESS | WARNING | ERROR
    timestamp: str
    details: str = ""


# ============================================================
# ============ PLANNER AGENT (Member 2) ======================
# ============================================================

class DayPlanItem(BaseModel):
    day_number: int = Field(..., description="1-indexed day number")
    theme: str = Field(..., description="Short theme, e.g. 'Arrival & Orientation'")
    preferred_categories: List[str] = Field(
        default_factory=list,
        description="Category names to look for on this day",
    )


class PlannerRequest(BaseModel):
    destination_name: str
    start_date: str
    end_date: str
    interests: List[str] = Field(default_factory=list)
    travel_pace: str = "Balanced"
    special_requests: str = ""


class PlannerResponse(BaseModel):
    agent_name: str = "Planner Agent"
    days: List[DayPlanItem] = []
    reasoning: str = ""
    execution_status: str = "COMPLETED"


# ============================================================
# ============ BUDGET AGENT (Member 4) =======================
# ============================================================

class BudgetRequest(BaseModel):
    selected_prices: List[float] = Field(default_factory=list)
    budget: float
    number_of_travelers: int = 1


class BudgetResponse(BaseModel):
    agent_name: str = "Budget Agent"
    valid: bool = False
    total_cost: float = 0.0
    warnings: List[str] = Field(default_factory=list)
    execution_status: str = "COMPLETED"


# ============================================================
# ============ APPROVAL AGENT (Member 3) =====================
# ============================================================

class ApprovalRequest(BaseModel):
    trip_id: str
    total_cost: float
    budget: float
    has_warnings: bool = False


class ApprovalResponse(BaseModel):
    agent_name: str = "Approval Agent"
    status: str = "PENDING"  # PENDING | APPROVED | REJECTED
    requires_human_approval: bool = True
    notes: str = "Awaiting Travel Agent review"
    execution_status: str = "COMPLETED"


# ============================================================
# ============ FULL WORKFLOW CONTRACTS =======================
# ============================================================

class TripStop(BaseModel):
    experience_id: Optional[str] = None
    day_number: int
    title: str
    description: str = ""
    location: str = ""
    estimated_cost: float = 0.0
    order_index: int = 0


class ItineraryRequest(BaseModel):
    """Request from the C# backend to run the full 4-agent workflow."""
    trip_id: str
    destination_id: str
    destination_name: str
    start_date: str
    end_date: str
    budget: float
    interests: List[str] = Field(default_factory=list)
    travel_group: str = "Solo"
    number_of_travelers: int = 1
    budget_tier: str = "Mid"
    travel_pace: str = "Balanced"
    preferred_times: List[str] = Field(default_factory=list)
    special_requests: str = ""


class ItineraryResponse(BaseModel):
    """Response returned to the C# backend after workflow completes."""
    trip_id: str
    stops: List[TripStop] = []
    winning_guide_id: Optional[str] = None
    winning_guide_name: Optional[str] = None
    winning_guide_city: Optional[str] = None
    budget_valid: bool = False
    total_estimated_cost: float = 0.0
    approval_status: str = "PENDING"
    execution_log: List[ExecutionLogEntry] = []
    errors: List[str] = []