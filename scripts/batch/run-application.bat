@echo off
echo Starting Fuel Buddy Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Start backend server in a separate window
echo Starting backend server...
start "Fuel Buddy Backend" cmd /k "cd /d "%~dp0backend" && npm install && npm run dev"

timeout /t 5 /nobreak >nul

REM Start frontend server in another window
echo Starting frontend server...
start "Fuel Buddy Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

echo.
echo Applications should now be running:
echo - Backend: http://localhost:5003
echo - Frontend: http://localhost:5003 (API) and http://localhost:5173 (UI)
echo.
echo Admin Panel: http://localhost:5173/admin/login
echo Default credentials: admin / admin123
echo.
echo Press any key to exit...
pause >nul