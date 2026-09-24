import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import {
  getDashboard,
  assess,
  optimize,
  validateDecision,
  checkBackendHealth,
  getCorridors,
  DashboardData,
  AssessmentResult,
  RouteResult,
  RouteCandidate,
  DecisionResult,
  CorridorOption
} from "./api";

// Fix Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Vehicle {
  id: string;
  driver: string;
  origin: string;
  destination: string;
  cargo: string;
  status: "ON_TIME" | "DELAYED" | "AT_RISK";
  speed: string;
  eta: string;
  lat: number;
  lng: number;
}

const VEHICLES_DATA: Vehicle[] = [
  { id: "NER-01", driver: "Rajesh Bora", origin: "Guwahati Hub", destination: "Silchar Civil Hospital", cargo: "Vaccines (Cold Chain)", status: "AT_RISK", speed: "34 km/h", eta: "4h 20m", lat: 25.45, lng: 92.20 },
  { id: "NER-02", driver: "Bikram Debbarma", origin: "Guwahati Hub", destination: "NEIGRIHMS Shillong", cargo: "Emergency Blood Bags", status: "ON_TIME", speed: "52 km/h", eta: "1h 15m", lat: 25.80, lng: 91.85 },
  { id: "NER-03", driver: "Anupam Saikia", origin: "Jorhat Depot", destination: "Dibrugarh Medical College", cargo: "Dialysis Consumables", status: "ON_TIME", speed: "58 km/h", eta: "2h 10m", lat: 27.15, lng: 94.60 },
  { id: "NER-04", driver: "Tenzing Lhaden", origin: "Tezpur Depot", destination: "Itanagar State Hospital", cargo: "Surgical Equipment", status: "DELAYED", speed: "28 km/h", eta: "3h 45m", lat: 26.90, lng: 93.30 },
  { id: "NER-05", driver: "Lalthan Sanga", origin: "Silchar Hub", destination: "Aizawl Civil Hospital", cargo: "Oxygen Cylinders", status: "AT_RISK", speed: "22 km/h", eta: "5h 30m", lat: 24.30, lng: 92.70 },
  { id: "NER-06", driver: "Sanjay Singha", origin: "Guwahati Hub", destination: "Agartala Medical Center", cargo: "Critical ICU Monitor", status: "ON_TIME", speed: "55 km/h", eta: "8h 10m", lat: 24.50, lng: 92.10 },
];

const INCIDENTS_DATA = [
  { id: "INC-101", title: "NH-6 Sonapur Tunnel Landslide", location: "East Jaintia Hills, Meghalaya", severity: "HIGH", status: "Active Blockade", reportVerified: true },
  { id: "INC-102", title: "Heavy Monsoonal Rainfall Flash Flood", location: "Barak Valley Corridor (NH-37)", severity: "MEDIUM", status: "Slow Transit", reportVerified: true },
  { id: "INC-103", title: "Mudslide Hazard Warning", location: "NH-29 Dimapur-Kohima Pass", severity: "HIGH", status: "Pending Verification", reportVerified: false },
  { id: "INC-104", title: "Submerged Culvert Route Diversion", location: "Kaziranga Bypass (NH-715)", severity: "LOW", status: "Rerouted", reportVerified: true },
];

const HOSPITALS_DATA = [
  { name: "Silchar Civil Hospital", state: "Assam", stockRemaining: "4.5 hours", oxygenStatus: "CRITICAL", priority: 1, contact: "+91 3842 245000" },
  { name: "NEIGRIHMS Shillong", state: "Meghalaya", stockRemaining: "18.0 hours", oxygenStatus: "NORMAL", priority: 2, contact: "+91 364 2538011" },
  { name: "Aizawl Civil Hospital", state: "Mizoram", stockRemaining: "6.0 hours", oxygenStatus: "WARNING", priority: 1, contact: "+91 389 2322318" },
  { name: "Dibrugarh Medical College", state: "Assam", stockRemaining: "24.0 hours", oxygenStatus: "ADEQUATE", priority: 3, contact: "+91 373 2300080" },
  { name: "Itanagar State Hospital", state: "Arunachal Pradesh", stockRemaining: "9.5 hours", oxygenStatus: "NORMAL", priority: 2, contact: "+91 360 2350438" },
  { name: "Agartala Medical Center", state: "Tripura", stockRemaining: "12.0 hours", oxygenStatus: "NORMAL", priority: 2, contact: "+91 381 2357005" },
];

// Helper to smooth pan map when corridor changes
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [corridors, setCorridors] = useState<CorridorOption[]>([]);
  const [selectedCorridorKey, setSelectedCorridorKey] = useState<string>("Guwahati Hub -> Silchar Civil Hospital");
  const [activeCandidateIdx, setActiveCandidateIdx] = useState<number>(0);

  const [risk, setRisk] = useState<AssessmentResult | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Simulation inputs
  const [rainfall, setRainfall] = useState<number>(95);
  const [wind, setWind] = useState<number>(35);
  const [landslideProb, setLandslideProb] = useState<number>(0.65);
  const [floodProb, setFloodProb] = useState<number>(0.55);
  const [roadBlocked, setRoadBlocked] = useState<boolean>(true);
  const [gpsFreshness, setGpsFreshness] = useState<number>(4);
  const [fieldVerified, setFieldVerified] = useState<boolean>(true);
  const [hospitalStock, setHospitalStock] = useState<number>(5);
  const [priority, setPriority] = useState<number>(1);

  // Load initial corridors and trigger initial route optimization
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    getDashboard().then(setData);

    getCorridors().then((cList) => {
      setCorridors(cList);
      if (cList.length > 0) {
        loadRouteForCorridor(cList[0].origin, cList[0].destination, true);
      }
    });

    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadRouteForCorridor(orig: string, dest: string, isBlocked: boolean = roadBlocked) {
    setLoadingRoute(true);
    try {
      const res = await optimize({
        origin: orig,
        destination: dest,
        blocked_roads: isBlocked ? ["NH-6 / Sonapur Tunnel"] : [],
        priority,
      });
      setRoute(res);
      setActiveCandidateIdx(0);
    } finally {
      setLoadingRoute(false);
    }
  }

  function handleCorridorChange(corridorId: string) {
    setSelectedCorridorKey(corridorId);
    const chosen = corridors.find((c) => c.id === corridorId);
    if (chosen) {
      loadRouteForCorridor(chosen.origin, chosen.destination);
    }
  }

  async function handleRunAI() {
    setLoadingAI(true);
    try {
      const res = await assess({
        rainfall_mm: rainfall,
        wind_kmh: wind,
        road_blocked: roadBlocked,
        landslide_probability: landslideProb,
        flood_probability: floodProb,
        gps_freshness_minutes: gpsFreshness,
        field_report_verified: fieldVerified,
        hospital_stock_hours: hospitalStock,
        delivery_priority: priority,
      });
      setRisk(res);

      const dec = await validateDecision({
        route_risk: res.risk_score,
        ai_confidence: res.ai_confidence,
        road_verified: fieldVerified,
        hospital_critical: hospitalStock <= 6,
        critical_delivery: priority === 1,
        route_available: !roadBlocked || res.risk_score < 0.85,
        operator_approved: false
      });
      setDecision(dec);
    } finally {
      setLoadingAI(false);
    }
  }

  const activeRouteCandidate: RouteCandidate | undefined = route?.candidates?.[activeCandidateIdx] || route?.recommended;
  const mapCenter: [number, number] = route?.origin_coords || [26.0, 92.5];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside>
        <div className="brand">
          <h2>NER<span>AI</span></h2>
          <p className="muted">Logistics Command Center</p>
        </div>

        <nav>
          {["Dashboard", "Live Map", "Vehicles", "Incidents", "Hospitals", "Simulation & A-TRUST"].map((tab) => (
            <button
              key={tab}
              className={`nav ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Dashboard" && "📊 "}
              {tab === "Live Map" && "🗺️ "}
              {tab === "Vehicles" && "🚛 "}
              {tab === "Incidents" && "⚠️ "}
              {tab === "Hospitals" && "🏥 "}
              {tab === "Simulation & A-TRUST" && "🧠 "}
              {tab}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="backend-status">
            <span className={`status-dot ${backendOnline ? "online" : "offline"}`}></span>
            <div>
              <small>{backendOnline ? "API Online" : "Demo Mode"}</small>
              <b>{backendOnline ? "Port 8000" : "Local Mock"}</b>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main>
        <header>
          <div>
            <h1>NER Logistics Command Center</h1>
            <p>North Eastern Region Real-Time Supply Chain & Multi-Corridor AI Safety Platform</p>
          </div>
          <div className="header-badges">
            <div className={`connection-badge ${backendOnline ? "connected" : "standalone"}`}>
              {backendOnline ? "● BACKEND CONNECTED" : "● DEMO / SIMULATION MODE"}
            </div>
            <div className="live">● LIVE TELEMETRY</div>
          </div>
        </header>

        {/* Global Route Corridor Switcher Bar */}
        <section className="corridor-bar">
          <div className="corridor-bar-left">
            <span className="corridor-label">🧭 Active Transit Corridor:</span>
            <select
              className="corridor-select"
              value={selectedCorridorKey}
              onChange={(e) => handleCorridorChange(e.target.value)}
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.origin} ➔ {c.destination} ({c.distance_km} km | ~{c.default_eta} hrs)
                </option>
              ))}
            </select>
          </div>

          <div className="corridor-bar-right">
            <button
              className="quick-route-btn"
              onClick={() => {
                const chosen = corridors.find((c) => c.id === selectedCorridorKey);
                if (chosen) loadRouteForCorridor(chosen.origin, chosen.destination);
              }}
              disabled={loadingRoute}
            >
              {loadingRoute ? "Optimizing..." : "⚡ Recalculate Corridor"}
            </button>
          </div>
        </section>

        {/* Top Metric Cards */}
        <section className="cards">
          <Card label="Active Fleet" value={data?.vehicles ?? 12} />
          <Card label="On Schedule" value={data?.on_time ?? 7} />
          <Card label="Delayed / Detoured" value={data?.delayed ?? 3} />
          <Card label="At Severe Risk" value={data?.at_risk ?? 2} danger />
          <Card label="Corridor Distance" value={activeRouteCandidate?.distance_km ? `${activeRouteCandidate.distance_km} km` : "345 km"} highlight />
        </section>

        {/* Tab 1: Dashboard View */}
        {activeTab === "Dashboard" && (
          <>
            <section className="grid">
              <div className="panel map-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">Active Corridor Map: {route?.origin} ➔ {route?.destination}</div>
                    <small className="muted">{activeRouteCandidate?.via || "Direct Regional Transit"}</small>
                  </div>
                  <span className="badge-subtle">Leaflet GIS Live</span>
                </div>

                {/* Candidate Route Tabs */}
                {route && route.candidates.length > 1 && (
                  <div className="candidate-selector-tabs">
                    {route.candidates.map((cand, idx) => (
                      <button
                        key={idx}
                        className={`candidate-tab ${activeCandidateIdx === idx ? "active" : ""}`}
                        onClick={() => setActiveCandidateIdx(idx)}
                      >
                        {idx === 0 ? "★ AI Recommended: " : "Alternative: "}
                        <b>{cand.name.split("(")[0]}</b> ({cand.eta_hours}h | {(cand.risk * 100).toFixed(0)}% risk)
                      </button>
                    ))}
                  </div>
                )}

                <div className="leaflet-wrapper">
                  <MapContainer center={mapCenter} zoom={7} scrollWheelZoom style={{ height: "420px", width: "100%" }}>
                    <MapRecenter center={mapCenter} zoom={7} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Corridor Origin Marker */}
                    {route?.origin_coords && (
                      <Marker position={route.origin_coords}>
                        <Popup><strong>{route.origin}</strong><br />Corridor Origin Terminal</Popup>
                      </Marker>
                    )}

                    {/* Corridor Destination Marker */}
                    {route?.destination_coords && (
                      <Marker position={route.destination_coords}>
                        <Popup><strong>{route.destination}</strong><br />Destination Hub / Hospital</Popup>
                      </Marker>
                    )}

                    {/* Active Route Waypoints Polyline */}
                    {activeRouteCandidate?.waypoints && (
                      <Polyline
                        positions={activeRouteCandidate.waypoints}
                        color={activeCandidateIdx === 0 ? "#0b7a55" : "#1d4ed8"}
                        weight={5}
                      />
                    )}

                    {/* Alternative Route Ghost Polyline */}
                    {route?.candidates && route.candidates.map((c, i) => (
                      i !== activeCandidateIdx && c.waypoints ? (
                        <Polyline
                          key={i}
                          positions={c.waypoints}
                          color="#94a3b8"
                          weight={3}
                          dashArray="6, 6"
                        />
                      ) : null
                    ))}

                    {/* Live Vehicles */}
                    {VEHICLES_DATA.map((v) => (
                      <CircleMarker
                        key={v.id}
                        center={[v.lat, v.lng]}
                        radius={7}
                        color={v.status === "AT_RISK" ? "#d32f2f" : v.status === "DELAYED" ? "#f57c00" : "#2e7d32"}
                        fillOpacity={0.9}
                      >
                        <Popup>
                          <strong>{v.id} — {v.driver}</strong><br />
                          {v.origin} ➔ {v.destination}<br />
                          Cargo: {v.cargo}<br />
                          Speed: {v.speed} | Status: <b>{v.status}</b>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>

                {/* Waypoint details bar */}
                {activeRouteCandidate && (
                  <div className="active-route-meta">
                    <div><span>Active Route:</span> <b>{activeRouteCandidate.name}</b></div>
                    <div><span>Transit Distance:</span> <b>{activeRouteCandidate.distance_km} km</b></div>
                    <div><span>ETA:</span> <b>{activeRouteCandidate.eta_hours} hrs</b></div>
                    <div><span>Status:</span> <b className={activeRouteCandidate.status.includes("BLOCK") ? "danger-text" : "pass-text"}>{activeRouteCandidate.status}</b></div>
                  </div>
                )}
              </div>

              {/* Active Alerts Panel */}
              <div className="panel alerts-panel">
                <div className="panel-title">Active Field Alerts & Hazards</div>
                <div className="alerts-list">
                  {INCIDENTS_DATA.map((inc) => (
                    <div key={inc.id} className="alert-item">
                      <span className={`pill ${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                      <div className="alert-content">
                        <strong>{inc.title}</strong>
                        <p>{inc.location} • <em>{inc.status}</em></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Action Panels */}
            <section className="grid">
              <div className="panel">
                <div className="panel-title">AI Trust & Risk Assessment (Current Route)</div>
                <p className="description-text">
                  Evaluates monsoonal precipitation, telemetry freshness, landslide indices, and hospital stock urgency.
                </p>
                <button className="primary-btn" onClick={handleRunAI} disabled={loadingAI}>
                  {loadingAI ? "Analyzing Parameters..." : "⚡ Run Real-Time AI Assessment"}
                </button>
                {risk && (
                  <div className={`result-box ${risk.risk_level.toLowerCase()}`}>
                    <div className="result-header">
                      <b>{risk.risk_level} RISK LEVEL</b>
                      <span className={`safety-badge ${risk.safety_action === "HUMAN_REVIEW" ? "badge-warn" : "badge-pass"}`}>
                        Gate: {risk.safety_action}
                      </span>
                    </div>
                    <div className="metrics-row">
                      <div><span>Risk Score</span><b>{(risk.risk_score * 100).toFixed(1)}%</b></div>
                      <div><span>Confidence</span><b>{(risk.ai_confidence * 100).toFixed(1)}%</b></div>
                      <div><span>Uncertainty</span><b>{(risk.uncertainty * 100).toFixed(1)}%</b></div>
                    </div>
                    <ul className="explanation-list">
                      {risk.explanation.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="panel">
                <div className="panel-title">Dynamic Corridor Optimizer</div>
                <p className="description-text">
                  Multi-objective route selector balancing emergency medical priority against seasonal hazards.
                </p>

                <div className="corridor-switch-btns">
                  <small className="muted">Switch Corridor:</small>
                  <div className="pill-btn-group">
                    {corridors.map((c) => (
                      <button
                        key={c.id}
                        className={`pill-btn ${selectedCorridorKey === c.id ? "active" : ""}`}
                        onClick={() => handleCorridorChange(c.id)}
                      >
                        {c.destination.replace("Civil Hospital", "").replace("Medical College", "").replace("State Hospital", "").replace("Medical Center", "").trim()}
                      </button>
                    ))}
                  </div>
                </div>

                {activeRouteCandidate && (
                  <div className="result-box pass">
                    <div className="result-header">
                      <b>{activeRouteCandidate.name}</b>
                      <span className="badge-pass">{activeRouteCandidate.status}</span>
                    </div>
                    <div className="metrics-row">
                      <div><span>Distance</span><b>{activeRouteCandidate.distance_km} km</b></div>
                      <div><span>ETA</span><b>{activeRouteCandidate.eta_hours} hrs</b></div>
                      <div><span>Calculated Risk</span><b>{(activeRouteCandidate.risk * 100).toFixed(0)}%</b></div>
                    </div>
                    {activeRouteCandidate.hazards && (
                      <small className="muted">Hazards: {activeRouteCandidate.hazards.join(", ")}</small>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Tab 2: Live Map View */}
        {activeTab === "Live Map" && (
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">Northeast Regional Multi-Route Transit Grid</div>
              <div className="corridor-select-compact">
                <select
                  className="corridor-select"
                  value={selectedCorridorKey}
                  onChange={(e) => handleCorridorChange(e.target.value)}
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.origin} ➔ {c.destination} ({c.distance_km} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Route Buttons */}
            {route && route.candidates.length > 1 && (
              <div className="candidate-selector-tabs">
                {route.candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    className={`candidate-tab ${activeCandidateIdx === idx ? "active" : ""}`}
                    onClick={() => setActiveCandidateIdx(idx)}
                  >
                    Route Option {idx + 1}: <b>{cand.name}</b> ({cand.distance_km} km | {cand.eta_hours}h)
                  </button>
                ))}
              </div>
            )}

            <div className="leaflet-wrapper full-map">
              <MapContainer center={mapCenter} zoom={7} scrollWheelZoom style={{ height: "600px", width: "100%" }}>
                <MapRecenter center={mapCenter} zoom={7} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Major Terminals */}
                <Marker position={[26.1445, 91.7362]}><Popup><strong>Guwahati Central Logistics Hub</strong></Popup></Marker>
                <Marker position={[24.8333, 92.7789]}><Popup><strong>Silchar Civil Hospital Hub</strong></Popup></Marker>
                <Marker position={[25.5788, 91.8933]}><Popup><strong>NEIGRIHMS Shillong</strong></Popup></Marker>
                <Marker position={[27.4728, 94.912]}><Popup><strong>Dibrugarh Medical Center</strong></Popup></Marker>
                <Marker position={[27.0844, 93.6053]}><Popup><strong>Itanagar State Hospital</strong></Popup></Marker>
                <Marker position={[23.7307, 92.7173]}><Popup><strong>Aizawl Civil Hospital</strong></Popup></Marker>
                <Marker position={[23.8315, 91.2868]}><Popup><strong>Agartala Medical Center</strong></Popup></Marker>

                {/* Active Waypoints Line */}
                {activeRouteCandidate?.waypoints && (
                  <Polyline
                    positions={activeRouteCandidate.waypoints}
                    color="#059669"
                    weight={6}
                  />
                )}

                {/* Alternative Paths */}
                {route?.candidates && route.candidates.map((c, i) => (
                  i !== activeCandidateIdx && c.waypoints ? (
                    <Polyline
                      key={i}
                      positions={c.waypoints}
                      color="#3b82f6"
                      weight={4}
                      dashArray="8, 6"
                    />
                  ) : null
                ))}

                {/* Active Vehicles */}
                {VEHICLES_DATA.map((v) => (
                  <CircleMarker
                    key={v.id}
                    center={[v.lat, v.lng]}
                    radius={8}
                    color={v.status === "AT_RISK" ? "#d32f2f" : v.status === "DELAYED" ? "#f57c00" : "#2e7d32"}
                    fillColor={v.status === "AT_RISK" ? "#ef5350" : v.status === "DELAYED" ? "#ffa726" : "#66bb6a"}
                    fillOpacity={1}
                  >
                    <Popup>
                      <div className="popup-card">
                        <h4>{v.id} — {v.driver}</h4>
                        <p><strong>Route:</strong> {v.origin} ➔ {v.destination}</p>
                        <p><strong>Cargo:</strong> {v.cargo}</p>
                        <p><strong>Live Telemetry:</strong> {v.speed} | ETA: {v.eta}</p>
                        <span className={`pill ${v.status.toLowerCase()}`}>{v.status}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}

        {/* Tab 3: Vehicles Fleet */}
        {activeTab === "Vehicles" && (
          <section className="panel">
            <div className="panel-title">Fleet Dispatch & Active Transport Tracking (12 Vehicles)</div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle ID</th>
                    <th>Driver</th>
                    <th>Corridor</th>
                    <th>Cargo Type</th>
                    <th>Telemetry Speed</th>
                    <th>Estimated Arrival</th>
                    <th>Safety Status</th>
                  </tr>
                </thead>
                <tbody>
                  {VEHICLES_DATA.map((v) => (
                    <tr key={v.id}>
                      <td><b>{v.id}</b></td>
                      <td>{v.driver}</td>
                      <td>{v.origin} ➔ {v.destination}</td>
                      <td>{v.cargo}</td>
                      <td>{v.speed}</td>
                      <td>{v.eta}</td>
                      <td>
                        <span className={`pill ${v.status.toLowerCase()}`}>
                          {v.status === "ON_TIME" ? "On Schedule" : v.status === "DELAYED" ? "Delayed" : "At Severe Risk"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 4: Incidents */}
        {activeTab === "Incidents" && (
          <section className="panel">
            <div className="panel-title">Regional Incidents & Road Hazard Feed</div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Event Description</th>
                    <th>Affected Route / Pass</th>
                    <th>Severity</th>
                    <th>Current Status</th>
                    <th>Ground Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {INCIDENTS_DATA.map((inc) => (
                    <tr key={inc.id}>
                      <td><b>{inc.id}</b></td>
                      <td>{inc.title}</td>
                      <td>{inc.location}</td>
                      <td><span className={`pill ${inc.severity.toLowerCase()}`}>{inc.severity}</span></td>
                      <td>{inc.status}</td>
                      <td>
                        {inc.reportVerified ? (
                          <span className="verified-tag">✓ Verified Ground Report</span>
                        ) : (
                          <span className="unverified-tag">⏳ Unverified / Citizen Alert</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 5: Hospitals */}
        {activeTab === "Hospitals" && (
          <section className="panel">
            <div className="panel-title">Healthcare Facilities & Emergency Medical Stock Levels</div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hospital Center</th>
                    <th>State</th>
                    <th>Critical Stock Buffer</th>
                    <th>Oxygen Reserve</th>
                    <th>Emergency Level</th>
                    <th>Control Room</th>
                  </tr>
                </thead>
                <tbody>
                  {HOSPITALS_DATA.map((h, i) => (
                    <tr key={i}>
                      <td><b>{h.name}</b></td>
                      <td>{h.state}</td>
                      <td><span className="highlight-text">{h.stockRemaining}</span></td>
                      <td>
                        <span className={`pill ${h.oxygenStatus === "CRITICAL" ? "high" : h.oxygenStatus === "WARNING" ? "medium" : "low"}`}>
                          {h.oxygenStatus}
                        </span>
                      </td>
                      <td>Priority {h.priority}</td>
                      <td>{h.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 6: Simulation & A-TRUST Sandbox */}
        {activeTab === "Simulation & A-TRUST" && (
          <section className="simulation-layout">
            <div className="panel simulation-controls">
              <div className="panel-title">🎮 AI Simulation Controls & Sensor Inputs</div>
              <p className="description-text">
                Adjust simulated environmental variables and observe how the AI calculates Risk, Epistemic Uncertainty, and triggers the A-TRUST Safety Gate.
              </p>

              <div className="slider-group">
                <label>
                  Rainfall: <b>{rainfall} mm</b> (Monsoon Intensity)
                  <input type="range" min="0" max="250" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} />
                </label>

                <label>
                  Wind Velocity: <b>{wind} km/h</b>
                  <input type="range" min="0" max="150" value={wind} onChange={(e) => setWind(Number(e.target.value))} />
                </label>

                <label>
                  Landslide Probability: <b>{(landslideProb * 100).toFixed(0)}%</b>
                  <input type="range" min="0" max="1" step="0.05" value={landslideProb} onChange={(e) => setLandslideProb(Number(e.target.value))} />
                </label>

                <label>
                  Flood Probability: <b>{(floodProb * 100).toFixed(0)}%</b>
                  <input type="range" min="0" max="1" step="0.05" value={floodProb} onChange={(e) => setFloodProb(Number(e.target.value))} />
                </label>

                <label>
                  GPS Telemetry Freshness: <b>{gpsFreshness} mins ago</b>
                  <input type="range" min="1" max="60" value={gpsFreshness} onChange={(e) => setGpsFreshness(Number(e.target.value))} />
                </label>

                <label>
                  Hospital Reserve Buffer: <b>{hospitalStock} hours remaining</b>
                  <input type="range" min="1" max="24" value={hospitalStock} onChange={(e) => setHospitalStock(Number(e.target.value))} />
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={roadBlocked} onChange={(e) => setRoadBlocked(e.target.checked)} />
                  Highway Blockade Reported (e.g., Sonapur Tunnel)
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={fieldVerified} onChange={(e) => setFieldVerified(e.target.checked)} />
                  Field Report Confirmed by Local District Authorities
                </label>
              </div>

              <div className="preset-buttons">
                <button className="secondary-btn" onClick={() => { setRainfall(140); setLandslideProb(0.85); setRoadBlocked(true); setFieldVerified(true); setHospitalStock(3); setPriority(1); }}>
                  🌧️ Severe Monsoon Crisis Preset
                </button>
                <button className="secondary-btn" onClick={() => { setRainfall(15); setLandslideProb(0.1); setRoadBlocked(false); setFieldVerified(true); setHospitalStock(18); setPriority(3); }}>
                  ☀️ Clear Weather Preset
                </button>
              </div>

              <button className="primary-btn full-btn" onClick={handleRunAI} disabled={loadingAI}>
                {loadingAI ? "Calculating with AI Engine..." : "Evaluate Scenario & Run A-TRUST Gate"}
              </button>
            </div>

            {/* Simulation Results & A-TRUST Decision Gate */}
            <div className="panel simulation-results">
              <div className="panel-title">🛡️ A-TRUST Decision Gate Output</div>

              {risk ? (
                <div className="gate-display">
                  <div className={`gate-status-banner ${decision?.decision.toLowerCase()}`}>
                    <h3>Gate Verdict: {decision?.decision ?? "EVALUATING"}</h3>
                    <p>
                      {decision?.decision === "APPROVE" && "Autonomous dispatch allowed. Safety thresholds met."}
                      {decision?.decision === "HUMAN_REVIEW" && "High risk / low certainty detected. Human operator sign-off required."}
                      {decision?.decision === "REJECT" && "Execution blocked. Route violates maximum safety constraints."}
                    </p>
                  </div>

                  <div className="metrics-grid">
                    <div className="metric-card">
                      <small>Composite Risk</small>
                      <b>{(risk.risk_score * 100).toFixed(1)}%</b>
                    </div>
                    <div className="metric-card">
                      <small>AI Confidence</small>
                      <b>{(risk.ai_confidence * 100).toFixed(1)}%</b>
                    </div>
                    <div className="metric-card">
                      <small>Epistemic Uncertainty</small>
                      <b>{(risk.uncertainty * 100).toFixed(1)}%</b>
                    </div>
                    <div className="metric-card">
                      <small>Safety Action</small>
                      <b>{risk.safety_action}</b>
                    </div>
                  </div>

                  <div className="decision-reasons">
                    <h4>Gate Decision Rationale:</h4>
                    <ul>
                      {decision?.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="principles-box">
                    <small><b>A-TRUST Framework:</b> Trustworthy Telemetry • Risk Assessment • Uncertainty Quantification • Safety Gates • Transparency & Audit</small>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Click "Evaluate Scenario & Run A-TRUST Gate" to trigger real-time AI and safety gate evaluation.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ label, value, danger = false, highlight = false }: { label: string; value: any; danger?: boolean; highlight?: boolean }) {
  return (
    <div className={`card ${danger ? "danger" : ""} ${highlight ? "highlight" : ""}`}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
