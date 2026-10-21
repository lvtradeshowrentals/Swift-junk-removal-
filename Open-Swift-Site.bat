@echo off
title Swift Junk Removal - preview
cd /d "%~dp0"
echo.
echo   Starting the Swift Junk Removal preview...
echo.
if not exist "%~dp0js\ride.js" echo   Cannot find the js folder next to this file. Keep Open-Swift-Site.bat inside the swift-junk-removal folder.
if not exist "%~dp0js\ride.js" pause
if not exist "%~dp0js\ride.js" exit /b 1
where node >nul 2>nul
if %errorlevel%==0 (
  node "%~dp0serve.cjs"
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8765/?splash"
  python -m http.server 8765 --bind 127.0.0.1
  goto :end
)
echo   Node.js or Python is needed to preview the site. Opening the page directly instead.
start "" "%~dp0index.html"
pause
:end
