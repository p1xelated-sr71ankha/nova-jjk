@echo off
title NOVA — Jujutsu Kaisen Domain Expansion Engine
echo ===================================================
echo   NOVA — Jujutsu Kaisen Domain Expansion Engine
echo ===================================================
echo Starting local web server...
echo Opening application in your default web browser...

start "" "http://localhost:8000"
python -m http.server 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python was not found in your PATH.
    echo Alternatively, open index.html using VS Code Live Server or any static web server.
    pause
)
