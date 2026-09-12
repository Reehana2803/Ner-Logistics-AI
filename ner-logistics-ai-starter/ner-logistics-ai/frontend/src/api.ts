const API = "http://localhost:8000";

export async function getDashboard() {
  const r = await fetch(`${API}/api/v1/dashboard`);
  return r.json();
}

export async function assess(payload: unknown) {
  const r = await fetch(`${API}/api/v1/ai/assess`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function optimize(payload: unknown) {
  const r = await fetch(`${API}/api/v1/routes/optimize`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  return r.json();
}
