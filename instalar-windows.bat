@echo off
chcp 65001 > nul
title Instalador - Sistema de Gestión de Estudiantes (Windows)
color 0A

echo ======================================================================
echo   INSTALADOR DE DEPENDENCIAS LOCALES PARA WINDOWS
echo   Sistema de Gestión de Estudiantes
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Comprobar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js no está instalado en este equipo.
    echo Por favor descárgalo desde https://nodejs.org/ e instálalo primero.
    echo.
    pause
    exit /b 1
)

:: 2. Instalar dependencias
echo [1/2] Verificando versiones:
echo  * Node: 
node -v
echo  * npm:  
call npm -v
echo.

echo [2/2] Instalando paquetes de dependencias locales...
echo Esto puede tardar 1 o 2 minutos según la velocidad del disco.
echo.
call npm install

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Hubo un problema durante la instalación.
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo   ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo   Ya puedes ejecutar la aplicación con 'iniciar-windows.bat'.
echo ======================================================================
echo.
set /p iniciar="¿Deseas iniciar la aplicación ahora mismo? (S/N): "
if /i "%iniciar%"=="S" (
    start iniciar-windows.bat
)

exit /b 0
