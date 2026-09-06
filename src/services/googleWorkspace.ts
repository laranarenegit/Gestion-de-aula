import { Student, ClassSession } from '../types';

const SPREADSHEET_TITLE = 'Gestion_Estudiantes_DB';
const FOLDER_NAME = 'Gestion_Estudiantes_Informes';

export interface WorkspaceInitResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  folderId: string;
  folderUrl?: string;
  isNewlyCreated: boolean;
}

/**
 * Searches Google Drive for an existing spreadsheet named Gestion_Estudiantes_DB.
 * If not found, creates it with tabs: 'Estudiantes' and 'Bitacora'.
 */
export async function initializeGoogleWorkspace(accessToken: string): Promise<WorkspaceInitResult> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Search for existing spreadsheet in user's Drive
  const query = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    { headers }
  );

  let spreadsheetId: string | null = null;
  let spreadsheetUrl: string = '';
  let isNewlyCreated = false;

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      spreadsheetId = searchData.files[0].id;
      spreadsheetUrl = searchData.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }
  }

  // 2. If spreadsheet does not exist, create it with two tabs: Estudiantes and Bitacora
  if (!spreadsheetId) {
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          title: SPREADSHEET_TITLE,
        },
        sheets: [
          { properties: { title: 'Estudiantes' } },
          { properties: { title: 'Bitacora' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Error al crear la planilla en Google Sheets');
    }

    const createData = await createRes.json();
    spreadsheetId = createData.spreadsheetId;
    spreadsheetUrl = createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    isNewlyCreated = true;

    // Initialize headers for Estudiantes
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Estudiantes!A1:G1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        range: 'Estudiantes!A1:G1',
        majorDimension: 'ROWS',
        values: [
          ['ID_Estudiante', 'Nombre_y_Apellido', 'Asistencia (%)', 'Trabajo_en_Clase', 'Notas_Parciales', 'Promedio_Final', 'Observaciones_Generales']
        ]
      })
    });

    // Initialize headers for Bitacora
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Bitacora!A1:E1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        range: 'Bitacora!A1:E1',
        majorDimension: 'ROWS',
        values: [
          ['#_de_Clase', 'Fecha', 'Temario_Contenidos_Vistos', 'Observaciones', 'Asistencia_Resumen']
        ]
      })
    });
  }

  // 3. Find or create reports folder in Google Drive
  const folderQuery = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const folderSearchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name,webViewLink)`,
    { headers }
  );

  let folderId = '';
  let folderUrl = '';

  if (folderSearchRes.ok) {
    const folderSearchData = await folderSearchRes.json();
    if (folderSearchData.files && folderSearchData.files.length > 0) {
      folderId = folderSearchData.files[0].id;
      folderUrl = folderSearchData.files[0].webViewLink;
    }
  }

  if (!folderId) {
    const folderCreateRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (folderCreateRes.ok) {
      const folderData = await folderCreateRes.json();
      folderId = folderData.id;
      folderUrl = folderData.webViewLink;
    }
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    folderId,
    folderUrl,
    isNewlyCreated
  };
}

/**
 * Synchronize full students array into Google Sheets
 */
export async function syncStudentsToSheet(
  accessToken: string,
  spreadsheetId: string,
  students: Student[]
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const rows = [
    ['ID_Estudiante', 'Nombre_y_Apellido', 'Asistencia (%)', 'Trabajo_en_Clase', 'Notas_Parciales', 'Promedio_Final', 'Observaciones_Generales'],
    ...students.map(s => [
      s.id,
      s.nombre,
      `${s.asistencia}%`,
      s.trabajoEnClase,
      s.notasParciales.join(', '),
      s.promedioFinal,
      s.observaciones || ''
    ])
  ];

  // Clear existing and rewrite
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Estudiantes!A1:G100:clear`, {
    method: 'POST',
    headers,
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Estudiantes!A1:G${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        range: `Estudiantes!A1:G${rows.length}`,
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Error al sincronizar estudiantes con Google Sheets');
  }
}

/**
 * Synchronize class sessions (Bitacora) into Google Sheets
 */
export async function syncClassesToSheet(
  accessToken: string,
  spreadsheetId: string,
  classes: ClassSession[]
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const rows = [
    ['#_de_Clase', 'Fecha', 'Temario_Contenidos_Vistos', 'Observaciones', 'Asistencia_Resumen'],
    ...classes.map(c => {
      const presentes = c.progresoEstudiantes.filter(p => p.presente).length;
      const total = c.progresoEstudiantes.length;
      return [
        c.numeroClase,
        c.fecha,
        c.temario,
        c.observaciones,
        `${presentes}/${total} presentes`
      ];
    })
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Bitacora!A1:E100:clear`, {
    method: 'POST',
    headers,
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Bitacora!A1:E${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        range: `Bitacora!A1:E${rows.length}`,
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Error al sincronizar la bitácora con Google Sheets');
  }
}

/**
 * Creates an individual progress report in Google Docs and places it in the Google Drive folder
 */
export async function createGoogleDocReport(
  accessToken: string,
  folderId: string | null,
  student: Student,
  classSessions: ClassSession[]
): Promise<{ docId: string; docUrl: string }> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const docTitle = `Informe_Progreso_${student.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`;

  // 1. Create Google Doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: docTitle,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Error al crear documento en Google Docs');
  }

  const docData = await createRes.json();
  const docId = docData.documentId;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  // 2. Move to specific Drive folder if available
  if (folderId) {
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${docId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers,
        }
      );
    } catch (e) {
      console.warn('No se pudo mover el doc a la carpeta, pero el archivo fue creado en la raíz de Drive:', e);
    }
  }

  // 3. Compose structured report text
  const attendanceHistory = classSessions.map(cs => {
    const record = cs.progresoEstudiantes.find(p => p.studentId === student.id);
    const estadoPresencia = record ? (record.presente ? 'Presente' : 'Ausente') : 'Sin registro';
    const participacion = record?.participacion || 'N/A';
    return `• Clase #${cs.numeroClase} (${cs.fecha}): ${estadoPresencia} | Participación: ${participacion} | Temario: ${cs.temario}`;
  }).join('\n');

  const reportText = 
`SISTEMA DE GESTIÓN ACADÉMICA - INFORME INDIVIDUAL DE PROGRESO
Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

================================================================================
DATOS DEL ESTUDIANTE:
ID: ${student.id}
Estudiante: ${student.nombre}
Email: ${student.email || 'No registrado'}
Estado Académico: ${student.estado || 'En curso'}

================================================================================
MÉTRICAS DE RENDIMIENTO:
- Asistencia Global: ${student.asistencia}%
- Trabajo en Clase: ${student.trabajoEnClase} / 10
- Calificaciones Parciales: ${student.notasParciales.join(' | ') || 'Sin notas'}
- Promedio Final Ponderado: ${student.promedioFinal} / 10

================================================================================
HISTORIAL DE SESIONES Y BITÁCORA DE CLASE:
${attendanceHistory || 'No hay clases registradas aún.'}

================================================================================
OBSERVACIONES DEL DOCENTE:
${student.observaciones || 'El estudiante mantiene una trayectoria conforme a lo planificado en la asignatura.'}

================================================================================
Firma y Sello Docente: ___________________________________
Institución Educativa - Ciclo Lectivo 2026
`;

  // 4. Batch update document with formatted content
  await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: reportText,
          },
        },
      ],
    }),
  });

  return { docId, docUrl };
}
