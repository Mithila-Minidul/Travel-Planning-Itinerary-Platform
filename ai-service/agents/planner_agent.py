from datetime import datetime, timedelta, time
from typing import Optional

from agents.research_agent import ResearchAgent
from models.schemas import (
    PlannerAgentRequest,
    PlannerAgentResponse,
    PlannerResearchSummary,
    PlannerStopPlan,
    ResearchAgentRequest,
)


class PlannerAgent:
    def __init__(self):
        self.research_agent = ResearchAgent()

    async def execute(self, request: PlannerAgentRequest) -> PlannerAgentResponse:
        trip = request.trip

        if not trip.stops:
            return PlannerAgentResponse(
                trip_id=trip.trip_id,
                execution_status="NO_STOPS",
                decision_summary=(
                    "The trip has no TripStops. Add at least one destination "
                    "before generating an itinerary."
                ),
                warnings=[
                    "No TripStops were supplied to the Planner Agent."
                ],
            )

        start = self._parse_datetime(trip.start_date)
        end = self._parse_datetime(trip.end_date)

        if end <= start:
            return PlannerAgentResponse(
                trip_id=trip.trip_id,
                execution_status="INVALID_INPUT",
                decision_summary=(
                    "The trip end date must be after the start date."
                ),
                warnings=["Invalid trip date range."],
            )

        ordered_stops = sorted(
            trip.stops,
            key=lambda s: (s.stop_order, s.id),
        )

        day_count = max(
            1,
            (end.date() - start.date()).days + 1,
        )

        research_results = []
        research_summaries = []
        warnings = []

        # Step 1: research each destination using Member 1's existing agent.
        max_budget = self._extract_budget(trip.constraints)
        category_name = self._infer_category(trip.objective)

        for stop in ordered_stops:
            try:
                research = await self.research_agent.execute(
                    ResearchAgentRequest(
                        destination_name=stop.destination_name,
                        category_name=category_name,
                        max_budget=max_budget,
                        travel_date=trip.start_date,
                    )
                )

                research_results.append((stop, research))

                selected = None

                if stop.experience_id:
                    selected = next(
                        (
                            r
                            for r in research.recommended_experiences
                            if r.experience_id == stop.experience_id
                        ),
                        None,
                    )

                if (
                    selected is None
                    and research.recommended_experiences
                ):
                    # Prefer an outdoor-suitable recommendation when weather is
                    # favorable; otherwise use the first deterministic candidate.
                    optimal = [
                        r
                        for r in research.recommended_experiences
                        if r.weather_match_status == "OPTIMAL"
                    ]

                    selected = (
                        optimal or research.recommended_experiences
                    )[0]

                research_summaries.append(
                    PlannerResearchSummary(
                        destination=stop.destination_name,
                        weather_condition=(
                            research.weather_summary.condition
                            if research.weather_summary
                            else None
                        ),
                        weather_suitability=(
                            research.weather_summary.weather_suitability
                            if research.weather_summary
                            else None
                        ),
                        candidates_found=research.total_found,
                        selected_experience=(
                            selected.title
                            if selected
                            else stop.experience_title
                        ),
                        selected_experience_id=(
                            selected.experience_id
                            if selected
                            else stop.experience_id
                        ),
                    )
                )

            except Exception:
                warnings.append(
                    f"Research was unavailable for {stop.destination_name}; "
                    "the existing stop details were retained."
                )

                research_results.append((stop, None))

                research_summaries.append(
                    PlannerResearchSummary(
                        destination=stop.destination_name
                    )
                )

        slots_per_day = 4
        plan = []

        for index, (stop, research) in enumerate(research_results):
            day_index = min(
                index // slots_per_day,
                day_count - 1,
            )

            slot = index % slots_per_day

            day_date = start.date() + timedelta(days=day_index)

            if day_index == 0:
                day_start = datetime.combine(
                    day_date,
                    time(hour=9, minute=0),
                    tzinfo=start.tzinfo,
                )

                base_arrival = max(start, day_start)

            else:
                base_arrival = datetime.combine(
                    day_date,
                    time(hour=9, minute=0),
                    tzinfo=start.tzinfo,
                )

            arrival = base_arrival + timedelta(
                hours=slot * 2.25
            )

            selected = None

            if research:
                summary = research_summaries[index]

                if summary.selected_experience_id:
                    selected = next(
                        (
                            r
                            for r in research.recommended_experiences
                            if r.experience_id
                            == summary.selected_experience_id
                        ),
                        None,
                    )

            duration = (
                float(selected.duration_hours)
                if selected
                else 2.0
            )

            duration = max(
                1.0,
                min(duration, 4.0),
            )

            departure = arrival + timedelta(
                hours=duration
            )

            if departure > end:
                departure = end


            if departure <= arrival:
                warnings.append(
                    f"Insufficient time to schedule "
                    f"{stop.destination_name} within the trip window."
                )
                continue

            weather_status = None

            if research and research.weather_summary:
                weather_status = (
                    research.weather_summary.weather_suitability
                )

            note_parts = []

            if selected:
                note_parts.append(
                    f"Planner Agent selected '{selected.title}' "
                    "from approved experiences."
                )

            if weather_status:
                note_parts.append(
                    f"Weather: {weather_status}."
                )

            if stop.notes:
                note_parts.append(
                    f"Traveler note retained: {stop.notes}"
                )

            plan.append(
                PlannerStopPlan(
                    stop_id=stop.id,
                    stop_order=stop.stop_order,
                    destination_name=stop.destination_name,
                    day_number=day_index + 1,
                    planned_arrival=arrival.isoformat(),
                    planned_departure=departure.isoformat(),
                    experience_id=(
                        selected.experience_id
                        if selected
                        else stop.experience_id
                    ),
                    experience_title=(
                        selected.title
                        if selected
                        else stop.experience_title
                    ),
                    estimated_duration_hours=duration,
                    weather_status=weather_status,
                    notes=(
                        " ".join(note_parts)
                        or "Scheduled by Planner Agent."
                    ),
                )
            )

        if len(ordered_stops) > day_count * slots_per_day:
            warnings.append(
                "There are more stops than the preferred planning capacity; "
                "the final day contains the remaining stops. Review travel "
                "times before approval."
            )

        return PlannerAgentResponse(
            trip_id=trip.trip_id,
            execution_status="COMPLETED",
            decision_summary=(
                f"Planner Agent researched "
                f"{len(research_summaries)} destination stop(s), "
                "selected available approved experiences where possible, "
                "and produced a day-by-day itinerary. ASP.NET Core "
                "deterministic validation remains the final "
                "business-rule gate."
            ),
            plan=plan,
            research=research_summaries,
            warnings=warnings,
        )

    @staticmethod
    def _parse_datetime(value: str) -> datetime:

        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )

    @staticmethod
    def _infer_category(objective: str) -> Optional[str]:
        text = (objective or "").lower()

        category_map = [
            (("hike", "trek", "mountain"), "Hiking"),
            (("tea", "plantation"), "Tea & Plantation"),
            (
                ("culture", "heritage", "temple", "history"),
                "Culture & Heritage",
            ),
            (
                ("beach", "surf", "coast"),
                "Beach & Surfing",
            ),
            (
                ("wildlife", "safari"),
                "Wildlife & Safari",
            ),
            (
                ("train", "railway"),
                "Train Journeys",
            ),
            (
                ("waterfall", "nature", "forest"),
                "Nature & Waterfalls",
            ),
            (
                ("food", "cooking", "market"),
                "Food & Cooking",
            ),
            (
                ("festival", "event"),
                "Festivals & Events",
            ),
        ]

        for keywords, category in category_map:
            if any(
                keyword in text
                for keyword in keywords
            ):
                return category

        return None

    @staticmethod
    def _extract_budget(
        constraints: Optional[str],
    ) -> Optional[float]:
        if not constraints:
            return None

        import re

        match = re.search(
            r"(?:budget|under|below|maximum|max)"
            r"\s*[:=]?\s*\$?\s*"
            r"(\d+(?:\.\d+)?)",
            constraints,
            re.I,
        )

        return (
            float(match.group(1))
            if match
            else None
        )