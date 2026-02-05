@echo off
title TheMAG Local Agent
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting Local Agent...
node server.js
pause
