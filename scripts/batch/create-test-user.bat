@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\backend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Creating test user...
"C:\Program Files\nodejs\node.exe" create-test-user.js
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
