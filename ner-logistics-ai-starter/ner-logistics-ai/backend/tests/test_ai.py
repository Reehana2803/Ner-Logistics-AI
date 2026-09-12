from app.ai.risk_engine import assess_delivery
from app.schemas import AssessmentRequest

def test_high_risk_blocked_road():
    result = assess_delivery(AssessmentRequest(
        rainfall_mm=110,
        road_blocked=True,
        landslide_probability=0.8,
        flood_probability=0.7,
        hospital_stock_hours=3,
        delivery_priority=1,
        field_report_verified=True
    ))
    assert result["risk_level"] == "HIGH"
