# 🐧 Guía de Instalación y Ejecución Local en antiX Linux

Este sistema fue optimizado para ejecutarse de forma **100% local, ligera y autónoma en antiX Linux**, sin necesidad de cuentas ni vinculación a Google Drive ni servicios externos en la nube.

---

### 1. Requisitos Previos en antiX Linux

Abre la terminal de antiX (**ROXTerm**, **XFCE Terminal** o **Ctrl + Alt + T**) y ejecuta:

```bash
# 1. Actualizar repositorios del sistema
sudo apt update

# 2. Instalar Node.js y npm (paquetes oficiales de Debian / antiX)
sudo apt install -y nodejs npm git
```

*(Opcional: Si deseas utilizar LibreOffice Calc y LibreOffice Writer para abrir las planillas de cálculo y procesadores de texto)*:
```bash
sudo apt install -y libreoffice-calc libreoffice-writer
# O si prefieres la versión ultra-ligera (por defecto en antiX):
sudo apt install -y abiword gnumeric
```

---

### 2. Instalación y Puesta en Marcha

Clona o descarga la carpeta del proyecto en tu directorio personal (ejemplo en `~/gestion-estudiantes`):

```bash
# Entrar a la carpeta
cd ~/gestion-estudiantes

# Instalar las dependencias locales (se realiza una sola vez)
npm install
```

---

### 3. Iniciar la Aplicación

Puedes iniciar el sistema de 3 maneras muy sencillas:

#### Opción A: Usando el script automático (Recomendado)
```bash
./iniciar-antix.sh
```
*Este script iniciará el servidor local y abrirá automáticamente tu navegador predeterminado (Firefox-ESR, SeaMonkey o Chromium).*

#### Opción B: Comando estándar
```bash
npm run dev
```
Luego abre tu navegador en: `http://localhost:3000`

#### Opción C: Modo Producción Ultra-Ligero (Menos de 25 MB de RAM)
Para computadoras con muy poca memoria RAM (antiguas o netbooks):
```bash
# Compilar los archivos estáticos una sola vez:
npm run build

# Ejecutar con el servidor ultra-liviano de Node:
npx serve dist -p 3000
# O con Python3 (que ya viene instalado en antiX):
cd dist && python3 -m http.server 3000
```

---

### 4. Crear Acceso Directo en el Escritorio de antiX

Para abrir la aplicación con doble clic desde tu escritorio IceWM, Fluxbox o ROX:

```bash
# Copiar el lanzador al escritorio:
cp gestion-estudiantes.desktop ~/Desktop/
chmod +x ~/Desktop/gestion-estudiantes.desktop
```

---

### 5. Características de Trabajo Local y Planillas

1. **Base de Datos con Planillas de Cálculo:**
   - Tus datos se guardan de forma instantánea y persistente en el navegador local (`localStorage`), sin requerir internet.
   - **Exportar Base de Datos:** Desde la barra superior o el módulo de estudiantes, puedes exportar toda la base de datos a formato `.ods` (OpenDocument Spreadsheet - nativo de LibreOffice Calc), `.xlsx` (Excel) o `.csv`.
   - **Importar Planilla:** Puedes cargar un archivo `.ods`, `.xlsx` o `.csv` para poblar o restaurar estudiantes y calificaciones.

2. **Informes para Procesadores de Texto:**
   - Desde el botón "Generar Informe" de cualquier estudiante, puedes descargar el informe en formato `.doc` (compatible con LibreOffice Writer y AbiWord) o `.rtf` (formato enriquecido universal de procesador de texto).
   - También puedes descargar el PDF oficial o imprimir directamente.
