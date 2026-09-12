# Recommended production architecture

```text
React/Vite Command Center
        |
   REST + WebSocket
        |
FastAPI API Gateway
        |
+-------+---------+----------------+
|                 |                |
Data Trust     AI Services      Routing
|              |                |
validate       Risk/ETA        OSRM/Graph
timestamp      Impact          OR-Tools
confidence     Supply risk     constraints
|              |                |
+-------+------+----------------+
        |
A-TRUST Safety Gate
        |
Human review when high risk/low confidence
        |
Action + alerts + audit
        |
PostgreSQL/PostGIS + cache/event layer
```

## Recommended source tree

```text
backend/
  app/
    ai/
      risk_engine.py
      models/
      training/
    services/
      routing.py
      decision_gate.py
      weather.py
      incidents.py
      inventory.py
    main.py
    schemas.py
    db/
    api/
    tests/

frontend/
  src/
    components/
    pages/
    features/
      map/
      vehicles/
      incidents/
      hospitals/
      routes/
      simulation/
    services/
    hooks/
    types/
    App.tsx
```

## AI development path

1. Start with the explainable prototype score.
2. Collect labeled historical incidents and ETA outcomes.
3. Train LightGBM risk/ETA models.
4. Evaluate with held-out data and compare against simple baselines.
5. Add network-aware models only after enough road-network data exists.
6. Put every model behind the same confidence + safety gate.
7. Log prediction, decision, outcome and model version for auditability.
