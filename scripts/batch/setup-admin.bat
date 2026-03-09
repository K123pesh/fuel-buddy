@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\backend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Setting up admin account...
"C:\Program Files\nodejs\node.exe" scripts\setup-admin.js
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
