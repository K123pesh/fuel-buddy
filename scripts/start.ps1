# Fuel Buddy Startup Script
Write-Host "🚀 Starting Fuel Buddy Application..." -ForegroundColor Green

# Check if LocalDB is available
Write-Host "Checking LocalDB..." -ForegroundColor Yellow
$localdb = Get-Service -Name "MSSQLLocalDB" -ErrorAction SilentlyContinue
if ($null -eq $localdb) {
    Write-Host "⚠️  LocalDB not found. Please install SQL Server LocalDB or SQL Server Express." -ForegroundColor Red
    Write-Host "You can download it from: https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb" -ForegroundColor Yellow
    exit 1
}

# Create database and apply migrations
Write-Host "Setting up database..." -ForegroundColor Yellow
Set-Location "FuelBuddy.API"
dotnet ef database update

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database update failed. Creating migration..." -ForegroundColor Yellow
    dotnet ef migrations add InitialCreate
    dotnet ef database update
}

# Start API in background
Write-Host "Starting API server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory "FuelBuddy.API"

# Wait a moment for API to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Set-Location "..\fuel-buddy-on-demand-main"
npm run dev

# Cleanup
Write-Host "Application stopped." -ForegroundColor Red