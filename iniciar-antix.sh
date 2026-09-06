#!/usr/bin/env bash
# ==============================================================================
# Script de Inicio Rápido para antiX Linux • Sistema de Gestión de Estudiantes
# 100% Local • Sin Google Drive • Sin conexión a internet requerida
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo " 🐧 Iniciando Sistema de Gestión de Estudiantes (antiX)  "
echo " Modo: 100% Local • Planillas LibreOffice Calc / Excel    "
echo "=========================================================="

# 1. Verificar si Node.js está instalado
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js no está instalado en este sistema antiX."
    echo "💡 Puedes instalarlo abriendo una terminal y ejecutando:"
    echo "   sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

# 2. Verificar si npm está instalado
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm no está instalado."
    echo "💡 Ejecuta: sudo apt install -y npm"
    exit 1
fi

# 3. Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Primera ejecución detectada. Instalando módulos ligeros..."
    npm install --no-audit --no-fund
fi

# 4. Iniciar el servidor local en segundo plano
PORT=3000
echo "🚀 Iniciando servidor local en http://localhost:${PORT}..."

# Iniciar Vite dev server
npm run dev -- --host 0.0.0.0 --port ${PORT} &
SERVER_PID=$!

# Asegurar que al cerrar el script se detenga el servidor
trap "kill $SERVER_PID 2>/dev/null || true; echo 'Servidor detenido.'; exit 0" SIGINT SIGTERM EXIT

# 5. Esperar que el puerto responda
sleep 2

# 6. Abrir en el navegador predeterminado de antiX
APP_URL="http://localhost:${PORT}"
echo "🌐 Abriendo navegador en ${APP_URL}..."

if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$APP_URL" >/dev/null 2>&1 &
elif command -v firefox-esr >/dev/null 2>&1; then
    firefox-esr "$APP_URL" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    firefox "$APP_URL" >/dev/null 2>&1 &
elif command -v seamonkey >/dev/null 2>&1; then
    seamonkey "$APP_URL" >/dev/null 2>&1 &
elif command -v palemoon >/dev/null 2>&1; then
    palemoon "$APP_URL" >/dev/null 2>&1 &
elif command -v chromium >/dev/null 2>&1; then
    chromium "$APP_URL" >/dev/null 2>&1 &
else
    echo "⚠️ Abre tu navegador y navega a: ${APP_URL}"
fi

echo "=========================================================="
echo "✅ Sistema operativo y funcionando localmente."
echo "Presiona Ctrl+C en esta terminal cuando quieras cerrar la aplicación."
echo "=========================================================="

wait $SERVER_PID
