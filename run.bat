@echo off
title NER Logistics AI Launcher
echo ===================================================
echo     Launching NER Logistics AI Platform
echo ===================================================
echo.

:: Launch Backend
echo [1/2] Starting FastAPI Backend on port 8000...
start "NER Backend (Port 8000)" cmd /k "cd /d "%~dp0ner-logistics-ai-starter\ner-logistics-ai\backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Launch Frontend
echo [2/2] Starting Vite Frontend on port 5173...
start "NER Frontend (Port 5173)" cmd /k "cd /d "%~dp0ner-logistics-ai-starter\ner-logistics-ai\frontend" && npm run dev"

echo.
echo Waiting 4 seconds for services to boot...
timeout /t 4 /nobreak >nul

:: Open Browser
echo Opening Command Center in your browser...
start http://localhost:5173

echo.
echo ===================================================
echo Platform is running!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000/docs
echo ===================================================
echo (You can close this window now)
pause
