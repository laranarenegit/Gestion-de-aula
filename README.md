# 🎓 Sistema de Gestión de Estudiantes

> **Aplicación web 100% local y autónoma** para la gestión integral de cursos, estudiantes, asistencias, calificaciones, bitácora de clases y generación de informes pedagógicos (PDF, Word/Writer `.doc` y planillas Excel/Calc `.xlsx` y `.ods`).
> 
> Diseñada para funcionar sin necesidad de internet, sin cuentas de Google Cloud ni servicios externos de pago.

---

## 💻 Guía de Instalación y Ejecución Local en Windows

Sigue estos sencillos pasos para instalar y ejecutar el sistema en tu computadora con Windows (compatible con **Windows 11, 10, 8.1 y 7**).

---

### Paso 1: Instalar Node.js (Solo la primera vez)

Node.js es el entorno que permite ejecutar el servidor web local en tu computadora.

1. Ingresa a la página oficial de Node.js: **[https://nodejs.org/](https://nodejs.org/)**
2. Descarga la versión **LTS (Recomendada para la mayoría de los usuarios)**.
3. Abre el archivo descargado (instalador `.msi`) y avanza con el asistente (*Next -> Next*).
4. ⚠️ **Importante**: Asegúrate de que la casilla **"Add to PATH"** esté marcada (suele estarlo por defecto).
5. Al finalizar la instalación, reinicia la terminal o tu equipo si es necesario.

---

### Paso 2: Iniciar la Aplicación con 1 Clic (Método Automático)

Una vez descargada o descomprimida la carpeta del proyecto en tu computadora:

1. Abre la carpeta del proyecto en el Explorador de Archivos de Windows.
2. Haz doble clic en el archivo:
   ```text
   iniciar-windows.bat
   ```
3. El script se encargará de todo automáticamente:
   - Verificará que Node.js y npm estén instalados.
   - Si es la primera vez, descargará e instalará las dependencias necesarias.
   - Iniciará el servidor local.
   - **Abrirá automáticamente tu navegador web** en `http://localhost:3000`.

*(Para cerrar la aplicación en cualquier momento, simplemente cierra la ventana negra de la consola o presiona `Ctrl + C` en ella).*

---

### Paso 3: Crear Acceso Directo en el Escritorio (Opcional)

Para no tener que entrar a la carpeta cada vez que desees abrir el sistema:

1. En la carpeta del proyecto, haz doble clic en:
   ```text
   crear-acceso-directo-windows.bat
   ```
2. ¡Listo! Se creará un acceso directo llamado **"Gestión de Estudiantes"** directamente en tu Escritorio de Windows. Podrás abrir el sistema como cualquier otro programa de tu computadora.

---

## 🛠️ Método Manual por Consola (CMD o PowerShell)

Si prefieres ejecutar los comandos manualmente desde el Símbolo del Sistema (**CMD**) o **PowerShell**:

1. Abre **CMD** o **PowerShell** en la carpeta del proyecto (puedes escribir `cmd` en la barra de direcciones de la carpeta y presionar *Enter*).
2. Instala las dependencias (se realiza una única vez):
   ```cmd
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```cmd
   npm run dev
   ```
4. Abre tu navegador web favorito (Google Chrome, Microsoft Edge, Mozilla Firefox o Brave) e ingresa a:
   ```text
   http://localhost:3000
   ```

---

## 🚀 Modo Producción Ultra-Rápido (Opcional)

Para una velocidad máxima de carga y mínimo consumo de memoria RAM:

```cmd
# 1. Compilar los archivos estáticos optimizados
npm run build

# 2. Previsualizar localmente
npm run preview
```

---

## 💾 Gestión de Datos, Respaldo y Compatibilidad con Office

El sistema fue diseñado con privacidad y autonomía total:

1. **Almacenamiento 100% Local**:
   - Toda la información de cursos, estudiantes, notas y asistencias se guarda automáticamente en el almacenamiento local del navegador (`localStorage`).
   - Funciona sin conexión a internet.
2. **Copia de Seguridad Física en Disco**:
   - En la barra superior de la aplicación, haz clic en **"Copia Total (.JSON)"** para descargar un archivo de respaldo con toda tu base de datos. Guarda este archivo en un pendrive o carpeta segura.
   - Puedes restaurar todos tus datos en cualquier momento o en otra máquina haciendo clic en **"Importar / Restaurar"**.
3. **Planillas de Cálculo (Excel / LibreOffice Calc)**:
   - Exporta la nómina y calificaciones a formatos `.xlsx`, `.ods` y `.csv`.
   - Importa listas de alumnos desde planillas existentes.
4. **Informes Pedagógicos**:
   - Genera informes individuales o por curso completo en formato **PDF oficial** o descargables en formato `.doc` compatibles con **Microsoft Word**, **LibreOffice Writer** y procesadores de texto.

---

## ❓ Preguntas Frecuentes y Solución de Problemas

### 1. Mensaje: *"'node' no se reconoce como un comando interno o externo"*
- **Causa**: Node.js no está instalado o no se agregó a la variable de entorno PATH.
- **Solución**: Descarga e instala Node.js desde [https://nodejs.org/](https://nodejs.org/), asegurándote de marcar "Add to PATH", y reinicia la ventana de comandos o tu computadora.

### 2. ¿El puerto 3000 está ocupado por otra aplicación?
- Puedes indicar un puerto diferente ejecutando:
  ```cmd
  npx vite --port 3050
  ```
  Y luego acceder desde `http://localhost:3050`.

### 3. ¿Se pierden los datos si apago la computadora?
- **No**. Los datos permanecen guardados en el almacenamiento del navegador. Sin embargo, como buena práctica docente, se recomienda hacer clic periódicamente en **"Copia Total (.JSON)"** en la barra superior para tener un resguardo en tu disco duro o pendrive.

---

*(Para usuarios de Linux antiX / Debian, consultar el archivo `INSTRUCCIONES_ANTIX.md` e `iniciar-antix.sh`).*
