@echo off
echo ========================================
echo   Iniciando Poker Hands Manager
echo ========================================
echo.
echo Abrindo 3 terminais...
echo - Terminal 1: Backend
echo - Terminal 2: Bot Discord
echo - Terminal 3: Dashboard
echo.

start "Backend API" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul

start "Bot Discord" cmd /k "cd bot && npm start"
timeout /t 2 /nobreak >nul

start "Dashboard" cmd /k "cd dashboard && npm run dev"

echo.
echo Todos os sistemas foram iniciados!
echo Aguarde alguns segundos...
echo.
echo Backend: http://localhost:5000
echo Dashboard: http://localhost:3000
echo.
echo Para parar, feche os terminais ou pressione Ctrl+C em cada um.
echo.
