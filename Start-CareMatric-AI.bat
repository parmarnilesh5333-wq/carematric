@echo off
title CareMatric AI Server
cd /d "%~dp0"
echo Starting CareMatric AI...
start "" "http://localhost:5173/"
call npm.cmd run dev
pause
