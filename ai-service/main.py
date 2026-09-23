from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from models.schemas import (
    ResearchAgentRequest,
    ResearchAgentResponse,
    PlannerRequest,
    PlannerResponse,
)
from agents.research_agent import ResearchAgent
from agents.planner_agent import PlannerAgent

app = FastAPI(
    title="Travel App - Agentic AI Subsystem",
    description="Microservice running the TripCraft agents",
    version="1.2.0",
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


# ================= HEALTH =================
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "agents": [
            "Planner Agent",
            "Research Agent",
        ],
        "version": "1.2.0",
    }


# ================= RESEARCH AGENT (Member 1) =================
@app.post("/api/agents/research", response_model=ResearchAgentResponse)
async def run_research_agent(request: ResearchAgentRequest):
    """Run only the Research Agent in isolation."""
    try:
        return await research_agent.execute(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")


# ================= PLANNER AGENT (Member 2) =================
@app.post("/api/agents/planner", response_model=PlannerResponse)
async def run_planner_agent(request: PlannerRequest):
    """Run only the Planner Agent in isolation."""
    try:
        return await planner_agent.execute(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=True,
    )