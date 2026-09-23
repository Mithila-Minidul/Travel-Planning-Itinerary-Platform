# TripCraft — Agentic AI Service

FastAPI microservice that runs the TripCraft 4-agent trip-planning
workflow. Called by the ASP.NET Core backend (never by React or Flutter
directly).

## The 4 Agents

| Agent | Owner | Responsibility |
| :--- | :--- | :--- |
| **Planner** | Member 2 | Creates a structured day-by-day trip plan |
| **Research** | Member 1 | Finds matching experiences and evaluates weather |
| **Budget** | Member 4 | Validates total cost against the traveler's budget |
| **Approval** | Member 3 | Pauses the workflow for Travel Agent review |

Plus an **Orchestrator** (Member 4) that chains all four in sequence.

## Endpoints

| Method | Path | Purpose |
| :--- | :--- | :--- |
| GET | `/health` | Service + agent status |
| POST | `/api/agents/research` | Run the Research Agent in isolation |
| POST | `/api/agents/generate-itinerary` | Run the full 4-agent workflow |

## Folder structure
