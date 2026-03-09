# Fuel Buddy Development Startup Script
# This script starts both backend and frontend servers with proper Node.js paths

Write-Host "🚀 Starting Fuel Buddy Development Environment..." -ForegroundColor Green

# Set Node.js paths
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
$NODE_EXE = "C:\Program Files\nodejs\node.exe"

# Check if Node.js is available
if (-not (Test-Path $NODE_EXE)) {
    Write-Host "❌ Node.js not found at $NODE_EXE" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js found: $NODE_EXE" -ForegroundColor Green

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Blue
Set-Location backend
$backendJob = Start-Job -ScriptBlock {
    param($NodeExe, $ProjectDir)
    Set-Location $ProjectDir
    & $NodeExe index.js
} -ArgumentList $NODE_EXE, (Get-Location).Path

# Wait a moment for backend to start
Start-Sleep 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5003/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running on port 5003" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    Write-Host "Check backend logs for errors" -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Blue
Set-Location frontend
$frontendJob = Start-Job -ScriptBlock {
    param($NodeExe, $ProjectDir)
    Set-Location $ProjectDir
    $env:PATH = "C:\Program Files\nodejs;$env:PATH"
    & $NodeExe node_modules\vite\bin\vite.js
} -ArgumentList $NODE_EXE, (Get-Location).Path

# Wait for frontend to start
Start-Sleep 5

# Check if frontend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend server is running on port 5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend server failed to start" -ForegroundColor Red
    Write-Host "Check frontend logs for errors" -ForegroundColor Yellow
}

# Display status
Write-Host "`n🎉 Fuel Buddy Development Environment Started!" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:5003" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:5003/api/health" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop all servers" -ForegroundColor Yellow

# Keep script running and handle cleanup
try {
    while ($true) {
        Start-Sleep 1
        
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ One of the servers has stopped unexpectedly" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    $backendJob | Stop-Job
    $frontendJob | Stop-Job
    $backendJob | Remove-Job
    $frontendJob | Remove-Job
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
