"""
Budget Agent — validates cost against the trip budget.

Owner: Member 4

Phase D: LLM-backed reasoning. Numeric math stays deterministic
(money accuracy matters), but the LLM generates human-friendly
warning messages and a reviewer summary.
"""
from typing import List
from pydantic import BaseModel, Field

from models.schemas import BudgetRequest, BudgetResponse
from utils.llm_client import get_llm


class _WarningOutput(BaseModel):
    """Structured output from the LLM judge."""
    warnings: List[str] = Field(
        default_factory=list,
        description=(
            "Short, plain-English warnings about the budget. "
            "Empty list if everything is fine."
        ),
    )
    reasoning: str = Field(
        default="",
        description="One or two sentences summarising the budget verdict.",
    )


class BudgetAgent:
    """
    Member 4 Agent: Validates the total itinerary cost against the
    traveler's budget and produces business-rule warnings.

    Numeric rules (deterministic):
        - Total cost = sum(prices) * travelers
        - Valid if total_cost <= budget
        - Warn if a single experience > 40% of budget

    LLM role (Phase D):
        - Turn raw numbers into clear, warm warnings
        - Add a short recommendation for the reviewer
    """

    SINGLE_EXPERIENCE_WARNING_THRESHOLD = 0.40  # 40%

    def __init__(self):
        self.llm = get_llm()

    async def execute(self, request: BudgetRequest) -> BudgetResponse:
        travelers = max(1, request.number_of_travelers)

        # ---------- Deterministic math (never delegate money to the LLM) ----------
        total_cost = round(
            sum(p * travelers for p in request.selected_prices), 2
        )
        valid = total_cost <= request.budget
        over_by = round(max(0.0, total_cost - request.budget), 2)

        per_experience = [
            {
                "index": i + 1,
                "price_per_person": p,
                "total": round(p * travelers, 2),
                "pct_of_budget": (
                    round((p * travelers) / request.budget * 100, 1)
                    if request.budget > 0 else 0
                ),
            }
            for i, p in enumerate(request.selected_prices)
        ]

        # ---------- LLM reasoning over the pre-computed facts ----------
        try:
            breakdown = "\n".join(
                f"  #{e['index']}: ${e['price_per_person']}/person × {travelers} "
                f"= ${e['total']} ({e['pct_of_budget']}% of budget)"
                for e in per_experience
            ) or "  (no experiences selected)"

            messages = [
                (
                    "system",
                    "You are the BUDGET VALIDATOR on a travel-planning team. "
                    "Given pre-computed numbers, produce 0–3 short, plain-English "
                    "warnings and a one-line summary. NEVER do arithmetic — "
                    "the numbers are already correct.",
                ),
                (
                    "user",
                    f"Budget: ${request.budget:.2f}\n"
                    f"Number of travelers: {travelers}\n"
                    f"Total cost: ${total_cost:.2f}\n"
                    f"Over budget by: ${over_by:.2f}\n"
                    f"Valid: {valid}\n\n"
                    f"Per-experience breakdown:\n{breakdown}\n\n"
                    f"Rule: warn if a single experience exceeds "
                    f"{int(self.SINGLE_EXPERIENCE_WARNING_THRESHOLD * 100)}% of budget.",
                ),
            ]

            judge = self.llm.with_structured_output(_WarningOutput)
            result: _WarningOutput = judge.invoke(messages)

            warnings = result.warnings or []
            if result.reasoning:
                warnings.append(result.reasoning)
        except Exception as e:
            # Fallback: never let an LLM failure break the workflow
            warnings = []
            if not valid:
                warnings.append(
                    f"Over budget by ${over_by:.2f} "
                    f"(total ${total_cost:.2f} vs budget ${request.budget:.2f})"
                )
            warnings.append(f"[Budget Agent fell back to rules: {type(e).__name__}]")

        return BudgetResponse(
            valid=valid,
            total_cost=total_cost,
            warnings=warnings,
            execution_status="COMPLETED",
        )