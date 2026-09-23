"""
Trip Planner Workflow — runs all 4 agents in sequence.

Owner: Member 4 (Orchestrator)

Flow:
    Planner → Research → Budget → Approval
    Each agent writes to a shared execution log.

The workflow returns a complete ItineraryResponse that the C# backend
saves to the database. If any agent fails, the workflow halts
safely and returns an error response with the execution log so far.
"""
from datetime import datetime, timezone
from typing import List

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
        self,
        request: ItineraryRequest,
        log: List[ExecutionLogEntry],
        errors: List[str],
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
                    category_name=None,  # get all matches, distribute later
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

        # ================= BUILD STOPS =================
        stops: List[TripStop] = []
        prices: List[float] = []
        winning_guide_name = None
        order = 0

        experiences = research.recommended_experiences or []
        if experiences:
            winning_guide_name = experiences[0].guide_name

        for day in plan.days:
            day_recs = experiences[order : order + self.MAX_ACTIVITIES_PER_DAY]
            for rec in day_recs:
                stops.append(
                    TripStop(
                        experience_id=rec.experience_id,
                        day_number=day.day_number,
                        title=rec.title,
                        description=rec.recommendation_reason,
                        location=request.destination_name,
                        estimated_cost=rec.calculated_price,
                        order_index=order,
                    )
                )
                prices.append(rec.calculated_price)
                order += 1

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
            winning_guide_id=None,
            winning_guide_name=winning_guide_name,
            winning_guide_city=None,
            budget_valid=budget_result.valid,
            total_estimated_cost=budget_result.total_cost,
            approval_status=approval_result.status,
            execution_log=execution_log,
            errors=errors,
        )