from ..schemas import AssessmentRequest

def clamp(x: float) -> float:
    return max(0.0, min(1.0, x))

def assess_delivery(r: AssessmentRequest):
    # Prototype explainable score. Replace/augment with a validated LightGBM model.
    weather = clamp(r.rainfall_mm / 120.0) * 0.25 + clamp(r.wind_kmh / 100.0) * 0.05
    hazards = r.landslide_probability * 0.25 + r.flood_probability * 0.20
    road = 0.20 if r.road_blocked else 0.0
    data_penalty = 0.08 if r.gps_freshness_minutes > 20 else 0.0
    verification_bonus = -0.05 if r.field_report_verified else 0.0
    urgency = max(0.0, (12 - r.hospital_stock_hours) / 12) * 0.10
    priority = (4 - r.delivery_priority) * 0.03

    risk = clamp(weather + hazards + road + data_penalty + verification_bonus + urgency + priority)

    confidence = 0.92
    if r.gps_freshness_minutes > 30:
        confidence -= 0.15
    if not r.field_report_verified:
        confidence -= 0.07
    if r.road_blocked and not r.field_report_verified:
        confidence -= 0.08
    confidence = clamp(confidence)

    level = "HIGH" if risk >= 0.70 else "MEDIUM" if risk >= 0.40 else "LOW"

    return {
        "risk_score": round(risk, 3),
        "risk_level": level,
        "ai_confidence": round(confidence, 3),
        "uncertainty": round(1 - confidence, 3),
        "explanation": [
            "Weather and hazard conditions were included.",
            "Road status was included.",
            "GPS freshness and field-report verification affect confidence.",
            "Hospital stock and delivery priority affect urgency."
        ],
        "safety_action": "HUMAN_REVIEW" if risk >= 0.70 or confidence < 0.80 else "AUTO_CONTINUE"
    }
