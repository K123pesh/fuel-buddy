@echo off
cd /d "c:\Users\kalpe\Downloads\fuel-buddy-on-demand-main\frontend"
set PATH=C:\Program Files\nodejs;%PATH%
echo Starting development server...
"C:\Program Files\nodejs\npm.cmd" run dev
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred: %ERRORLEVEL%
    pause
)
