from pydantic import BaseModel, Field
from typing import List, Optional

class AssessmentRequest(BaseModel):
    rainfall_mm: float = Field(0, ge=0)
    wind_kmh: float = Field(0, ge=0)
    road_blocked: bool = False
    landslide_probability: float = Field(0, ge=0, le=1)
    flood_probability: float = Field(0, ge=0, le=1)
    gps_freshness_minutes: float = Field(0, ge=0)
    field_report_verified: bool = False
    hospital_stock_hours: float = Field(24, ge=0)
    delivery_priority: int = Field(3, ge=1, le=4)

class RouteRequest(BaseModel):
    origin: str
    destination: str
    blocked_roads: List[str] = []
    priority: int = Field(3, ge=1, le=4)

class DecisionRequest(BaseModel):
    route_risk: float = Field(..., ge=0, le=1)
    ai_confidence: float = Field(..., ge=0, le=1)
    road_verified: bool
    critical_delivery: bool
    operator_approved: bool = False
    route_available: bool = True
