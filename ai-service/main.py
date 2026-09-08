from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from models.schemas import ResearchAgentRequest, ResearchAgentResponse
from agents.research_agent import ResearchAgent

app = FastAPI(
    title="Travel App - Agentic AI Subsystem",
    description="Microservice running Member 1 Research Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

research_agent = ResearchAgent()

@app.get("/health")
def health_check():
    return {"status": "healthy", "agent": "Research Agent ready"}

@app.post("/api/agents/research", response_model=ResearchAgentResponse)
async def run_research_agent(request: ResearchAgentRequest):
    try:
        response = await research_agent.execute(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=True)