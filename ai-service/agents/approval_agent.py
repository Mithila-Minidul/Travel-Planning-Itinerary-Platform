"""
Approval Agent — pauses the workflow for human review.

Owner: Member 3

Input:  trip id, total cost, budget, warning flag from Budget Agent.
Output: ApprovalResponse with status = "PENDING".

Per the assignment spec, this agent is the "validation or safety"
type — its job is to enforce the human-in-the-loop rule: no high-impact
action (confirming a trip) may proceed without an authorized user's
decision.

The actual approval decision (approve/reject) is made by the Travel
Agent via the React interface. This agent simply:
    1. Receives the validated itinerary
    2. Sets the trip status to PENDING
    3. Produces a structured audit entry
    4. Hands control to the human reviewer
"""
from models.schemas import ApprovalRequest, ApprovalResponse


class ApprovalAgent:
    """
    Member 3 Agent: Pauses the workflow for authorized human review.
    The Travel Agent approves or rejects via the React AI Review Queue.
    """

    async def execute(self, request: ApprovalRequest) -> ApprovalResponse:
        notes_parts = [
            f"Trip {request.trip_id} awaiting Travel Agent review.",
            f"Cost ${request.total_cost:.2f} vs budget ${request.budget:.2f}.",
        ]

        # Extra emphasis when the Budget Agent flagged warnings
        if request.has_warnings:
            notes_parts.append(
                "⚠️ Budget warnings present — priority review recommended."
            )
        else:
            notes_parts.append("Budget validated — standard review.")

        notes_parts.append(
            "Reviewer must Approve, Reject, or Request Revision before "
            "the trip can be booked."
        )

        return ApprovalResponse(
            status="PENDING",
            requires_human_approval=True,
            notes=" ".join(notes_parts),
            execution_status="COMPLETED",
        )