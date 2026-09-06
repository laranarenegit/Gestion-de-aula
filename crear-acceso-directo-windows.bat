@echo off
chcp 65001 > nul
title Crear Acceso Directo en el Escritorio de Windows
color 0E

echo ======================================================================
echo   CREADOR DE ACCESO DIRECTO EN EL ESCRITORIO DE WINDOWS
echo   Sistema de Gestión de Estudiantes
echo ======================================================================
echo.

set "TARGET_DIR=%~dp0"
set "BATCH_FILE=%TARGET_DIR%iniciar-windows.bat"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Gestión de Estudiantes.lnk"

echo Creando acceso directo en:
echo "%SHORTCUT_PATH%"
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%BATCH_FILE%'; $s.WorkingDirectory = '%TARGET_DIR%'; $s.Description = 'Sistema de Gestión de Estudiantes (Local)'; $s.Save()"

if %errorlevel% equ 0 (
    color 0A
    echo [OK] ¡Acceso directo creado con éxito en tu Escritorio!
    echo Ahora puedes iniciar el sistema haciendo doble clic en 'Gestión de Estudiantes' en tu escritorio.
) else (
    color 0C
    echo [ERROR] No se pudo crear el acceso directo automáticamente.
    echo Puedes hacer clic derecho en 'iniciar-windows.bat' -> 'Enviar a' -> 'Escritorio (crear acceso directo)'.
)

echo.
pause
