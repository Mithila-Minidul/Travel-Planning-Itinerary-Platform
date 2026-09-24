"""
Budget Agent — validates cost against the trip budget.

Owner: Member 4

Input:  list of prices, budget, number of travelers.
Output: BudgetResponse with valid flag, total cost, and warnings.

Rules (business logic):
    - Total cost = sum(selected prices) * number_of_travelers
    - Trip is valid if total_cost <= budget
    - Warning if a single experience takes > 40% of budget
      (mirrors the "Budget Alert" business rule from the Member 4
      component spec: flag if cost > budget or category > 40%)
"""
from typing import List

from models.schemas import BudgetRequest, BudgetResponse


class BudgetAgent:
    """
    Member 4 Agent: Validates the total itinerary cost against
    the traveler's budget and produces business-rule warnings.
    """

    SINGLE_EXPERIENCE_WARNING_THRESHOLD = 0.40  # 40%

    async def execute(self, request: BudgetRequest) -> BudgetResponse:
        travelers = max(1, request.number_of_travelers)
        total_cost = round(
            sum(p * travelers for p in request.selected_prices), 2
        )

        warnings: List[str] = []

        # Rule 1: total must not exceed budget
        if total_cost > request.budget:
            over = round(total_cost - request.budget, 2)
            warnings.append(
                f"Over budget by ${over:.2f} "
                f"(total ${total_cost:.2f} vs budget ${request.budget:.2f})"
            )

        # Rule 2: no single experience may exceed 40% of budget
        if request.budget > 0:
            for idx, price in enumerate(request.selected_prices, start=1):
                single = price * travelers
                share = single / request.budget
                if share > self.SINGLE_EXPERIENCE_WARNING_THRESHOLD:
                    warnings.append(
                        f"Experience #{idx} takes {share * 100:.0f}% of "
                        f"budget — consider a cheaper alternative."
                    )

        valid = total_cost <= request.budget

        return BudgetResponse(
            valid=valid,
            total_cost=total_cost,
            warnings=warnings,
            execution_status="COMPLETED",
        )