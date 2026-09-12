from ..schemas import DecisionRequest

def validate_decision(r: DecisionRequest):
    reasons = []

    if not r.route_available:
        return {"decision": "REJECT", "reasons": ["No verified route is available."]}

    if r.route_risk >= 0.85:
        reasons.append("Route risk is above emergency safety threshold.")

    if r.ai_confidence < 0.80:
        reasons.append("AI confidence is below configured threshold.")

    if not r.road_verified:
        reasons.append("Road status is not sufficiently verified.")

    if r.critical_delivery and reasons and not r.operator_approved:
        return {
            "decision": "HUMAN_REVIEW",
            "reasons": reasons,
            "execution_allowed": False
        }

    return {
        "decision": "APPROVE",
        "reasons": reasons or ["Safety conditions satisfied."],
        "execution_allowed": True
    }
