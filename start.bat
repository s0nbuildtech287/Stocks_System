@echo off
title VN Stock Lab - Terminal
echo ========================================================
echo   KHOI DONG VN STOCK LAB QUANTITATIVE TERMINAL
echo   Dia chi: http://localhost:3000
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm --prefix frontend run dev
pause
