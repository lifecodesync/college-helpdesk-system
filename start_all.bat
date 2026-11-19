@echo off
title AI College Helpdesk - Launcher
echo ==============================================================================
echo Launching AI-Based College Helpdesk & Student Assistance System
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ==============================================================================

start "FastAPI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "React Vite Frontend" cmd /k "cd frontend && npm run dev"

echo Both services launched in separate windows!
pause
