#!/bin/bash

# Start both backend and frontend locally for development

echo "Starting Pharmacy Management System in development mode..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Redis is not running. Please start Redis first."
    exit 1
fi

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || {
    echo "Virtual environment not found. Creating one..."
    python -m venv venv
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate
    pip install -r requirements.txt
}

# Run database migrations if needed
alembic upgrade head

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend server
npm start &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

echo ""
echo "==================================="
echo "Pharmacy Management System is running!"
echo "==================================="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait