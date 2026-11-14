@echo off
title Sistema Restaurante El Buen Sabor - UPN
echo ========================================================
echo   Lanzando Backend Spring Boot y Frontend Angular
echo   Restaurante El Buen Sabor S.A.C.
echo ========================================================
echo [1/2] Iniciando Backend en puerto 8080...
start "Backend Spring Boot (8080)" cmd /k "%~dp0iniciar-backend.bat"
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend en puerto 4200...
start "Frontend Angular (4200)" cmd /k "%~dp0iniciar-frontend.bat"

echo.
echo Todo listo! Puedes abrir en tu navegador:
echo   http://localhost:4200
echo ========================================================
pause
