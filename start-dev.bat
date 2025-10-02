@echo off
echo Starting Pharmacy Management System in development mode...

REM Check if PostgreSQL is running (simple check)
pg_isready -q >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL is not running. Please start PostgreSQL first.
    pause
    exit /b 1
)

REM Check if Redis is running (simple check)
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Redis is not running. Please start Redis first.
    pause
    exit /b 1
)

REM Start backend in background
echo Starting backend server...
cd backend

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
)

REM Run database migrations if needed
alembic upgrade head

REM Start backend server
start "Backend Server" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Backend server started...

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in background
echo Starting frontend server...
cd ..\frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Start frontend server
start "Frontend Server" cmd /k "npm start"

echo Frontend server started...

echo.
echo ===================================
echo Pharmacy Management System is running!
echo ===================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Close this window to keep servers running, or press any key to stop them.
pause

REM Stop servers (optional)
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
echo Servers stopped.