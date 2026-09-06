import { Student, ClassSession } from '../types';

export type WordProcessorFormat = 'doc' | 'rtf' | 'html';

/**
 * Generates an editable document formatted specifically for Word Processors
 * such as LibreOffice Writer, AbiWord, or Microsoft Word.
 * Runs 100% offline and locally on antiX Linux.
 */
export function generateWordProcessorReport(
  student: Student,
  classSessions: ClassSession[],
  format: WordProcessorFormat = 'doc'
): void {
  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const relevantClasses = classSessions.slice(0, 8);

  const classesRowsHtml = relevantClasses.map(cls => {
    const prog = cls.progresoEstudiantes.find(p => p.studentId === student.id);
    const presenteText = prog?.presente ? 'Presente' : 'Ausente';
    const tareaText = prog?.tareaEntregada ? 'Entregada' : 'Pendiente / No entregó';
    const presColor = prog?.presente ? '#166534' : '#991b1b';

    return `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">#${cls.numeroClase}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${cls.fecha}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: ${presColor};">${presenteText} (${tareaText})</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${cls.temario}</td>
      </tr>
    `;
  }).join('');

  const statusColor = student.estado === 'Aprobado' ? '#166534' : student.estado === 'Regular' ? '#b45309' : '#b91c1c';
  const statusBg = student.estado === 'Aprobado' ? '#dcfce7' : student.estado === 'Regular' ? '#fef3c7' : '#fee2e2';

  if (format === 'rtf') {
    // Standard Rich Text Format (.rtf) - Compatible with AbiWord, LibreOffice Writer, TextEdit
    const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset0 Times New Roman;}}
{\\colortbl ;\\red26\\green54\\blue93;\\red74\\green85\\blue104;\\red185\\green28\\blue28;\\red22\\green101\\blue52;}
\\f0\\fs28\\b\\cf1 INFORME ACADEMICO INDIVIDUAL - CICLO LECTIVO 2026\\b0\\par
\\fs18\\cf2 Sistema de Gestion Academica Local (antiX Linux) • Fecha: ${todayStr}\\par
\\line
\\fs22\\b\\cf1 DATOS DEL ESTUDIANTE\\b0\\par
\\fs18\\cf2 Nombre Completo: \\b ${student.nombre}\\b0\\par
ID Estudiante: ${student.id}\\par
Correo: ${student.email || 'No registrado'}\\par
Estado Academico: \\b ${student.estado}\\b0\\par
\\line
\\fs22\\b\\cf1 METRICAS DE RENDIMIENTO\\b0\\par
\\fs18\\cf2 Promedio Final: \\b ${student.promedioFinal} / 10\\b0\\par
Asistencia: \\b ${student.asistencia}%\\b0\\par
Trabajo en Clase: \\b ${student.trabajoEnClase} / 10\\b0\\par
Notas Parciales: \\b ${student.notasParciales.join(', ')}\\b0\\par
\\line
\\fs22\\b\\cf1 OBSERVACIONES PEDAGOGICAS\\b0\\par
\\fs18\\cf2 ${student.observaciones || 'Sin observaciones registradas.'}\\par
\\line
\\fs18\\cf2 ___________________________            ___________________________\\par
Firma Docente a Cargo                        Firma Direccion / Tutoria\\par
}`;

    const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
    downloadBlob(blob, `Informe_${student.nombre.replace(/\s+/g, '_')}.rtf`);
    return;
  }

  // Complete Word-compatible HTML format (.doc)
  // LibreOffice Writer / AbiWord opens this natively with tables, headers, and exact page margins!
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Informe Académico - ${student.nombre}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4;
          margin: 20mm 18mm 20mm 18mm;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #1e293b;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        .header-box {
          background-color: #1e1b4b;
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .header-title {
          font-size: 16pt;
          font-weight: bold;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 9.5pt;
          color: #c7d2fe;
          margin: 0;
        }
        .card {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 14px 18px;
          margin-bottom: 18px;
          background-color: #f8fafc;
        }
        .section-title {
          font-size: 12pt;
          font-weight: bold;
          color: #1e1b4b;
          text-transform: uppercase;
          margin: 0 0 10px 0;
          border-bottom: 1.5px solid #cbd5e1;
          padding-bottom: 4px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 10pt;
          font-weight: bold;
          border-radius: 4px;
          background-color: ${statusBg};
          color: ${statusColor};
          border: 1px solid ${statusColor};
        }
        .metrics-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .metrics-table td {
          width: 25%;
          padding: 10px;
          text-align: center;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
        }
        .metrics-val {
          font-size: 14pt;
          font-weight: bold;
          color: #1e1b4b;
          margin-top: 4px;
        }
        .metrics-lbl {
          font-size: 8.5pt;
          color: #64748b;
          text-transform: uppercase;
          font-weight: bold;
        }
        .log-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9.5pt;
          margin-bottom: 18px;
        }
        .log-table th {
          background-color: #312e81;
          color: #ffffff;
          padding: 8px 10px;
          text-align: left;
          font-size: 9pt;
          text-transform: uppercase;
          border: 1px solid #312e81;
        }
        .signature-table {
          width: 100%;
          margin-top: 45px;
          border-collapse: collapse;
        }
        .signature-table td {
          width: 50%;
          text-align: center;
          padding: 10px;
          vertical-align: top;
        }
        .signature-line {
          width: 75%;
          border-top: 1px solid #475569;
          margin: 0 auto 6px auto;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="header-title">INFORME ACADÉMICO INDIVIDUAL</div>
        <div class="header-subtitle">
          Sistema de Gestión Académica Local • Ciclo Lectivo 2026 • Fecha de emisión: ${todayStr}
        </div>
      </div>

      <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top;">
              <div style="font-size: 8.5pt; font-family: monospace; font-weight: bold; color: #4338ca;">${student.id}</div>
              <div style="font-size: 14pt; font-weight: bold; color: #0f172a;">${student.nombre}</div>
              <div style="font-size: 9pt; color: #64748b;">${student.email || 'Sin correo institucional asignado'}</div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <span class="badge">${student.estado}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="section-title">1. Resumen de Rendimiento Académico</div>
      <table class="metrics-table">
        <tr>
          <td>
            <div class="metrics-lbl">Promedio Final</div>
            <div class="metrics-val">${student.promedioFinal} / 10</div>
            <div style="font-size: 8pt; color: #64748b;">(70% Parciales + 30% Clase)</div>
          </td>
          <td>
            <div class="metrics-lbl">Asistencia</div>
            <div class="metrics-val">${student.asistencia}%</div>
            <div style="font-size: 8pt; color: #64748b;">${student.asistencia >= 75 ? 'Regular' : 'En alerta'}</div>
          </td>
          <td>
            <div class="metrics-lbl">Trabajo en Clase</div>
            <div class="metrics-val">${student.trabajoEnClase} / 10</div>
            <div style="font-size: 8pt; color: #64748b;">Evaluación continua</div>
          </td>
          <td>
            <div class="metrics-lbl">Notas Parciales</div>
            <div class="metrics-val" style="font-size: 11pt;">${student.notasParciales.join(' - ') || 'N/A'}</div>
            <div style="font-size: 8pt; color: #64748b;">Exámenes del período</div>
          </td>
        </tr>
      </table>

      <div class="section-title">2. Historial de Sesiones & Progreso en Bitácora</div>
      <table class="log-table">
        <thead>
          <tr>
            <th style="width: 10%; text-align: center;">Clase</th>
            <th style="width: 15%; text-align: center;">Fecha</th>
            <th style="width: 25%;">Asistencia & Tarea</th>
            <th style="width: 50%;">Temario / Contenidos Tratados</th>
          </tr>
        </thead>
        <tbody>
          ${classesRowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 10px;">No hay registros de clases aún.</td></tr>'}
        </tbody>
      </table>

      <div class="section-title">3. Observaciones Pedagógicas y Seguimiento</div>
      <div class="card" style="font-size: 10pt; color: #334155; line-height: 1.5;">
        ${student.observaciones || 'El estudiante mantiene un desempeño consistente con los objetivos de la asignatura durante el presente ciclo lectivo.'}
      </div>

      <table class="signature-table">
        <tr>
          <td>
            <div class="signature-line"></div>
            <div style="font-size: 9pt; font-weight: bold; color: #1e293b;">Firma y Aclaración del Docente</div>
            <div style="font-size: 8pt; color: #64748b;">Titular de Cátedra</div>
          </td>
          <td>
            <div class="signature-line"></div>
            <div style="font-size: 9pt; font-weight: bold; color: #1e293b;">Firma de Dirección / Tutoría</div>
            <div style="font-size: 8pt; color: #64748b;">Constancia Institucional</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mimeType = format === 'html' ? 'text/html;charset=utf-8' : 'application/msword;charset=utf-8';
  const fileExt = format === 'html' ? 'html' : 'doc';
  const blob = new Blob(['\ufeff' + docHtml], { type: mimeType });
  downloadBlob(blob, `Informe_${student.nombre.replace(/\s+/g, '_')}.${fileExt}`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}
