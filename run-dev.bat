@echo off
echo Starting URL Checker Service Development Environment
echo ==================================================

REM Start backend in a new window
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"
echo Backend running on http://localhost:3000

REM Wait a moment for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend in a new window
echo.
echo Starting frontend development server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo Frontend running on http://localhost:5173
echo.
echo ==================================================
echo Development servers are running!
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
echo Press any key to exit...
echo ==================================================

pause > nul