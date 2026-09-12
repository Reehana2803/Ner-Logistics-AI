from ..schemas import RouteRequest

def optimize_route(r: RouteRequest):
    # Demo route selector. Connect this service to OSRM/GraphHopper and OR-Tools
    # after real road-network data is available.
    candidates = [
        {"name": "AI Recommended", "eta_hours": 7.1, "risk": 0.22, "status": "AVAILABLE"},
        {"name": "Alternative", "eta_hours": 8.3, "risk": 0.36, "status": "AVAILABLE"},
    ]

    if r.priority == 1:
        # Critical delivery: favor lower risk even if slightly slower.
        candidates.sort(key=lambda x: (x["risk"], x["eta_hours"]))
    else:
        candidates.sort(key=lambda x: (x["risk"] * 0.65 + x["eta_hours"] / 10 * 0.35))

    best = candidates[0]
    return {
        "origin": r.origin,
        "destination": r.destination,
        "blocked_roads": r.blocked_roads,
        "recommended": best,
        "candidates": candidates,
        "method": "prototype_multi_objective_selection"
    }
