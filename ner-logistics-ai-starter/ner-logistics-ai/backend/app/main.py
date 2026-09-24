from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.schemas import AssessmentRequest, DecisionRequest, RouteRequest
    from app.ai.risk_engine import assess_delivery
    from app.services.decision_gate import validate_decision
    from app.services.routing import optimize_route, get_all_corridors
except ImportError:
    from schemas import AssessmentRequest, DecisionRequest, RouteRequest
    from ai.risk_engine import assess_delivery
    from services.decision_gate import validate_decision
    from services.routing import optimize_route, get_all_corridors

app = FastAPI(
    title="NER Logistics Intelligence API",
    version="1.0.0",
    description="Intelligent logistics, risk prediction, and automated safety gate API for North Eastern Region."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "NER Logistics AI Backend is running successfully!",
        "status": "online",
        "endpoints": {
            "docs": "/docs",
            "predict_risk": "/predict-risk",
            "validate_decision": "/validate-decision",
            "dashboard": "/api/v1/dashboard"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "ner-logistics-api"}

@app.post("/predict-risk")
def predict_risk(request: AssessmentRequest):
    """
    Evaluates delivery risk, uncertainty, and safety action using AI risk engine.
    Matches assess_delivery from risk_engine.py.
    """
    return assess_delivery(request)

@app.post("/validate-decision")
def validate_decision_gate(request: DecisionRequest):
    """
    Validates delivery execution decision through the A-TRUST safety gate.
    Matches validate_decision from decision_gate.py.
    """
    return validate_decision(request)

@app.post("/api/v1/ai/assess")
def ai_assess(request: AssessmentRequest):
    return assess_delivery(request)

@app.post("/api/v1/decisions/validate")
def decision_validate(request: DecisionRequest):
    return validate_decision(request)

@app.post("/api/v1/routes/optimize")
def route_optimize(request: RouteRequest):
    return optimize_route(request)

@app.get("/api/v1/routes/corridors")
def list_corridors():
    return get_all_corridors()

@app.get("/api/v1/dashboard")
def dashboard():
    return {
        "vehicles": 12,
        "on_time": 7,
        "delayed": 3,
        "at_risk": 2,
        "critical_deliveries": 2,
        "active_alerts": 3,
    }

@app.websocket("/ws/live")
async def live_socket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({
        "type": "connected",
        "message": "Live logistics channel connected"
    })
    try:
        while True:
            message = await websocket.receive_json()
            await websocket.send_json({
                "type": "ack",
                "payload": message
            })
    except Exception:
        await websocket.close()
