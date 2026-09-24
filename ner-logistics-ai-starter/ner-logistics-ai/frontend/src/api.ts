const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface DashboardData {
  vehicles: number;
  on_time: number;
  delayed: number;
  at_risk: number;
  critical_deliveries: number;
  active_alerts: number;
}

export interface AssessmentInput {
  rainfall_mm: number;
  wind_kmh: number;
  road_blocked: boolean;
  landslide_probability: number;
  flood_probability: number;
  gps_freshness_minutes: number;
  field_report_verified: boolean;
  hospital_stock_hours: number;
  delivery_priority: number;
}

export interface AssessmentResult {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  ai_confidence: number;
  uncertainty: number;
  explanation: string[];
  safety_action: "AUTO_CONTINUE" | "HUMAN_REVIEW";
}

export interface RouteCandidate {
  name: string;
  via?: string;
  distance_km?: number;
  eta_hours: number;
  risk: number;
  status: string;
  hazards?: string[];
  road_segment?: string;
  waypoints?: [number, number][];
}

export interface RouteResult {
  origin: string;
  destination: string;
  origin_coords?: [number, number];
  destination_coords?: [number, number];
  blocked_roads: string[];
  recommended: RouteCandidate;
  candidates: RouteCandidate[];
  method: string;
  total_available_corridors?: number;
}

export interface CorridorOption {
  id: string;
  origin: string;
  destination: string;
  origin_coords: [number, number];
  destination_coords: [number, number];
  default_eta: number;
  distance_km: number;
}

export interface DecisionResult {
  decision: "APPROVE" | "REJECT" | "HUMAN_REVIEW";
  reasons: string[];
  execution_allowed?: boolean;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getDashboard(): Promise<DashboardData> {
  try {
    const r = await fetch(`${API}/api/v1/dashboard`);
    if (!r.ok) throw new Error("Dashboard fetch failed");
    return await r.json();
  } catch (err) {
    return {
      vehicles: 12,
      on_time: 7,
      delayed: 3,
      at_risk: 2,
      critical_deliveries: 2,
      active_alerts: 3
    };
  }
}

export async function getCorridors(): Promise<CorridorOption[]> {
  try {
    const r = await fetch(`${API}/api/v1/routes/corridors`);
    if (!r.ok) throw new Error("Corridors fetch failed");
    return await r.json();
  } catch {
    // Fallback corridor catalog
    return [
      { id: "Guwahati Hub -> Silchar Civil Hospital", origin: "Guwahati Hub", destination: "Silchar Civil Hospital", origin_coords: [26.1445, 91.7362], destination_coords: [24.8333, 92.7789], default_eta: 7.2, distance_km: 345 },
      { id: "Guwahati Hub -> NEIGRIHMS Shillong", origin: "Guwahati Hub", destination: "NEIGRIHMS Shillong", origin_coords: [26.1445, 91.7362], destination_coords: [25.5788, 91.8933], default_eta: 2.2, distance_km: 98 },
      { id: "Guwahati Hub -> Itanagar State Hospital", origin: "Guwahati Hub", destination: "Itanagar State Hospital", origin_coords: [26.1445, 91.7362], destination_coords: [27.0844, 93.6053], default_eta: 6.3, distance_km: 328 },
      { id: "Jorhat Depot -> Dibrugarh Medical College", origin: "Jorhat Depot", destination: "Dibrugarh Medical College", origin_coords: [26.7509, 94.2037], destination_coords: [27.4728, 94.9120], default_eta: 2.7, distance_km: 135 },
      { id: "Silchar Hub -> Aizawl Civil Hospital", origin: "Silchar Hub", destination: "Aizawl Civil Hospital", origin_coords: [24.8333, 92.7789], destination_coords: [23.7307, 92.7173], default_eta: 5.1, distance_km: 178 },
      { id: "Guwahati Hub -> Agartala Medical Center", origin: "Guwahati Hub", destination: "Agartala Medical Center", origin_coords: [26.1445, 91.7362], destination_coords: [23.8315, 91.2868], default_eta: 13.2, distance_km: 542 }
    ];
  }
}

export async function assess(payload: AssessmentInput): Promise<AssessmentResult> {
  try {
    const r = await fetch(`${API}/api/v1/ai/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("Assess failed");
    return await r.json();
  } catch (err) {
    const weather = Math.min(1, payload.rainfall_mm / 120) * 0.25 + Math.min(1, payload.wind_kmh / 100) * 0.05;
    const hazards = payload.landslide_probability * 0.25 + payload.flood_probability * 0.20;
    const road = payload.road_blocked ? 0.20 : 0.0;
    const dataPenalty = payload.gps_freshness_minutes > 20 ? 0.08 : 0.0;
    const verifyBonus = payload.field_report_verified ? -0.05 : 0.0;
    const urgency = Math.max(0, (12 - payload.hospital_stock_hours) / 12) * 0.10;
    const priority = (4 - payload.delivery_priority) * 0.03;
    const risk = Math.max(0, Math.min(1, weather + hazards + road + dataPenalty + verifyBonus + urgency + priority));

    let conf = 0.92;
    if (payload.gps_freshness_minutes > 30) conf -= 0.15;
    if (!payload.field_report_verified) conf -= 0.07;
    if (payload.road_blocked && !payload.field_report_verified) conf -= 0.08;
    conf = Math.max(0, Math.min(1, conf));

    const level = risk >= 0.70 ? "HIGH" : risk >= 0.40 ? "MEDIUM" : "LOW";
    return {
      risk_score: Number(risk.toFixed(3)),
      risk_level: level,
      ai_confidence: Number(conf.toFixed(3)),
      uncertainty: Number((1 - conf).toFixed(3)),
      explanation: [
        "Weather and hazard conditions included.",
        "Road status included.",
        "GPS freshness & field reports affect confidence.",
        "Hospital stock & priority affect urgency."
      ],
      safety_action: (risk >= 0.70 || conf < 0.80) ? "HUMAN_REVIEW" : "AUTO_CONTINUE"
    };
  }
}

export async function optimize(payload: {
  origin: string;
  destination: string;
  blocked_roads: string[];
  priority: number;
}): Promise<RouteResult> {
  try {
    const r = await fetch(`${API}/api/v1/routes/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("Optimize failed");
    return await r.json();
  } catch (err) {
    return {
      origin: payload.origin,
      destination: payload.destination,
      blocked_roads: payload.blocked_roads,
      recommended: {
        name: "NH-27 / Haflong Bypass (AI Recommended)",
        via: "Nagaon -> Lumding -> Haflong -> Silchar",
        distance_km: 345,
        eta_hours: 7.2,
        risk: 0.22,
        status: "AVAILABLE",
        hazards: ["Curving mountain pass", "Haflong hill section"],
        waypoints: [
          [26.1445, 91.7362],
          [26.3452, 92.6840],
          [25.7500, 93.1700],
          [25.1700, 93.0200],
          [24.8333, 92.7789]
        ]
      },
      candidates: [
        {
          name: "NH-27 / Haflong Bypass (AI Recommended)",
          via: "Nagaon -> Lumding -> Haflong -> Silchar",
          distance_km: 345,
          eta_hours: 7.2,
          risk: 0.22,
          status: "AVAILABLE",
          waypoints: [
            [26.1445, 91.7362],
            [26.3452, 92.6840],
            [25.7500, 93.1700],
            [25.1700, 93.0200],
            [24.8333, 92.7789]
          ]
        },
        {
          name: "NH-6 / Sonapur Tunnel Corridor",
          via: "Shillong -> Jowai -> Sonapur -> Silchar",
          distance_km: 310,
          eta_hours: 8.5,
          risk: 0.68,
          status: "AT_RISK",
          hazards: ["Active mudslide zone"],
          waypoints: [
            [26.1445, 91.7362],
            [25.5788, 91.8933],
            [25.4500, 92.2000],
            [25.1000, 92.3600],
            [24.8333, 92.7789]
          ]
        }
      ],
      method: "prototype_multi_objective_selection"
    };
  }
}

export async function validateDecision(payload: {
  route_risk: number;
  ai_confidence: number;
  road_verified: boolean;
  hospital_critical: boolean;
  critical_delivery: boolean;
  route_available: boolean;
  operator_approved: boolean;
}): Promise<DecisionResult> {
  try {
    const r = await fetch(`${API}/api/v1/decisions/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("Validate failed");
    return await r.json();
  } catch (err) {
    const reasons: string[] = [];
    if (!payload.route_available) return { decision: "REJECT", reasons: ["No route available"] };
    if (payload.route_risk >= 0.85) reasons.push("Route risk exceeds safety limit.");
    if (payload.ai_confidence < 0.80) reasons.push("AI confidence below threshold.");
    if (!payload.road_verified) reasons.push("Road status not verified.");

    if (payload.critical_delivery && reasons.length && !payload.operator_approved) {
      return { decision: "HUMAN_REVIEW", reasons, execution_allowed: false };
    }
    return { decision: "APPROVE", reasons: reasons.length ? reasons : ["Safety conditions satisfied."], execution_allowed: true };
  }
}
