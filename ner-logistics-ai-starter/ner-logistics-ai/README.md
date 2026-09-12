# 🚚 NER Logistics AI Platform

> **Intelligent Logistics, Dynamic Risk Prediction & Automated Safety Gate for the North Eastern Region (NER)**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.1+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.1+-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9+-199900.svg?style=flat&logo=leaflet)](https://leafletjs.com)
[![PostGIS](https://img.shields.io/badge/PostGIS-16--3.5-336791.svg?style=flat&logo=postgresql)](https://postgis.net)

---

## 📌 Overview

The **North Eastern Region (NER) Logistics AI Platform** is a mission-critical logistics command center engineered specifically for the distinct operational, topographic, and weather challenges of Northeast India. 

Operating in rugged mountainous terrains subject to intense monsoonal rainfall, frequent flash floods, landslides, and intermittent communication, the platform empowers logistics managers to ensure timely delivery of essential goods, vaccines, emergency medicine, and critical supplies.

---

## ✨ Core Features

- 🗺️ **Live Command Center & Geospatial Mapping**: Real-time Leaflet-based situation map visualizing active transport corridors (e.g., Guwahati to Silchar), active road blockades (e.g., NH-6 / Sonapur Tunnel), logistics hubs, and destination hospitals.
- 🧠 **AI-Powered Risk & ETA Assessment Engine**: Evaluates delivery risk scores, confidence, and uncertainty based on real-time precipitation, wind velocity, landslide/flood probabilities, GPS telemetry freshness, hospital stock levels, and cargo priority.
- 🛡️ **A-TRUST Safety & Decision Gate**: A strict **Human-in-the-Loop** verification architecture (*Trust, Risk, Uncertainty, Safety, Transparency*). The system never autonomously dispatches vehicles under high-risk or low-confidence conditions without operator authorization.
- 🛣️ **Dynamic Route Optimization**: Priority-aware routing framework ready for constraint solvers (OR-Tools / OSRM) with instant bypass computation around blocked highways.
- 📡 **Real-Time WebSocket Gateway**: Bi-directional telemetry streaming live dashboard metrics, situational updates, and field reports.
- 🐘 **PostGIS Spatial Database**: Production-ready geospatial database infrastructure for indexing transit nodes, geofences, and terrain data.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│             React + Vite + TypeScript Command Center        │
│          (Leaflet Map, Live Metrics, Risk & Routing UI)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST & WebSockets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI API Gateway                      │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Telemetry & │       │   AI Risk    │       │  Constraint  │
│  Data Trust  │       │    Engine    │       │   Routing    │
│  Validation  │       │ (Uncertainty)│       │  (OR-Tools)  │
└───────┬──────┘       └───────┬──────┘       └───────┬──────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   A-TRUST Safety Gate                       │
│    (Auto-Enforce: Risk < 0.85 & Conf >= 0.80 & Verified)    │
│                [Human Review / Approval Gate]               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            PostgreSQL 16 + PostGIS 3.5 Storage              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
NER Logistics AI/
├── README.md                              # Main platform documentation
└── ner-logistics-ai-starter/
    └── ner-logistics-ai/
        ├── docker-compose.yml             # PostGIS Docker configuration
        ├── README.md                      # Starter guide
        ├── docs/
        │   └── ARCHITECTURE.md            # Deep-dive architecture reference
        ├── backend/
        │   ├── .env.example               # Environment template
        │   ├── requirements.txt           # Python dependencies
        │   ├── app/
        │   │   ├── main.py                # FastAPI app & endpoints
        │   │   ├── schemas.py             # Pydantic data contracts
        │   │   ├── ai/
        │   │   │   └── risk_engine.py     # AI risk and confidence scoring
        │   │   └── services/
        │   │       ├── decision_gate.py   # A-TRUST safety validation
        │   │       └── routing.py         # Route optimization service
        │   └── tests/                     # Automated test suites
        └── frontend/
            ├── package.json               # Frontend dependencies & scripts
            ├── tsconfig.json              # TypeScript configuration
            ├── vite.config.ts             # Vite development server config
            ├── index.html                 # HTML application root
            └── src/
                ├── main.tsx               # React entrypoint
                ├── App.tsx                # Command Center Dashboard & Map
                ├── api.ts                 # Backend API client
                └── styles.css             # Command Center UI stylesheet
```

---

## 🚀 Getting Started

### Prerequisites

- **Python**: `3.10` or higher
- **Node.js**: `v18.0` or higher (tested on `v22+`)
- **Docker** *(Optional, for PostGIS)*: Docker Desktop / Engine

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd ner-logistics-ai-starter/ner-logistics-ai/backend
   ```

2. Create and activate a virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

- **API Base URL**: `http://localhost:8000`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd ner-logistics-ai-starter/ner-logistics-ai/frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

- **Command Center UI**: `http://localhost:5173`

---

### 3. Database Setup (Optional)

To spin up a containerized PostGIS instance:

```bash
cd ner-logistics-ai-starter/ner-logistics-ai
docker compose up -d db
```

Default credentials:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `ner_logistics`
- **User**: `ner`
- **Password**: `ner_dev_password`

---

## 📡 API Reference

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service status, health info, and endpoints directory |
| `GET` | `/health` | Liveness and health probe |
| `GET` | `/api/v1/dashboard` | Dashboard metrics: active vehicles, delays, at-risk loads |
| `POST` | `/api/v1/ai/assess` | Run AI delivery risk, confidence, and uncertainty assessment |
| `POST` | `/api/v1/decisions/validate` | Validate execution against the A-TRUST safety gate |
| `POST` | `/api/v1/routes/optimize` | Compute risk-aware optimized routing with road blockades |
| `WS` | `/ws/live` | WebSocket connection for real-time fleet events and alerts |

---

### Sample Request & Response

#### AI Risk Assessment (`POST /api/v1/ai/assess`)

**Request Payload**:
```json
{
  "rainfall_mm": 95.0,
  "wind_kmh": 35.0,
  "road_blocked": true,
  "landslide_probability": 0.65,
  "flood_probability": 0.55,
  "gps_freshness_minutes": 4,
  "field_report_verified": true,
  "hospital_stock_hours": 5,
  "delivery_priority": 1
}
```

**Response**:
```json
{
  "risk_score": 0.725,
  "risk_level": "HIGH",
  "ai_confidence": 0.92,
  "uncertainty": 0.08,
  "explanation": [
    "Weather and hazard conditions were included.",
    "Road status was included.",
    "GPS freshness and field-report verification affect confidence.",
    "Hospital stock and delivery priority affect urgency."
  ],
  "safety_action": "HUMAN_REVIEW"
}
```

---

#### A-TRUST Safety Gate Validation (`POST /api/v1/decisions/validate`)

**Request Payload**:
```json
{
  "route_risk": 0.72,
  "ai_confidence": 0.85,
  "road_verified": true,
  "hospital_critical": true,
  "critical_delivery": true,
  "route_available": true,
  "operator_approved": false
}
```

**Response**:
```json
{
  "decision": "APPROVE",
  "reasons": [
    "Safety conditions satisfied."
  ],
  "execution_allowed": true
}
```

---

## 🛡️ The A-TRUST Safety Framework

Logistics operations in high-risk zones should **never treat AI predictions as unreviewed autonomous commands**. The platform implements the **A-TRUST** principle:

1. **T - Trustworthy Telemetry**: Data freshness and GPS ping timestamps are penalized if stale. Unverified citizen alerts undergo field verification.
2. **R - Risk Assessment**: Comprehensive environmental and infrastructural risk scoring.
3. **U - Uncertainty Quantification**: The system quantifies epistemic uncertainty (`1.0 - confidence`). Low-confidence predictions automatically halt auto-dispatch.
4. **S - Safety Gates**: Automated hard bounds (e.g. route risk > 85% is strictly rejected; critical supplies under risk require explicit human authorization).
5. **T - Transparency & Audit**: Every model output includes human-readable rationale and is logged for post-incident auditability.

---

## 🔮 AI Development Roadmap

1. **Current Baseline**: Deterministic heuristic scoring engine with real-time parameter weighting.
2. **Phase 2**: Train gradient-boosted decision trees (**LightGBM**) on historical Assam/Meghalaya monsoon transit data.
3. **Phase 3**: Graph Neural Networks (GNN) and topological road-network representations aware of single-artery choke points (such as NH-6, NH-27, and Barak Valley passes).
4. **Phase 4**: Automated integration with IMD (India Meteorological Department) Doppler radar feeds and CWC (Central Water Commission) flood gauge sensors.

---

## 📄 License

This project is developed for NER logistics innovation and research.
