from typing import List, Dict, Any
from ..schemas import RouteRequest

# Known transit corridors across the North Eastern Region (NER)
CORRIDOR_REGISTRY: Dict[str, Dict[str, Any]] = {
    "Guwahati Hub -> Silchar Civil Hospital": {
        "origin": "Guwahati Hub",
        "destination": "Silchar Civil Hospital",
        "origin_coords": [26.1445, 91.7362],
        "destination_coords": [24.8333, 92.7789],
        "candidates": [
            {
                "name": "NH-27 / Haflong Bypass (AI Recommended)",
                "via": "Nagaon -> Lumding -> Haflong -> Silchar",
                "distance_km": 345,
                "eta_hours": 7.2,
                "risk": 0.22,
                "status": "AVAILABLE",
                "hazards": ["Curving mountain pass", "Haflong hill section"],
                "road_segment": "NH-27",
                "waypoints": [
                    [26.1445, 91.7362],
                    [26.3452, 92.6840],
                    [25.7500, 93.1700],
                    [25.1700, 93.0200],
                    [24.8333, 92.7789]
                ]
            },
            {
                "name": "NH-6 / Sonapur Tunnel Corridor",
                "via": "Shillong -> Jowai -> Sonapur -> Badarpur -> Silchar",
                "distance_km": 310,
                "eta_hours": 8.5,
                "risk": 0.68,
                "status": "AT_RISK",
                "hazards": ["Active mudslide zone", "Sonapur Tunnel choke point"],
                "road_segment": "NH-6 / Sonapur Tunnel",
                "waypoints": [
                    [26.1445, 91.7362],
                    [25.5788, 91.8933],
                    [25.4500, 92.2000],
                    [25.1000, 92.3600],
                    [24.8333, 92.7789]
                ]
            },
            {
                "name": "Southern Barak River Valley Route",
                "via": "Dharmanagar -> Karimganj -> Silchar",
                "distance_km": 380,
                "eta_hours": 9.4,
                "risk": 0.35,
                "status": "AVAILABLE",
                "hazards": ["Monsoon waterlogging in low-lying plains"],
                "road_segment": "SH-12",
                "waypoints": [
                    [26.1445, 91.7362],
                    [25.5788, 91.8933],
                    [24.3800, 92.1500],
                    [24.8600, 92.3500],
                    [24.8333, 92.7789]
                ]
            }
        ]
    },
    "Guwahati Hub -> NEIGRIHMS Shillong": {
        "origin": "Guwahati Hub",
        "destination": "NEIGRIHMS Shillong",
        "origin_coords": [26.1445, 91.7362],
        "destination_coords": [25.5788, 91.8933],
        "candidates": [
            {
                "name": "GS Road 4-Lane Express Corridor (AI Recommended)",
                "via": "Dispur -> Khanapara -> Nongpoh -> Umiam Lake -> Shillong",
                "distance_km": 98,
                "eta_hours": 2.2,
                "risk": 0.12,
                "status": "CLEAR",
                "hazards": ["Fog in upper elevation Umiam sector"],
                "road_segment": "NH-106",
                "waypoints": [
                    [26.1445, 91.7362],
                    [26.1150, 91.7900],
                    [25.9000, 91.8800],
                    [25.6600, 91.9000],
                    [25.5788, 91.8933]
                ]
            },
            {
                "name": "Old Mountain Byrnihat Bypass",
                "via": "Byrnihat -> Umsning -> Shillong",
                "distance_km": 112,
                "eta_hours": 3.1,
                "risk": 0.29,
                "status": "AVAILABLE",
                "hazards": ["Single-lane truck gradient sections"],
                "road_segment": "MDR-Meghalaya-4",
                "waypoints": [
                    [26.1445, 91.7362],
                    [26.0500, 91.8500],
                    [25.7500, 91.9200],
                    [25.5788, 91.8933]
                ]
            }
        ]
    },
    "Guwahati Hub -> Itanagar State Hospital": {
        "origin": "Guwahati Hub",
        "destination": "Itanagar State Hospital",
        "origin_coords": [26.1445, 91.7362],
        "destination_coords": [27.0844, 93.6053],
        "candidates": [
            {
                "name": "NH-15 via Tezpur & Banderdewa (AI Recommended)",
                "via": "Mangaldai -> Tezpur -> Biswanath -> Banderdewa -> Itanagar",
                "distance_km": 328,
                "eta_hours": 6.3,
                "risk": 0.18,
                "status": "AVAILABLE",
                "hazards": ["River crossing bridges", "Border checkpoint clearance"],
                "road_segment": "NH-15",
                "waypoints": [
                    [26.1445, 91.7362],
                    [26.4300, 92.0300],
                    [26.6528, 92.7926],
                    [26.7300, 93.1500],
                    [27.0844, 93.6053]
                ]
            },
            {
                "name": "Kolia Bhomora & Gohpur River Route",
                "via": "Nagaon -> Tezpur Bridge -> Gohpur -> Hollongi -> Itanagar",
                "distance_km": 360,
                "eta_hours": 7.4,
                "risk": 0.34,
                "status": "AVAILABLE",
                "hazards": ["Monsoon crosswinds along Brahmaputra river plains"],
                "road_segment": "NH-715A",
                "waypoints": [
                    [26.1445, 91.7362],
                    [26.3452, 92.6840],
                    [26.6528, 92.7926],
                    [26.8800, 93.4000],
                    [27.0844, 93.6053]
                ]
            }
        ]
    },
    "Jorhat Depot -> Dibrugarh Medical College": {
        "origin": "Jorhat Depot",
        "destination": "Dibrugarh Medical College",
        "origin_coords": [26.7509, 94.2037],
        "destination_coords": [27.4728, 94.9120],
        "candidates": [
            {
                "name": "NH-715 South Bank Corridor (AI Recommended)",
                "via": "Jhanji -> Sivasagar -> Moranhat -> Dibrugarh",
                "distance_km": 135,
                "eta_hours": 2.7,
                "risk": 0.14,
                "status": "CLEAR",
                "hazards": ["Tea estate livestock crossings"],
                "road_segment": "NH-715",
                "waypoints": [
                    [26.7509, 94.2037],
                    [26.8900, 94.4000],
                    [26.9800, 94.6300],
                    [27.1800, 94.9000],
                    [27.4728, 94.9120]
                ]
            },
            {
                "name": "Upper Assam Oil Belt Bypass",
                "via": "Nazira -> Naharkatia -> Tingkhong -> Dibrugarh",
                "distance_km": 162,
                "eta_hours": 3.6,
                "risk": 0.28,
                "status": "AVAILABLE",
                "hazards": ["Pipeline transit points", "Uneven road shoulder"],
                "road_segment": "SH-Assam-8",
                "waypoints": [
                    [26.7509, 94.2037],
                    [26.9100, 94.7300],
                    [27.1700, 95.1500],
                    [27.4728, 94.9120]
                ]
            }
        ]
    },
    "Silchar Hub -> Aizawl Civil Hospital": {
        "origin": "Silchar Hub",
        "destination": "Aizawl Civil Hospital",
        "origin_coords": [24.8333, 92.7789],
        "destination_coords": [23.7307, 92.7173],
        "candidates": [
            {
                "name": "NH-306 Vairengte Mountain Corridor (AI Recommended)",
                "via": "Dholai -> Vairengte -> Bilkhawthlir -> Kolasib -> Aizawl",
                "distance_km": 178,
                "eta_hours": 5.1,
                "risk": 0.32,
                "status": "AVAILABLE",
                "hazards": ["Mizoram hill range hairpin bends", "Sudden heavy showers"],
                "road_segment": "NH-306",
                "waypoints": [
                    [24.8333, 92.7789],
                    [24.6000, 92.7800],
                    [24.4500, 92.7500],
                    [24.2200, 92.6800],
                    [23.7307, 92.7173]
                ]
            },
            {
                "name": "Bhairabi Western Hill Route",
                "via": "Hailakandi -> Bhairabi -> Mamit Ridge -> Aizawl",
                "distance_km": 218,
                "eta_hours": 6.9,
                "risk": 0.46,
                "status": "AT_RISK",
                "hazards": ["Unpaved gravel passes", "High landslide vulnerability"],
                "road_segment": "SH-Mizoram-1",
                "waypoints": [
                    [24.8333, 92.7789],
                    [24.6800, 92.5600],
                    [24.1800, 92.5300],
                    [23.8500, 92.5800],
                    [23.7307, 92.7173]
                ]
            }
        ]
    },
    "Guwahati Hub -> Agartala Medical Center": {
        "origin": "Guwahati Hub",
        "destination": "Agartala Medical Center",
        "origin_coords": [26.1445, 91.7362],
        "destination_coords": [23.8315, 91.2868],
        "candidates": [
            {
                "name": "NH-8 Tripura Lifeline Highway (AI Recommended)",
                "via": "Shillong -> Silchar -> Churaibari -> Dharmanagar -> Ambassa -> Agartala",
                "distance_km": 542,
                "eta_hours": 13.2,
                "risk": 0.36,
                "status": "AVAILABLE",
                "hazards": ["Long endurance haul", "Inter-state border weighbridges"],
                "road_segment": "NH-8",
                "waypoints": [
                    [26.1445, 91.7362],
                    [25.5788, 91.8933],
                    [24.8333, 92.7789],
                    [24.3800, 92.1500],
                    [23.9100, 91.8500],
                    [23.8315, 91.2868]
                ]
            },
            {
                "name": "Alternate Western Bypass via Karimganj",
                "via": "Nagaon -> Haflong -> Silchar -> Karimganj -> Agartala",
                "distance_km": 585,
                "eta_hours": 14.8,
                "risk": 0.44,
                "status": "AVAILABLE",
                "hazards": ["Higher transit distance", "Haflong hill elevation"],
                "road_segment": "NH-27 / NH-8",
                "waypoints": [
                    [26.1445, 91.7362],
                    [25.7500, 93.1700],
                    [24.8333, 92.7789],
                    [24.1500, 92.0000],
                    [23.8315, 91.2868]
                ]
            }
        ]
    }
}

def get_all_corridors() -> List[Dict[str, Any]]:
    """Returns a list of all registered corridors for frontend dropdowns."""
    return [
        {
            "id": key,
            "origin": v["origin"],
            "destination": v["destination"],
            "origin_coords": v["origin_coords"],
            "destination_coords": v["destination_coords"],
            "default_eta": v["candidates"][0]["eta_hours"],
            "distance_km": v["candidates"][0]["distance_km"]
        }
        for key, v in CORRIDOR_REGISTRY.items()
    ]

def optimize_route(r: RouteRequest) -> Dict[str, Any]:
    key = f"{r.origin} -> {r.destination}"

    # Search for an exact or approximate corridor match
    matched = None
    if key in CORRIDOR_REGISTRY:
        matched = CORRIDOR_REGISTRY[key]
    else:
        for k, v in CORRIDOR_REGISTRY.items():
            if r.origin.lower() in v["origin"].lower() and r.destination.lower() in v["destination"].lower():
                matched = v
                break

    if not matched:
        # Default fallback to Guwahati -> Silchar
        matched = CORRIDOR_REGISTRY["Guwahati Hub -> Silchar Civil Hospital"]

    candidates = [dict(c) for c in matched["candidates"]]

    # Apply blocked roads penalties dynamically
    for c in candidates:
        road_seg = c.get("road_segment", "")
        is_blocked = any(b.lower() in road_seg.lower() or road_seg.lower() in b.lower() for b in r.blocked_roads)
        if is_blocked:
            c["risk"] = min(0.95, c["risk"] + 0.50)
            c["eta_hours"] = round(c["eta_hours"] * 1.35, 1)
            c["status"] = "BLOCKED / CRITICAL DELAY"
            if "Active road blockade detected" not in c["hazards"]:
                c["hazards"].append("Active road blockade detected")

    if r.priority == 1:
        # Critical medical supply: prioritize minimum risk strictly
        candidates.sort(key=lambda x: (x["risk"], x["eta_hours"]))
    else:
        # Balanced: trade-off between risk and transit time
        candidates.sort(key=lambda x: (x["risk"] * 0.65 + (x["eta_hours"] / 15.0) * 0.35))

    best = candidates[0]
    return {
        "origin": matched["origin"],
        "destination": matched["destination"],
        "origin_coords": matched.get("origin_coords"),
        "destination_coords": matched.get("destination_coords"),
        "blocked_roads": r.blocked_roads,
        "recommended": best,
        "candidates": candidates,
        "method": "a_trust_multi_objective_pareto_routing",
        "total_available_corridors": len(CORRIDOR_REGISTRY)
    }
