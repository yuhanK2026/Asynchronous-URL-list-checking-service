#!/bin/bash

echo "Starting URL Checker Service Development Environment"
echo "=================================================="

# Start backend in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Backend running on http://localhost:3000"

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo ""
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"
echo "Frontend running on http://localhost:5173"
echo ""
echo "=================================================="
echo "Development servers are running!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================================="

# Wait for user to press Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep script running
wait