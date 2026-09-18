from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings

from models.schemas import (
    ResearchAgentRequest,
    ResearchAgentResponse,
    PlannerAgentRequest,
    PlannerAgentResponse,
)

from agents.research_agent import ResearchAgent
from agents.planner_agent import PlannerAgent


app = FastAPI(
    title="Travel App - Agentic AI Subsystem",
    description="Member 1 Research Agent + Member 2 Planner Agent",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

research_agent = ResearchAgent()
planner_agent = PlannerAgent()


def verify_backend_key(x_ai_service_key: str | None):
    expected = settings.AI_SERVICE_API_KEY

    if expected and x_ai_service_key != expected:
        raise HTTPException(
            status_code=401,
            detail="Invalid AI service credential.",
        )


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "agents": [
            "Research Agent",
            "Planner Agent",
        ],
    }


@app.post(
    "/api/agents/research",
    response_model=ResearchAgentResponse,
)
async def run_research_agent(
        request: ResearchAgentRequest,
):
    try:
        response = await research_agent.execute(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent Error: {str(e)}",
        )


@app.post(
    "/api/agents/planner",
    response_model=PlannerAgentResponse,
)
async def run_planner_agent(
        request: PlannerAgentRequest,
        x_ai_service_key: str | None = Header(default=None),
):
    verify_backend_key(x_ai_service_key)

    try:
        return await planner_agent.execute(request)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Planner Agent execution failed.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True,
    )