
# TripCraft - Integrated Full-Stack and Agentic AI Travel Planning Platform

**TripCraft** is a comprehensive, full-stack travel planning ecosystem designed to connect Travelers, Local Guides, Travel Agents, and Administrators. The platform solves the problem of fragmented travel planning by leveraging a **multi-agent AI system** to generate personalized, day-by-day travel itineraries for Sri Lanka, which are then reviewed, validated, and approved by human Travel Agents before booking.

Developed for **SE3090 - Software Engineering Frameworks (Assignment 1)**.

## 📖 Table of Contents
1. [Business Problem & Solution](#business-problem--solution)
2. [Technology Stack](#technology-stack)
3. [System Architecture & Agentic AI Workflow](#system-architecture--agentic-ai-workflow)
4. [Directory Structure](#directory-structure)
5. [User Roles & Features](#user-roles--features)
6. [Setup & Installation](#setup--installation)
7. [Environment Variables](#environment-variables)
8. [API Documentation & Deployment](#api-documentation--deployment)
9. [Testing Strategy](#testing-strategy)
10. [Git, CI/CD & Collaborative Development](#git-cicd--collaborative-development)
11. [Academic Requirements (SE3090)](#academic-requirements-se3090)
12. [License](#license)

---

## 1. Business Problem & Solution

### The Problem
Planning a trip involves coordinating multiple disconnected elements: finding destinations, validating budgets, checking weather, booking local guides, and ensuring experiences match traveler interests. This process is often manual, time-consuming, and prone to overspending or mismatched expectations.

### The Solution
TripCraft automates the itinerary planning process using an **Agentic AI Orchestrator**. The system takes a traveler's objective (destination, dates, budget, interests) and runs it through four specialized AI agents. The AI generates a structured plan, which is then paused for **human-in-the-loop approval** by a Travel Agent. Once approved, the traveler can book the trip, pay via PayHere, and check-in using a QR code.

---

## 2. Technology Stack

| Area | Technology | Justification |
| :--- | :--- | :--- |
| **Backend** | C# (.NET 8.0), ASP.NET Core Web API | Mandatory public backend. Provides RESTful endpoints, JWT auth, and EF Core data access. |
| **Database** | PostgreSQL | Relational integrity, JSON support, and robust support for EF Core migrations. |
| **AI Microservice** | Python, FastAPI, LangChain, Google Gemini | Decoupled microservice for the 4-Agent workflow. FastAPI provides async execution; LangChain handles LLM orchestration. |
| **Web Frontend** | React (Vite), Tailwind CSS, MUI, Recharts | Administrative dashboards, AI monitoring, and approval controls. Context API for state management. |
| **Mobile App** | Flutter, Dart, Provider | User-facing operational workflows. Provider for state management. QR Flutter for check-in. |
| **Third-Party APIs** | Cloudinary (Images), OpenWeatherMap (Weather), PayHere (Payments) | Meaningful external integrations routed through the ASP.NET Core backend. |

---

## 3. System Architecture & Agentic AI Workflow

### High-Level Architecture
The system follows a strict integrated architecture pattern:
1. **Flutter Mobile App** (User) and **React Web App** (Staff/Admin) communicate **only** with the **ASP.NET Core Web API**.
2. The ASP.NET Core backend handles authentication, authorization, business rules, and database interactions (PostgreSQL).
3. For AI tasks, the backend calls the **Python FastAPI AI Service** internally. The AI service never directly communicates with the databases or clients.
4. The AI service uses **allow-listed tools** to call back to specific ASP.NET Core endpoints (e.g., searching experiences, fetching weather) to build the itinerary.

### Agentic AI Subsystem (The 4-Agent Workflow)
The AI subsystem is not a generic chatbot. It is a multi-step, structured workflow orchestrated by `TripPlannerWorkflow`:

1. **Planner Agent**: 
   - *Responsibility*: Creates a structured day-by-day trip plan.
   - *Input*: Destination, dates, pace, interests.
   - *Output*: A `PlannerResponse` containing day themes and preferred categories.
2. **Research Agent**:
   - *Responsibility*: Finds matching experiences and evaluates weather suitability.
   - *Tools*: `search_experiences_tool`, `get_destination_weather_tool`.
   - *Output*: A list of `RecommendedExperience` objects with weather match status.
3. **Budget Agent**:
   - *Responsibility*: Validates total cost against the traveler's budget.
   - *Deterministic Rule*: Total cost > Budget triggers a warning.
   - *Output*: `BudgetResponse` with valid flag and warnings.
4. **Approval Agent**:
   - *Responsibility*: Pauses the workflow for human review.
   - *Deterministic Rule*: Status is **always** `PENDING`. Requires human approval.
   - *Output*: `ApprovalResponse` with reviewer notes.

**Human-in-the-Loop**: The Travel Agent reviews the AI-generated itinerary on the React Web App. They can **Approve**, **Reject** (with a reason), or **Request Revision**. Only approved trips can be booked by the traveler.

---

## 4. Directory Structure

```text
├── ai-service/           # Python FastAPI Microservice (Agentic AI)
│   ├── agents/           # Planner, Research, Budget, Approval Agents
│   ├── tools/            # HTTP clients to call .NET backend endpoints
│   ├── workflows/        # TripPlannerWorkflow Orchestrator
│   └── main.py           # FastAPI entry point
├── backend/              # ASP.NET Core Web API
│   ├── Controllers/      # API Endpoints (Trips, Bookings, Auth, etc.)
│   ├── Data/             # EF Core DbContext & Migrations
│   ├── DTOs/             # Data Transfer Objects
│   ├── Models/           # Database Entities
│   └── Services/         # Business logic (Booking, Payment, ImageUpload)
├── frontend/             # React Web Dashboard (Admin, Agent, Guide)
│   ├── src/api/          # Axios API clients
│   ├── src/pages/        # React Pages (Dashboard, AI Review, Bookings)
│   └── src/components/   # Reusable UI components
└── mobile/               # Flutter Mobile App (Traveler)
    ├── lib/screens/      # Flutter Screens (Trips, Bookings, Payments)
    ├── lib/services/     # API service wrappers
    └── lib/models/       # Dart data models
```

---

## 5. User Roles & Features

### 🧳 Traveler (Flutter Mobile App)
- **AI Trip Builder**: Submit domain objectives (destination, budget, interests, pace).
- **Browse & Book**: View AI-generated itineraries, browse experiences, and book approved trips.
- **Secure Payments**: Integrated PayHere SDK for sandbox payments.
- **QR Check-in**: Device camera feature to scan QR codes for trip check-in.
- **Reviews**: Rate and review experiences post-trip.

### 🗺️ Local Guide (React Web App)
- **Experience Management**: Create, update, and manage experiences with dynamic pricing.
- **Booking Management**: Confirm, reject, or check-in travelers.
- **Reviews & Ratings**: Reply to traveler reviews.
- **Earnings Dashboard**: Track total earnings and payouts.

### 🏢 Travel Agent (React Web App)
- **AI Review Queue**: Review AI-generated itineraries. Approve, reject, or request revisions.
- **AI Performance Monitoring**: View detailed execution logs, agent timings, and workflow audit trails.
- **Trip Oversight**: Manage all trips and traveler requests.

### 🛡️ Administrator (React Web App)
- **User Management**: Approve/Reject Local Guides and Travel Agents.
- **Catalog Management**: Manage destinations, categories, and experiences.
- **Platform Analytics**: View revenue trends, user distributions, and booking stats.
- **Financial Oversight**: Process refunds and view payment dashboards.

---

## 6. Setup & Installation

### Prerequisites
- .NET 8.0 SDK
- Python 3.10+
- Node.js 18+
- Flutter SDK (3.0+)
- PostgreSQL (v14+)
- Cloudinary, PayHere, and OpenWeatherMap accounts.

### Step 1: Backend API (.NET)
1. Navigate to `backend/`.
2. Create a `.env` file (see [Environment Variables](#environment-variables)).
3. Run database migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the API:
   ```bash
   dotnet run
   ```
   *API runs on `http://localhost:7000`. Swagger is available at `/swagger`.*

### Step 2: AI Service (Python FastAPI)
1. Navigate to `ai-service/`.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file (see [Environment Variables](#environment-variables)).
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *AI Service runs on `http://localhost:8000`. Interactive docs at `/docs`.*

### Step 3: React Web Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend runs on `http://localhost:4000` (proxies `/api` to backend).*

### Step 4: Flutter Mobile App
1. Navigate to `mobile/`.
2. Create a `.env` file (see [Environment Variables](#environment-variables)).
3. Fetch packages:
   ```bash
   flutter pub get
   ```
4. Run the app (ensure an emulator or device is connected):
   ```bash
   flutter run
   ```

---

## 7. Environment Variables


### Backend (`backend/.env`)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_agentic_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Auth
JWT_SECRET=YourSuperSecretKeyMustBeAtLeast32CharactersLong!
JWT_ISSUER=TravelAppBackend
JWT_AUDIENCE=TravelAppClients

# AI Service Integration
AI_SERVICE_URL=http://localhost:8000

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PayHere (Payments)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_SANDBOX=true
PAYHERE_BACKEND_PUBLIC_URL=http://localhost:7000

# Weather API
WEATHER_API_KEY=your_openweathermap_key
```

### AI Service (`ai-service/.env`)
```env
SERVICE_PORT=8000
BACKEND_API_URL=http://localhost:7000/api
ENVIRONMENT=development

# Google Gemini (LangChain)
GOOGLE_API_KEY=your_gemini_api_key
CHAT_MODEL=gemini-3.5-flash-lite
```

### Mobile App (`mobile/.env`)
```env
# Use 10.0.2.2 for Android Emulator, or your LAN IP for a physical device
API_BASE_URL=http://10.0.2.2:7000/api
```

---

## 8. API Documentation & Deployment

React web = https://travel-planning-itinerary-platform.vercel.app
Swagger UI = https://fearless-abundance-production-1480.up.railway.app/swagger/index.html
API / Health = https://fearless-abundance-production-1480.up.railway.app/api/health
Demo Video & APK link = https://mysliit-my.sharepoint.com/:f:/g/personal/it24101450_my_sliit_lk/IgAUwK6w0ckFT7VenAYj-40EAabT8jByvnhh0g5JMy-5X0Y?e=FyUGxF

[Admin Credentials = admin@travelapp.com ]
		Admin@123456


*Deployment platforms: Backend (Railway), Ai-Services (Railway), Database (PostgreSQL on Supabase), Frontend (Vercel).*

---

## 9. Testing Strategy

The project implements a multi-layered testing approach as per SE3090 requirements:
- **Backend**: xUnit tests for controllers, services, and validation logic. Integration tests for EF Core PostgreSQL migrations.
- **Frontend**: React Testing Library for component, form-validation, and protected-route tests.
- **Mobile**: Flutter unit and widget tests for navigation, forms, and API integration.
- **Agent Evaluation**: Golden case testing for the 4-agent workflow. Rule-based assertions on tool selection, schema validation of outputs, and deterministic validation of the human approval gate.

## 10. Academic Requirements (SE3090)


### Individual Contributions
*(Replace with actual names and components)*
- **Student 1 (Component A)**: Auth, User Management, Admin Dashboard, Agentic AI - Approval Agent.
- **Student 2 (Component B)**: Destinations, Experiences, Local Guides, Agentic AI - Research Agent.
- **Student 3 (Component C)**: Trips, AI Review Queue, Agentic AI - Planner Agent.
- **Student 4 (Component D)**: Bookings, Payments, Refunds, Agentic AI - Budget Agent & Orchestrator.

---

## 📄 License
This project is developed for academic purposes (SE3090 - Software Engineering Frameworks). All rights reserved.
```