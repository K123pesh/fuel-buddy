@echo off
echo Stopping any existing backend processes...
taskkill /f /im node.exe 2>nul

echo Starting backend...
cd backend
start "Fuel Buddy Backend" cmd /k "npm start"

echo Backend started! Check the new window for status.
echo.
echo Next steps:
echo 1. Open your Fuel Buddy frontend in browser
echo 2. Open browser console (F12)
echo 3. Run this command to update your token:
echo localStorage.setItem('fuel_buddy_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTAzNzIxZTY4OWVlOWFlYjBhY2Y5NCIsImlhdCI6MTc3MTc3OTM3MSwiZXhwIjoxNzc0MzcxMzcxfQ.UV2GRzlknD9DIb_X-dQYT0MorMcByu2wCOt8V4R92oQ')
echo 4. Refresh the page
echo.
pause
