"""
Planner Agent — creates the day-by-day structure of the trip.

Owner: Member 2

Phase D: LLM-backed planning. Deterministic math (trip duration,
activity-per-day cap) stays in code; the LLM chooses meaningful
themes per day and distributes the traveler's interests across days.
"""
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from models.schemas import (
    PlannerRequest,
    PlannerResponse,
    DayPlanItem,
)
from utils.llm_client import get_llm


class _DayPlanOutput(BaseModel):
    day_number: int = Field(..., description="1-indexed day number")
    theme: str = Field(..., description="Short theme, e.g. 'Arrival & Orientation'")
    preferred_categories: List[str] = Field(
        default_factory=list,
        description="Category names to look for on this day",
    )


class _PlannerOutput(BaseModel):
    days: List[_DayPlanOutput] = Field(default_factory=list)
    reasoning: str = Field(default="", description="One or two sentences")


class PlannerAgent:
    """
    Member 2 Agent: Creates a structured day-by-day theme plan.

    Deterministic rules (never delegated to the LLM):
        - Trip duration = (end - start) + 1, clamped to 1..14
        - Activities per day from pace:
            Relaxed = 1, Balanced = 2, Fast = 3

    LLM role (Phase D):
        - Choose meaningful themes per day
        - Distribute interests across days (avoid monotony)
        - Produce a short reasoning string for the reviewer
    """

    PACE_TO_ACTIVITIES = {
        "Relaxed": 1,
        "Balanced": 2,
        "Fast": 3,
    }

    MAX_DAYS = 14

    def __init__(self):
        self.llm = get_llm()

    # ------------------------------------------------------------------
    # Deterministic helpers
    # ------------------------------------------------------------------
    def _compute_days(self, start_date: str, end_date: str) -> int:
        try:
            start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            total = (end.date() - start.date()).days + 1
        except Exception:
            return 3

        if total < 1:
            return 1
        if total > self.MAX_DAYS:
            return self.MAX_DAYS
        return total

    def _fallback_plan(
        self, request: PlannerRequest, total_days: int, per_day: int
    ) -> List[DayPlanItem]:
        """Old deterministic plan — used only if the LLM call fails."""
        days: List[DayPlanItem] = []
        for day in range(1, total_days + 1):
            if day == 1:
                theme = "Arrival & Orientation"
            elif day == total_days:
                theme = "Relaxation & Departure"
            else:
                theme = "Explore & Experience"

            if request.interests:
                n = len(request.interests)
                cats = [
                    request.interests[(day - 1 + i) % n]
                    for i in range(min(per_day, n))
                ]
            else:
                cats = []

            days.append(
                DayPlanItem(
                    day_number=day,
                    theme=theme,
                    preferred_categories=cats,
                )
            )
        return days

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------
    async def execute(self, request: PlannerRequest) -> PlannerResponse:
        total_days = self._compute_days(request.start_date, request.end_date)
        per_day = self.PACE_TO_ACTIVITIES.get(request.travel_pace, 2)

        try:
            messages = [
                (
                    "system",
                    "You are the PLANNER on a travel-planning team. "
                    "Given a trip length, travel pace, and interests, "
                    "produce a structured day-by-day plan.\n\n"
                    "Rules:\n"
                    f"- Return EXACTLY {total_days} day(s), numbered 1..{total_days}.\n"
                    f"- Aim for about {per_day} categor"
                    f"{'y' if per_day == 1 else 'ies'} per day.\n"
                    "- Day 1 theme should feel like arrival; "
                    "the last day should feel like departure.\n"
                    "- Categories must come ONLY from the traveler's interest list.\n"
                    "- Distribute interests across days; avoid the same "
                    "category on every day.\n"
                    "- Keep themes short (2-4 words), e.g. "
                    "'Arrival & Orientation', 'Tea Estate Day', "
                    "'Nature & Waterfalls'.",
                ),
                (
                    "user",
                    f"Destination: {request.destination_name}\n"
                    f"Start: {request.start_date}\n"
                    f"End: {request.end_date}\n"
                    f"Total days: {total_days}\n"
                    f"Pace: {request.travel_pace} (~{per_day} activities/day)\n"
                    f"Interests: "
                    f"{', '.join(request.interests) if request.interests else 'None specified'}\n"
                    f"Special requests: {request.special_requests or 'None'}",
                ),
            ]

            judge = self.llm.with_structured_output(_PlannerOutput)
            result: _PlannerOutput = await judge.ainvoke(messages)

            # Validate the LLM respected the day count and day numbering
            if not result.days:
                raise ValueError("LLM returned an empty plan")

            got_numbers = sorted(d.day_number for d in result.days)
            expected_numbers = list(range(1, total_days + 1))
            if got_numbers != expected_numbers:
                raise ValueError(
                    f"LLM day numbers {got_numbers} != expected {expected_numbers}"
                )

            # Normalise categories — clamp to the traveler's actual interests
            allowed = {i.strip().lower() for i in (request.interests or [])}

            days: List[DayPlanItem] = []
            for d in sorted(result.days, key=lambda x: x.day_number):
                cats = [
                    c
                    for c in (d.preferred_categories or [])
                    if c.strip().lower() in allowed
                ]

                # If LLM drifted from the allowed list, fall back to interests
                if not cats and request.interests:
                    n = len(request.interests)
                    cats = [
                        request.interests[(d.day_number - 1 + i) % n]
                        for i in range(min(per_day, n))
                    ]

                days.append(
                    DayPlanItem(
                        day_number=d.day_number,
                        theme=d.theme or f"Day {d.day_number}",
                        preferred_categories=cats,
                    )
                )

            reasoning = result.reasoning or (
                f"Planned {total_days} day(s) for {request.destination_name} "
                f"at {request.travel_pace} pace."
            )
            if request.special_requests:
                reasoning += (
                    f" Noted special requests: {request.special_requests[:80]}"
                )

            return PlannerResponse(
                days=days,
                reasoning=reasoning,
                execution_status="COMPLETED",
            )

        except Exception as e:
            # Fallback: never break the workflow if the LLM fails
            days = self._fallback_plan(request, total_days, per_day)
            reasoning = (
                f"Planned {total_days} day(s) for {request.destination_name} "
                f"at {request.travel_pace} pace "
                f"({per_day} activit"
                f"{'y' if per_day == 1 else 'ies'} per day). "
                f"[Planner Agent fell back to rules: {type(e).__name__}]"
            )
            if request.special_requests:
                reasoning += (
                    f" Noted special requests: {request.special_requests[:80]}"
                )

            return PlannerResponse(
                days=days,
                reasoning=reasoning,
                execution_status="COMPLETED",
            )