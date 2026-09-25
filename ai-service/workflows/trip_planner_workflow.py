"""
Trip Planner Workflow — runs all 4 agents in sequence.

Owner: Member 4 (Orchestrator)

Flow:
    Planner → Research → Budget → Approval

Business rules enforced by the orchestrator:
  1. ONE GUIDE PER TRIP — all stops come from a single guide.
  2. INTEREST MATCH — only experiences matching the traveler's
     chosen interests are eligible.
  3. PREFERRED TIMES — filter by the experience's start-time bucket
     (Morning / Afternoon / Evening).
  4. BUDGET TIER — sort experiences by tier preference
     (Budget → cheapest first; Luxury → most expensive first).
  5. BALANCED DISTRIBUTION — spread experiences across all trip days
     instead of front-loading Day 1.
"""
from datetime import datetime, timezone
from math import ceil
from typing import List, Dict, Optional

from agents import (
    PlannerAgent,
    ResearchAgent,
    BudgetAgent,
    ApprovalAgent,
)
from models.schemas import (
    ItineraryRequest,
    ItineraryResponse,
    TripStop,
    ExecutionLogEntry,
    PlannerRequest,
    ResearchAgentRequest,
    RecommendedExperience,
    BudgetRequest,
    ApprovalRequest,
)


class TripPlannerWorkflow:

    MAX_ACTIVITIES_PER_DAY = 2

    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearchAgent()
        self.budget = BudgetAgent()
        self.approval = ApprovalAgent()

    # ============================================================
    # Helpers
    # ============================================================
    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _log(
        self,
        log: List[ExecutionLogEntry],
        agent: str,
        action: str,
        status: str = "SUCCESS",
        details: str = "",
    ) -> None:
        log.append(
            ExecutionLogEntry(
                agent=agent,
                action=action,
                status=status,
                timestamp=self._now(),
                details=details,
            )
        )

    def _error_response(
        self, request: ItineraryRequest,
        log: List[ExecutionLogEntry], errors: List[str],
    ) -> ItineraryResponse:
        return ItineraryResponse(
            trip_id=request.trip_id,
            stops=[],
            budget_valid=False,
            total_estimated_cost=0.0,
            approval_status="ERROR",
            execution_log=log,
            errors=errors,
        )

    def _empty_response(
        self, request: ItineraryRequest,
        log: List[ExecutionLogEntry], warnings: List[str],
    ) -> ItineraryResponse:
        return ItineraryResponse(
            trip_id=request.trip_id,
            stops=[],
            winning_guide_id=None,
            winning_guide_name=None,
            winning_guide_city=None,
            budget_valid=False,
            total_estimated_cost=0.0,
            approval_status="PENDING",
            execution_log=log,
            errors=warnings,
        )

    # ============================================================
    # ONE GUIDE PER TRIP
    # ============================================================
    def _pick_winning_guide(
        self, experiences: List[RecommendedExperience],
    ) -> Optional[str]:
        if not experiences:
            return None

        groups: Dict[str, List[RecommendedExperience]] = {}
        for exp in experiences:
            gid = (exp.guide_id or "").strip()
            if not gid:
                continue
            groups.setdefault(gid, []).append(exp)

        if not groups:
            # Fallback to grouping by name
            by_name: Dict[str, List[RecommendedExperience]] = {}
            for exp in experiences:
                key = (exp.guide_name or "").strip() or "unknown"
                by_name.setdefault(key, []).append(exp)
            winner_name = max(by_name.items(), key=lambda kv: len(kv[1]))[0]
            return by_name[winner_name][0].guide_id or winner_name

        # Winner = most matching experiences
        return max(groups.items(), key=lambda kv: len(kv[1]))[0]

            # ============================================================
    # Category matching — substring-safe
    # ============================================================
    @staticmethod
    def _category_matches(category: Optional[str], interests: set) -> bool:
        """
        Fuzzy match: 'Culture' should match 'Culture & Heritage',
        'Nature' should match 'Nature & Waterfalls', etc.
        Checks both directions so either side can be shorter.
        """
        cat = (category or "").strip().lower()
        if not cat:
            return False
        for interest in interests:
            i = (interest or "").strip().lower()
            if not i:
                continue
            if i in cat or cat in i:
                return True
        return False

    # ============================================================
    # Time-bucket helpers
    # ============================================================
    @staticmethod
    def _hour_of(start_time: Optional[str]) -> Optional[int]:
        if not start_time or len(start_time) < 2:
            return None
        try:
            return int(start_time[:2])
        except ValueError:
            return None

    @classmethod
    def _matches_preferred_times(
        cls, exp: RecommendedExperience, preferred: List[str],
    ) -> bool:
        if not preferred:
            return True
        hh = cls._hour_of(exp.start_time)
        if hh is None:
            return True  # no start time → don't exclude
        for p in preferred:
            pl = p.strip().lower()
            if pl == "morning" and hh < 12:
                return True
            if pl == "afternoon" and 12 <= hh < 17:
                return True
            if pl == "evening" and hh >= 17:
                return True
        return False

    # ============================================================
    # Main workflow
    # ============================================================
    async def run(self, request: ItineraryRequest) -> ItineraryResponse:
        execution_log: List[ExecutionLogEntry] = []
        errors: List[str] = []

        # ================= 1. PLANNER =================
        try:
            plan = await self.planner.execute(
                PlannerRequest(
                    destination_name=request.destination_name,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    interests=request.interests,
                    travel_pace=request.travel_pace,
                    special_requests=request.special_requests,
                )
            )
            self._log(
                execution_log,
                "Planner",
                f"Created {len(plan.days)}-day plan",
                details=plan.reasoning,
            )
        except Exception as e:
            errors.append(f"Planner failed: {e}")
            return self._error_response(request, execution_log, errors)

        # ================= 2. RESEARCH =================
        try:
            research = await self.researcher.execute(
                ResearchAgentRequest(
                    destination_name=request.destination_name,
                    category_name=None,
                    max_budget=request.budget,
                    travel_date=request.start_date,
                )
            )
            self._log(
                execution_log,
                "Research",
                f"Found {research.total_found} matching experiences",
                details=research.agent_reasoning,
            )
        except Exception as e:
            errors.append(f"Research failed: {e}")
            return self._error_response(request, execution_log, errors)

        all_experiences = research.recommended_experiences or []

        # ============================================================
        # FILTER 1 — INTEREST MATCH
        # ============================================================
        # Build interest set from the traveler's actual interests (which the
        # Planner also used to seed per-day preferred_categories).
        plan_interests = {i.strip().lower() for i in (request.interests or []) if i.strip()}

        if plan_interests:
            interest_matched = [
                e for e in all_experiences
                if self._category_matches(e.category, plan_interests)
            ]
        else:
            interest_matched = list(all_experiences)

        if not interest_matched:
            available_categories = sorted({
                (e.category or "").strip()
                for e in all_experiences
                if (e.category or "").strip()
            })
            self._log(
                execution_log,
                "Orchestrator",
                "No experiences match the selected interests",
                status="WARNING",
                details=(
                    f"Traveler requested: {', '.join(request.interests)}. "
                    f"Available categories in {request.destination_name}: "
                    f"{', '.join(available_categories) or 'none'}. No match."
                ),
            )
            return self._empty_response(
                request, execution_log,
                [
                    f"No experiences available for interests: "
                    f"{', '.join(request.interests)}"
                ],
            )

        self._log(
            execution_log,
            "Orchestrator",
            f"Filtered to {len(interest_matched)} matching interest(s)",
            details=(
                f"Interests: {', '.join(request.interests)} — "
                f"{len(interest_matched)} of {len(all_experiences)} kept."
            ),
        )

        # ============================================================
        # FILTER 2 — PREFERRED TIMES
        # ============================================================
        preferred_times_list = request.preferred_times or []

        if preferred_times_list:
            time_matched = [
                e for e in interest_matched
                if self._matches_preferred_times(e, preferred_times_list)
            ]

            if not time_matched:
                # STRICT MODE — no fallback. Empty trip + clear error.
                available_times = sorted({
                    (e.start_time or "unknown")
                    for e in interest_matched
                })
                self._log(
                    execution_log,
                    "Orchestrator",
                    "No experiences match preferred times — strict mode",
                    status="WARNING",
                    details=(
                        f"Traveler preferred: {', '.join(preferred_times_list)}. "
                        f"None of the {len(interest_matched)} interest-matched "
                        f"experience(s) start at those times. "
                        f"Available start times: {', '.join(available_times) or 'none'}."
                    ),
                )
                return self._empty_response(
                    request, execution_log,
                    [
                        f"No experiences available for preferred times: "
                        f"{', '.join(preferred_times_list)}. "
                        f"Available start times: {', '.join(available_times) or 'none'}."
                    ],
                )

            self._log(
                execution_log,
                "Orchestrator",
                f"Time filter kept {len(time_matched)} experience(s)",
                details=f"Preferred times: {', '.join(preferred_times_list)}",
            )
        else:
            time_matched = list(interest_matched)

        # ============================================================
        # SORT BY BUDGET TIER
        # ============================================================
        tier = (request.budget_tier or "Mid").strip().lower()
        if tier == "luxury":
            filtered_experiences = sorted(
                time_matched, key=lambda e: -e.calculated_price
            )
        else:
            # Budget or Mid → cheapest first
            filtered_experiences = sorted(
                time_matched, key=lambda e: e.calculated_price
            )

        self._log(
            execution_log,
            "Orchestrator",
            f"Prepared {len(filtered_experiences)} candidate(s) for guide selection",
            details=(
                f"Budget tier: {request.budget_tier or 'Mid'} — "
                f"pool sorted accordingly."
            ),
        )

        # ============================================================
        # ONE GUIDE PER TRIP
        # ============================================================
        winner_guide_id = self._pick_winning_guide(filtered_experiences)
        if winner_guide_id is None:
            self._log(
                execution_log,
                "Orchestrator",
                "No guide available after filtering",
                status="WARNING",
            )
            return self._empty_response(
                request, execution_log,
                ["No matching guide found after applying filters."],
            )

        guide_experiences = [
            e for e in filtered_experiences
            if (e.guide_id or "").strip() == winner_guide_id
        ]

        # Fallback: match by name if guide_id match produced nothing
        if not guide_experiences:
            first = next(
                (e for e in filtered_experiences
                 if (e.guide_id or "").strip() == winner_guide_id),
                None,
            )
            if first:
                guide_experiences = [
                    e for e in filtered_experiences
                    if e.guide_name == first.guide_name
                ]

        winning_guide_name = (
            guide_experiences[0].guide_name if guide_experiences else None
        )

        self._log(
            execution_log,
            "Orchestrator",
            f"Selected guide: {winning_guide_name} "
            f"({len(guide_experiences)} experiences)",
            details="ONE GUIDE PER TRIP rule applied",
        )

        if not guide_experiences:
            return self._empty_response(
                request, execution_log,
                ["No experiences left after ONE GUIDE PER TRIP filter."],
            )

        # ============================================================
        # BUILD STOPS — BALANCED DISTRIBUTION
        # ============================================================
        total_days = len(plan.days)
        total_exp = len(guide_experiences)

        stops: List[TripStop] = []
        prices: List[float] = []
        stop_index = 0
        order = 0
        free_day_count = 0

        # Distribute evenly: for each day, per_day = ceil(remaining_exp / remaining_days)
        remaining_days = total_days
        for day in plan.days:
            if remaining_days <= 0:
                break
            remaining_exp = total_exp - order
            per_day = 0
            if remaining_exp > 0:
                per_day = max(1, min(
                    self.MAX_ACTIVITIES_PER_DAY,
                    ceil(remaining_exp / remaining_days),
                ))
            day_recs = guide_experiences[order : order + per_day]

            if day_recs:
                for rec in day_recs:
                    stops.append(
                        TripStop(
                            experience_id=rec.experience_id,
                            day_number=day.day_number,
                            title=rec.title,
                            description=rec.recommendation_reason,
                            location=request.destination_name,
                            estimated_cost=rec.calculated_price,
                            order_index=stop_index,
                        )
                    )
                    prices.append(rec.calculated_price)
                    order += 1
                    stop_index += 1
            else:
                stops.append(
                    TripStop(
                        experience_id=None,
                        day_number=day.day_number,
                        title=f"Day {day.day_number}: Free Day",
                        description="Explore at your own pace or relax.",
                        location=request.destination_name,
                        estimated_cost=0.0,
                        order_index=stop_index,
                    )
                )
                stop_index += 1
                free_day_count += 1

            remaining_days -= 1

        if free_day_count > 0:
            self._log(
                execution_log,
                "Orchestrator",
                f"Inserted {free_day_count} Free Day placeholder(s)",
                status="INFO",
                details=(
                    f"Only {total_exp} experience(s) available for "
                    f"{total_days} day(s) — remaining days marked as Free Days."
                ),
            )

        # ================= 3. BUDGET =================
        try:
            budget_result = await self.budget.execute(
                BudgetRequest(
                    selected_prices=prices,
                    budget=request.budget,
                    number_of_travelers=request.number_of_travelers,
                )
            )
            self._log(
                execution_log,
                "Budget",
                f"Total ${budget_result.total_cost:.2f} vs budget "
                f"${request.budget:.2f}",
                status="SUCCESS" if budget_result.valid else "WARNING",
                details=(
                    "; ".join(budget_result.warnings)
                    if budget_result.warnings
                    else "Within budget"
                ),
            )
        except Exception as e:
            errors.append(f"Budget failed: {e}")
            return self._error_response(request, execution_log, errors)

        # ================= 4. APPROVAL =================
        try:
            approval_result = await self.approval.execute(
                ApprovalRequest(
                    trip_id=request.trip_id,
                    total_cost=budget_result.total_cost,
                    budget=request.budget,
                    has_warnings=len(budget_result.warnings) > 0,
                )
            )
            self._log(
                execution_log,
                "Approval",
                "Paused for human review",
                details=approval_result.notes,
            )
        except Exception as e:
            errors.append(f"Approval failed: {e}")
            return self._error_response(request, execution_log, errors)

        # ================= FINAL RESPONSE =================
        return ItineraryResponse(
            trip_id=request.trip_id,
            stops=stops,
            winning_guide_id=winner_guide_id,
            winning_guide_name=winning_guide_name,
            winning_guide_city=None,
            budget_valid=budget_result.valid,
            total_estimated_cost=budget_result.total_cost,
            approval_status=approval_result.status,
            execution_log=execution_log,
            errors=errors,
        )