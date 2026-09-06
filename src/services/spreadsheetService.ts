import * as XLSX from 'xlsx';
import { Student, ClassSession } from '../types';
import { calculatePromedio, getStudentStatus } from '../data/initialData';

export type SpreadsheetFormat = 'ods' | 'xlsx' | 'csv';

/**
 * Export full academic database to spreadsheet file (.ods, .xlsx, or .csv)
 * Compatible with LibreOffice Calc (default in antiX Linux) and Microsoft Excel.
 */
export function exportDatabaseToSpreadsheet(
  students: Student[],
  classSessions: ClassSession[],
  format: SpreadsheetFormat = 'ods',
  fileNamePrefix: string = 'Gestion_Estudiantes_DB'
): void {
  const wb = XLSX.utils.book_new();

  // 1. Estudiantes Sheet
  const studentsRows = students.map(s => ({
    'ID Estudiante': s.id,
    'Nombre y Apellido': s.nombre,
    'Correo Electrónico': s.email || '',
    'Asistencia (%)': s.asistencia,
    'Trabajo en Clase (1-10)': s.trabajoEnClase,
    'Notas Parciales': s.notasParciales.join(', '),
    'Promedio Final': s.promedioFinal,
    'Estado Académico': s.estado,
    'Observaciones Pedagógicas': s.observaciones || '',
  }));

  const wsStudents = XLSX.utils.json_to_sheet(studentsRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Estudiantes');

  // 2. Bitácora de Clases Sheet
  const classRows = classSessions.map(c => {
    const total = c.progresoEstudiantes.length;
    const presentes = c.progresoEstudiantes.filter(p => p.presente).length;
    const tareas = c.progresoEstudiantes.filter(p => p.tareaEntregada).length;

    return {
      '# Clase': c.numeroClase,
      'Fecha': c.fecha,
      'Temario y Contenidos Vistos': c.temario,
      'Observaciones de Clase': c.observaciones || '',
      'Presentes': `${presentes} / ${total}`,
      'Tareas Entregadas': `${tareas} / ${total}`,
    };
  });

  const wsClasses = XLSX.utils.json_to_sheet(classRows);
  XLSX.utils.book_append_sheet(wb, wsClasses, 'Bitacora_Clases');

  // 3. Matriz Detallada de Asistencias & Tareas
  const matrixRows = students.map(s => {
    const row: Record<string, any> = {
      'ID': s.id,
      'Estudiante': s.nombre,
      'Promedio': s.promedioFinal,
      'Asistencia %': `${s.asistencia}%`,
    };

    classSessions.forEach(cls => {
      const prog = cls.progresoEstudiantes.find(p => p.studentId === s.id);
      row[`Clase ${cls.numeroClase} (${cls.fecha})`] = prog
        ? `${prog.presente ? 'PRES' : 'AUS'}${prog.tareaEntregada ? ' + TAREA' : ''}`
        : '-';
    });

    return row;
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz_Seguimiento');

  // Generate and trigger download
  const extension = format === 'ods' ? 'ods' : format === 'csv' ? 'csv' : 'xlsx';
  const fullFileName = `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.${extension}`;

  if (format === 'csv') {
    // For CSV, write primary students sheet as universal text file
    XLSX.writeFile(wb, fullFileName, { bookType: 'csv' });
  } else if (format === 'ods') {
    // OpenDocument Spreadsheet (LibreOffice Calc native)
    XLSX.writeFile(wb, fullFileName, { bookType: 'ods' });
  } else {
    // Excel XML format
    XLSX.writeFile(wb, fullFileName, { bookType: 'xlsx' });
  }
}

/**
 * Import spreadsheet (.ods, .xlsx, .csv) into application database
 */
export async function importSpreadsheetToDatabase(file: File): Promise<{
  students?: Student[];
  importedCount: number;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('La planilla no contiene hojas de cálculo legibles.');
        }

        // Search for 'Estudiantes' or take first sheet
        const sheetName = workbook.SheetNames.find(n => 
          n.toLowerCase().includes('estudiante') || n.toLowerCase().includes('alumno')
        ) || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error(`La hoja "${sheetName}" está vacía.`);
        }

        const parsedStudents: Student[] = [];

        rawJson.forEach((row, index) => {
          // Flexible key lookup
          const id = String(
            row['ID Estudiante'] || 
            row['ID'] || 
            row['Id'] || 
            row['id'] || 
            row['Código'] || 
            `EST-${String(index + 1).padStart(3, '0')}`
          ).trim();

          const nombre = String(
            row['Nombre y Apellido'] || 
            row['Nombre'] || 
            row['Estudiante'] || 
            row['Alumno'] || 
            row['nombre'] || 
            ''
          ).trim();

          if (!nombre) {
            // Skip empty rows
            return;
          }

          const email = String(
            row['Correo Electrónico'] || 
            row['Email'] || 
            row['Correo'] || 
            row['email'] || 
            ''
          ).trim();

          const asistenciaRaw = Number(
            row['Asistencia (%)'] ?? 
            row['Asistencia'] ?? 
            row['asistencia'] ?? 
            100
          );
          const asistencia = isNaN(asistenciaRaw) ? 100 : Math.min(100, Math.max(0, asistenciaRaw));

          const trabajoRaw = Number(
            row['Trabajo en Clase (1-10)'] ?? 
            row['Trabajo en Clase'] ?? 
            row['Trabajo'] ?? 
            row['trabajo'] ?? 
            8
          );
          const trabajoEnClase = isNaN(trabajoRaw) ? 8 : Math.min(10, Math.max(0, trabajoRaw));

          // Notas parciales
          const notasRaw = String(
            row['Notas Parciales'] || 
            row['Notas'] || 
            row['Parciales'] || 
            row['Calificaciones'] || 
            '8.0, 8.5'
          );

          const parsedNotas = String(notasRaw)
            .split(/[,;\-]/)
            .map(n => parseFloat(n.trim()))
            .filter(n => !isNaN(n) && n >= 0 && n <= 10);

          const finalNotas = parsedNotas.length > 0 ? parsedNotas : [trabajoEnClase];
          const calculatedPromedio = calculatePromedio(finalNotas, trabajoEnClase);
          const estado = getStudentStatus(calculatedPromedio, asistencia);

          const observaciones = String(
            row['Observaciones Pedagógicas'] || 
            row['Observaciones'] || 
            row['observaciones'] || 
            ''
          ).trim();

          parsedStudents.push({
            id,
            nombre,
            email: email || undefined,
            asistencia,
            trabajoEnClase,
            notasParciales: finalNotas,
            promedioFinal: calculatedPromedio,
            estado,
            observaciones: observaciones || undefined,
          });
        });

        if (parsedStudents.length === 0) {
          throw new Error('No se pudieron extraer registros válidos de estudiantes. Verifica que la primera fila contenga encabezados como "Nombre y Apellido".');
        }

        resolve({
          students: parsedStudents,
          importedCount: parsedStudents.length,
          message: `Se importaron con éxito ${parsedStudents.length} estudiantes desde "${file.name}".`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo seleccionado.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Creates a blank template for LibreOffice Calc / Excel
 */
export function downloadSpreadsheetTemplate(format: SpreadsheetFormat = 'ods'): void {
  const sampleStudents: Student[] = [
    {
      id: 'EST-001',
      nombre: 'Juan Pérez Rodríguez',
      email: 'juan.perez@escuela.edu',
      asistencia: 92,
      trabajoEnClase: 8.5,
      notasParciales: [8.0, 9.0],
      promedioFinal: 8.5,
      estado: 'Aprobado',
      observaciones: 'Participativo y puntual.',
    },
    {
      id: 'EST-002',
      nombre: 'María López González',
      email: 'maria.lopez@escuela.edu',
      asistencia: 68,
      trabajoEnClase: 6.0,
      notasParciales: [5.5, 6.0],
      promedioFinal: 5.9,
      estado: 'Regular',
      observaciones: 'Requiere apoyo en trabajos prácticos.',
    },
  ];

  exportDatabaseToSpreadsheet(sampleStudents, [], format, 'Plantilla_Gestion_Estudiantes');
}
