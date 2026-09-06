import { jsPDF } from 'jspdf';
import { Student, ClassSession } from '../types';

export function generateStudentPDF(student: Student, classSessions: ClassSession[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [26, 54, 93]; // Deep Navy
  const secondaryColor: [number, number, number] = [74, 85, 104];
  const lightBg: [number, number, number] = [247, 250, 252];
  const accentBorder: [number, number, number] = [226, 232, 240];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SISTEMA DE GESTIÓN ACADÉMICA', 15, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Informe Individual de Progreso del Estudiante • Ciclo 2026', 15, 22);

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.text(`Fecha: ${todayStr}`, 160, 22);

  // Student Profile Card
  let y = 38;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...accentBorder);
  doc.roundedRect(15, y, 180, 32, 2, 2, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(student.nombre, 22, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text(`ID Estudiante: ${student.id}`, 22, y + 18);
  doc.text(`Email institucional: ${student.email || 'No asignado'}`, 22, y + 25);

  // Status Badge
  const statusColor: [number, number, number] = 
    student.estado === 'Aprobado' ? [16, 185, 129] :
    student.estado === 'Regular' ? [245, 158, 11] : [239, 68, 68];

  doc.setFillColor(...statusColor);
  doc.roundedRect(145, y + 7, 42, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`ESTADO: ${student.estado?.toUpperCase() || 'EN CURSO'}`, 148, y + 13.5);

  // Metrics Grid
  y = 78;
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('MÉTRICAS ACADÉMICAS Y ASISTENCIA', 15, y);

  y += 6;
  const colWidth = 42.5;
  const metrics = [
    { title: 'Promedio Final', value: `${student.promedioFinal}/10`, note: 'Ponderado 70/30' },
    { title: 'Asistencia', value: `${student.asistencia}%`, note: student.asistencia >= 75 ? 'Regular' : 'En alerta' },
    { title: 'Trabajo en Clase', value: `${student.trabajoEnClase}/10`, note: 'Evaluación continua' },
    { title: 'Notas Parciales', value: student.notasParciales.join(' - ') || 'N/A', note: 'Exámenes' },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 15 + (idx * (colWidth + 3.3));
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...accentBorder);
    doc.roundedRect(xPos, y, colWidth, 24, 2, 2, 'FD');

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(m.title, xPos + 4, y + 7);

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(m.value, xPos + 4, y + 15);

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text(m.note, xPos + 4, y + 21);
  });

  // Class Log & Attendance History Table
  y += 34;
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('HISTORIAL DE BITÁCORA Y SESIONES DE CLASE', 15, y);

  y += 6;
  doc.setFillColor(...primaryColor);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Clase', 18, y + 5.5);
  doc.text('Fecha', 34, y + 5.5);
  doc.text('Estado / Tarea', 60, y + 5.5);
  doc.text('Temario y Contenidos Vistos', 105, y + 5.5);

  y += 8;
  const relevantClasses = classSessions.slice(0, 7); // Show recent classes

  relevantClasses.forEach((cls, i) => {
    const rowBg: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : lightBg;
    doc.setFillColor(...rowBg);
    doc.rect(15, y, 180, 11, 'F');

    const record = cls.progresoEstudiantes.find(p => p.studentId === student.id);
    const presText = record?.presente ? 'Presente' : 'Ausente';
    const taskText = record?.tareaEntregada ? 'Tarea OK' : 'Sin tarea';

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`#${cls.numeroClase}`, 18, y + 7);
    doc.text(cls.fecha, 34, y + 7);
    doc.text(`${presText} | ${taskText}`, 60, y + 7);

    // Truncate long topic text
    const cleanTopic = cls.temario.length > 55 ? `${cls.temario.substring(0, 52)}...` : cls.temario;
    doc.text(cleanTopic, 105, y + 7);

    y += 11;
  });

  // Observations Section
  y += 6;
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OBSERVACIONES PEDAGÓGICAS', 15, y);

  y += 4;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...accentBorder);
  doc.roundedRect(15, y, 180, 22, 2, 2, 'FD');

  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const obsText = student.observaciones || 'El estudiante sostiene un ritmo de aprendizaje regular acorde a los contenidos del curso.';
  const splitObs = doc.splitTextToSize(obsText, 170);
  doc.text(splitObs, 19, y + 7);

  // Signatures Line
  y += 36;
  doc.setDrawColor(180, 180, 180);
  doc.line(25, y, 85, y);
  doc.line(125, y, 185, y);

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.text('Firma y Aclaración del Docente', 32, y + 5);
  doc.text('Firma de Dirección / Tutoría', 133, y + 5);

  // Save the document
  const fileName = `Informe_${student.nombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
