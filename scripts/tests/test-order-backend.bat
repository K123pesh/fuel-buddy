@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\backend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Testing order creation from backend...
"C:\Program Files\nodejs\node.exe" test-order-creation.js
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
