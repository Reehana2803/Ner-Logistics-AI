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
  eta_hours: number;
  risk: number;
  status: string;
}

export interface RouteResult {
  origin: string;
  destination: string;
  blocked_roads: string[];
  recommended: RouteCandidate;
  candidates: RouteCandidate[];
  method: string;
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
    console.warn("Backend unavailable, using fallback dashboard data", err);
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
    console.warn("Backend unavailable, using client-side estimation fallback", err);
    // Client-side fallback matching risk engine logic
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
    console.warn("Backend unavailable, using fallback route calculation", err);
    return {
      origin: payload.origin,
      destination: payload.destination,
      blocked_roads: payload.blocked_roads,
      recommended: {
        name: "NH-27 / Haflong Bypass (AI Recommended)",
        eta_hours: payload.priority === 1 ? 7.1 : 6.8,
        risk: 0.22,
        status: "AVAILABLE"
      },
      candidates: [
        { name: "NH-27 / Haflong Bypass (AI Recommended)", eta_hours: 7.1, risk: 0.22, status: "AVAILABLE" },
        { name: "NH-6 / Sonapur Corridor (Slight Delay)", eta_hours: 8.3, risk: 0.36, status: "AVAILABLE" }
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
