import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDashboard, assess, optimize } from "./api";

type Dashboard = {
  vehicles: number; on_time: number; delayed: number; at_risk: number;
  critical_deliveries: number; active_alerts: number;
};

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [risk, setRisk] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);

  useEffect(() => { getDashboard().then(setData); }, []);

  async function runAI() {
    const result = await assess({
      rainfall_mm: 95,
      wind_kmh: 35,
      road_blocked: true,
      landslide_probability: 0.65,
      flood_probability: 0.55,
      gps_freshness_minutes: 4,
      field_report_verified: true,
      hospital_stock_hours: 5,
      delivery_priority: 1
    });
    setRisk(result);
  }

  async function runRoute() {
    const result = await optimize({
      origin: "Guwahati",
      destination: "Silchar Civil Hospital",
      blocked_roads: ["NH-6 / Sonapur Tunnel"],
      priority: 1
    });
    setRoute(result);
  }

  return (
    <div className="app">
      <aside>
        <h2>NER<span>AI</span></h2>
        <p className="muted">Logistics Command Center</p>
        {["Dashboard","Live Map","Vehicles","Incidents","Hospitals","Supplies","Analytics","Simulation","Field Reports"].map(x =>
          <button className="nav" key={x}>{x}</button>
        )}
      </aside>

      <main>
        <header>
          <div><h1>NER Logistics Command Center</h1><p>Real-time logistics intelligence</p></div>
          <div className="live">● LIVE</div>
        </header>

        <section className="cards">
          <Card label="Vehicles" value={data?.vehicles ?? "--"} />
          <Card label="On Time" value={data?.on_time ?? "--"} />
          <Card label="Delayed" value={data?.delayed ?? "--"} />
          <Card label="At Risk" value={data?.at_risk ?? "--"} danger />
          <Card label="Critical Deliveries" value={data?.critical_deliveries ?? "--"} />
        </section>

        <section className="grid">
          <div className="panel map">
            <div className="panel-title">Live Situation Map</div>
            <MapContainer center={[26.2, 91.7]} zoom={6} scrollWheelZoom>
              <TileLayer attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[26.1445, 91.7362]}>
                <Popup>Guwahati logistics hub</Popup>
              </Marker>
              <Marker position={[24.8333, 92.7789]}>
                <Popup>Silchar Civil Hospital</Popup>
              </Marker>
              <Polyline positions={[[26.1445,91.7362],[25.5,92.1],[24.8333,92.7789]]} />
            </MapContainer>
          </div>

          <div className="panel">
            <div className="panel-title">Active Alerts</div>
            <Alert title="Road Blocked" text="NH-6 / Sonapur Tunnel" level="HIGH" />
            <Alert title="Heavy Rainfall" text="Assam region" level="MEDIUM" />
            <Alert title="Delivery Risk" text="Critical medicine supply" level="HIGH" />
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <div className="panel-title">AI Trust & Risk Assessment</div>
            <button className="primary" onClick={runAI}>Run AI Assessment</button>
            {risk && <div className="result">
              <b>{risk.risk_level} RISK</b>
              <span>Risk: {(risk.risk_score*100).toFixed(0)}%</span>
              <span>Confidence: {(risk.ai_confidence*100).toFixed(0)}%</span>
              <span>Uncertainty: {(risk.uncertainty*100).toFixed(0)}%</span>
              <strong>{risk.safety_action}</strong>
            </div>}
          </div>

          <div className="panel">
            <div className="panel-title">Route Optimization</div>
            <button className="primary" onClick={runRoute}>Find Safe Route</button>
            {route && <div className="result">
              <b>{route.recommended.name}</b>
              <span>ETA: {route.recommended.eta_hours} hours</span>
              <span>Risk: {(route.recommended.risk*100).toFixed(0)}%</span>
              <strong>Priority-aware routing enabled</strong>
            </div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({label,value,danger=false}:{label:string,value:any,danger?:boolean}) {
  return <div className={"card " + (danger ? "danger" : "")}><small>{label}</small><b>{value}</b></div>
}
function Alert({title,text,level}:{title:string,text:string,level:string}) {
  return <div className="alert"><b>{level}</b><div><strong>{title}</strong><p>{text}</p></div></div>
}
