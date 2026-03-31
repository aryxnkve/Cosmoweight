@echo off
title 🪐 Cosmic Weight Calculator
echo.
echo   ╔══════════════════════════════════════════╗
echo   ║   Cosmic Weight Calculator               ║
echo   ║   Starting dev server...                 ║
echo   ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Open the browser after a short delay (gives Vite time to start)
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start the dev server (this keeps the window open)
npm run dev
