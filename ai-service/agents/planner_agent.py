"""
Planner Agent — creates the day-by-day structure of the trip.

Owner: Member 2

Input:  destination, dates, interests, travel preferences.
Output: PlannerResponse with a list of DayPlanItem.

The Planner does not call any external tool. Its job is pure
reasoning: given a trip length, a pace, and a set of interests,
produce a structured plan with one theme per day and the
categories to look for on that day.
"""
from datetime import datetime
from typing import List

from models.schemas import (
    PlannerRequest,
    PlannerResponse,
    DayPlanItem,
)


class PlannerAgent:
    """
    Member 2 Agent: Creates a structured day-by-day theme plan
    based on trip length, pace, and interests.
    """

    # Pace → how many activities to fit per day
    PACE_TO_ACTIVITIES = {
        "Relaxed": 1,
        "Balanced": 2,
        "Fast": 3,
    }

    # Day-1 and last-day themes (they are usually shorter)
    ARRIVAL_THEME = "Arrival & Orientation"
    DEPARTURE_THEME = "Relaxation & Departure"
    DEFAULT_THEME = "Explore & Experience"

    def _compute_days(self, start_date: str, end_date: str) -> int:
        """Return number of days (1..14). Falls back to 3 on parse error."""
        try:
            start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            total = (end.date() - start.date()).days + 1
        except Exception:
            return 3

        if total < 1:
            return 1
        if total > 14:
            return 14
        return total

    def _pick_categories(self, interests: List[str], per_day: int, offset: int) -> List[str]:
        """Rotate the traveler's interests so different days get different categories."""
        if not interests:
            return []
        n = len(interests)
        return [interests[(offset + i) % n] for i in range(min(per_day, n))]

    async def execute(self, request: PlannerRequest) -> PlannerResponse:
        total_days = self._compute_days(request.start_date, request.end_date)
        per_day = self.PACE_TO_ACTIVITIES.get(request.travel_pace, 2)

        days: List[DayPlanItem] = []
        for day in range(1, total_days + 1):
            if day == 1:
                theme = self.ARRIVAL_THEME
            elif day == total_days:
                theme = self.DEPARTURE_THEME
            else:
                theme = self.DEFAULT_THEME

            # Rotate categories by day so we don't repeat the same interest
            categories = self._pick_categories(
                request.interests, per_day, offset=day - 1
            )

            days.append(
                DayPlanItem(
                    day_number=day,
                    theme=theme,
                    preferred_categories=categories,
                )
            )

        reasoning = (
            f"Planned {total_days} day(s) for {request.destination_name} "
            f"at {request.travel_pace} pace "
            f"({per_day} activit{'y' if per_day == 1 else 'ies'} per day)."
        )
        if request.special_requests:
            reasoning += f" Noted special requests: {request.special_requests[:80]}"

        return PlannerResponse(
            days=days,
            reasoning=reasoning,
            execution_status="COMPLETED",
        )