@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\backend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Starting backend server...
"C:\Program Files\nodejs\node.exe" index.js
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
