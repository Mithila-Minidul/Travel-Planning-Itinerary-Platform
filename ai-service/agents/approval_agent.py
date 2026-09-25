"""
Approval Agent — pauses the workflow for human review.

Owner: Member 3

Phase D: LLM-backed summarisation. The gate decision (always
PENDING → Travel Agent) is deterministic per the spec's
human-in-the-loop rule. The LLM writes a concise reviewer brief
that summarises cost, budget status, warnings, and what needs
to happen next.
"""
from pydantic import BaseModel, Field

from models.schemas import ApprovalRequest, ApprovalResponse
from utils.llm_client import get_llm


class _ReviewerBrief(BaseModel):
    notes: str = Field(
        ...,
        description=(
            "2–4 sentence reviewer brief. Lead with the key fact "
            "(within budget / over budget). Mention any warnings. "
            "End with the required human action."
        ),
    )


class ApprovalAgent:
    """
    Member 3 Agent: Pauses the workflow for authorized human review.

    Deterministic rule (per spec Section 9, human approval):
        - Status is ALWAYS "PENDING"
        - requires_human_approval is ALWAYS True
        - The Travel Agent makes the actual approve/reject decision
          via the React AI Review Queue

    LLM role (Phase D):
        - Write a concise reviewer brief that a Travel Agent can
          read in 5 seconds and know exactly what to check.
    """

    def __init__(self):
        self.llm = get_llm()

    async def execute(self, request: ApprovalRequest) -> ApprovalResponse:
        # ----- Deterministic numbers (LLM never computes money) -----
        diff = request.total_cost - request.budget
        over_budget = diff > 0

        try:
            messages = [
                (
                    "system",
                    "You are the APPROVAL COORDINATOR on a travel-planning "
                    "team. You are given pre-computed facts about a trip "
                    "that the AI just generated. Write a 2–4 sentence "
                    "reviewer brief for the Travel Agent who must approve "
                    "or reject it. Rules:\n"
                    "- Lead with the budget verdict (within / over budget).\n"
                    "- If over budget, state the exact overage amount.\n"
                    "- Mention whether budget warnings are present.\n"
                    "- End with: 'Reviewer must Approve, Reject, or "
                    "Request Revision before the trip can be booked.'\n"
                    "- Do NOT invent numbers. Use only the facts given.",
                ),
                (
                    "user",
                    f"Trip ID: {request.trip_id}\n"
                    f"Total cost: ${request.total_cost:.2f}\n"
                    f"Budget: ${request.budget:.2f}\n"
                    f"Difference: ${diff:+.2f} "
                    f"({'over' if over_budget else 'under'} budget)\n"
                    f"Budget warnings present: {request.has_warnings}",
                ),
            ]

            judge = self.llm.with_structured_output(_ReviewerBrief)
            result: _ReviewerBrief = await judge.ainvoke(messages)

            notes = result.notes.strip()
            if not notes:
                raise ValueError("LLM returned empty notes")

            # Safety net: make sure the required sentence is present
            required_phrase = "Reviewer must Approve, Reject, or Request Revision"
            if required_phrase.lower() not in notes.lower():
                notes = (
                    f"{notes} {required_phrase} before the trip can be booked."
                ).strip()

        except Exception as e:
            # Fallback: previous deterministic notes
            notes_parts = [
                f"Trip {request.trip_id} awaiting Travel Agent review.",
                f"Cost ${request.total_cost:.2f} vs budget "
                f"${request.budget:.2f}.",
            ]
            if request.has_warnings:
                notes_parts.append(
                    "⚠️ Budget warnings present — priority review recommended."
                )
            else:
                notes_parts.append("Budget validated — standard review.")
            notes_parts.append(
                "Reviewer must Approve, Reject, or Request Revision "
                "before the trip can be booked."
            )
            notes = " ".join(notes_parts)
            notes += f" [Approval Agent fell back to rules: {type(e).__name__}]"

        return ApprovalResponse(
            status="PENDING",                 # deterministic — never LLM-set
            requires_human_approval=True,     # deterministic — never LLM-set
            notes=notes,
            execution_status="COMPLETED",
        )