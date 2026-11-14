@echo off
title Sistema Restaurante - Backend Spring Boot 3
echo =====================================================================
echo   RESTAURANTE EL BUEN SABOR - SERVIDOR BACKEND (SPRING BOOT 3)
echo   Puerto: http://localhost:8080
echo   Base de Datos: MySQL 8 (restaurante_db)
echo =====================================================================
echo.
cd /d "%~dp0backend"
if exist "%~dp0.tools\jdk-17.0.20.1+1" (
    set "JAVA_HOME=%~dp0.tools\jdk-17.0.20.1+1"
    set "PATH=%~dp0.tools\apache-maven-3.9.9\bin;%JAVA_HOME%\bin;%PATH%"
    "%~dp0.tools\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
) else (
    mvn spring-boot:run
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Ocurrio un problema al iniciar el servidor.
    echo Verifique que MySQL 8 este activo y revise la clave en backend\src\main\resources\application.yml
    pause
)
