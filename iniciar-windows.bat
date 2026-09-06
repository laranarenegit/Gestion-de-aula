@echo off
chcp 65001 > nul
title Sistema de Gestión de Estudiantes (Modo Local Windows)
color 0B

echo ======================================================================
echo   SISTEMA DE GESTIÓN DE ESTUDIANTES - EJECUCIÓN LOCAL EN WINDOWS
echo   Modo: 100%% Local • Sin Internet • Planillas Excel / Calc / PDF
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Comprobar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js no está instalado o no se encuentra en el PATH del sistema.
    echo.
    echo Pasos para solucionarlo:
    echo  1. Descarga e instala Node.js (versión LTS recomendada) desde:
    echo     https://nodejs.org/
    echo  2. Durante la instalación, marca la casilla "Add to PATH".
    echo  3. Vuelve a ejecutar este archivo (iniciar-windows.bat).
    echo.
    echo Presiona cualquier tecla para abrir el sitio oficial de Node.js...
    pause > nul
    start https://nodejs.org/
    exit /b 1
)

:: 2. Comprobar si npm está disponible
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] No se pudo encontrar el comando npm.
    echo Asegúrate de que Node.js esté instalado correctamente con soporte para npm.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado:
node -v
echo [OK] npm detectado:
npm -v
echo.

:: 3. Instalar módulos de Node si no existen
if not exist "node_modules\" (
    echo [INFO] Primera ejecución detectada.
    echo Instalando dependencias necesarias (esto se realiza solo una vez)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERROR] Ocurrió un error al instalar las dependencias con npm.
        echo Revisa tu conexión local o permisos de carpeta.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas con éxito.
    echo.
)

:: 4. Abrir automáticamente el navegador después de 2 segundos
start /b cmd /c "timeout /t 2 /nobreak > nul & start http://localhost:3000"

echo ======================================================================
echo   Iniciando el servidor web local...
echo   URL de acceso: http://localhost:3000
echo.
echo   * Tu navegador predeterminado se abrirá en segundos.
echo   * Para cerrar la aplicación, presiona Ctrl + C o cierra esta ventana.
echo ======================================================================
echo.

call npm run dev

pause
