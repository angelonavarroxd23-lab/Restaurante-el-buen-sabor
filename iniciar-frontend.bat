@echo off
title Sistema Restaurante El Buen Sabor - Frontend Angular 18
echo ========================================================
echo   Iniciando Frontend Angular (El Buen Sabor S.A.C.)
echo   URL: http://localhost:4200
echo ========================================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [INFO] Instalando paquetes de Angular por primera vez...
    call npm install
)
call npm start
pause
