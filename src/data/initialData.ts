import { Student, ClassSession } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'EST-001',
    nombre: 'Sofía Valenzuela Morales',
    asistencia: 94,
    trabajoEnClase: 9.0,
    notasParciales: [8.5, 9.0, 9.5],
    promedioFinal: 9.0,
    email: 'sofia.valenzuela@colegio.edu',
    observaciones: 'Excelente participación en debates y entregas puntuales.',
    estado: 'Aprobado'
  },
  {
    id: 'EST-002',
    nombre: 'Mateo Benítez Giménez',
    asistencia: 88,
    trabajoEnClase: 8.0,
    notasParciales: [7.0, 8.5, 8.0],
    promedioFinal: 7.9,
    email: 'mateo.benitez@colegio.edu',
    observaciones: 'Buen rendimiento, muestra constancia en trabajos prácticos.',
    estado: 'Aprobado'
  },
  {
    id: 'EST-003',
    nombre: 'Camila Rossi Navarro',
    asistencia: 72,
    trabajoEnClase: 6.5,
    notasParciales: [6.0, 5.5, 6.5],
    promedioFinal: 6.1,
    email: 'camila.rossi@colegio.edu',
    observaciones: 'Necesita reforzar asistencia los días lunes para afianzar conceptos.',
    estado: 'Regular'
  },
  {
    id: 'EST-004',
    nombre: 'Ignacio Peralta Castro',
    asistencia: 58,
    trabajoEnClase: 5.0,
    notasParciales: [4.5, 5.0, 4.0],
    promedioFinal: 4.6,
    email: 'ignacio.peralta@colegio.edu',
    observaciones: 'Plan de recuperación pedagógica en curso. Contactar tutores.',
    estado: 'En Riesgo'
  },
  {
    id: 'EST-005',
    nombre: 'Valentina Domínguez Rios',
    asistencia: 96,
    trabajoEnClase: 9.5,
    notasParciales: [9.0, 9.5, 10.0],
    promedioFinal: 9.5,
    email: 'valentina.dominguez@colegio.edu',
    observaciones: 'Destacada iniciativa colaborativa y liderazgo en equipo.',
    estado: 'Aprobado'
  },
  {
    id: 'EST-006',
    nombre: 'Lucas Herrera Soria',
    asistencia: 82,
    trabajoEnClase: 7.5,
    notasParciales: [7.5, 8.0, 7.0],
    promedioFinal: 7.5,
    email: 'lucas.herrera@colegio.edu',
    observaciones: 'Cumple con los objetivos del trimestre de forma regular.',
    estado: 'Aprobado'
  }
];

export const INITIAL_CLASSES: ClassSession[] = [
  {
    id: 'CLS-001',
    numeroClase: 1,
    fecha: '2026-03-02',
    temario: 'Presentación del programa académico, criterios de evaluación y diagnóstico inicial de conocimientos.',
    observaciones: 'Buena disposición general. Se asignó la primera lectura complementaria.',
    progresoEstudiantes: [
      { studentId: 'EST-001', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 9.5, notaObservacion: 'Diagnóstico destacado' },
      { studentId: 'EST-002', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 8.0, notaObservacion: 'Aportes constructivos' },
      { studentId: 'EST-003', presente: true, participacion: 'Regular', tareaEntregada: true, notaClase: 6.5, notaObservacion: 'Dudas en conceptos previos' },
      { studentId: 'EST-004', presente: false, participacion: 'No participo', tareaEntregada: false, notaClase: 0, notaObservacion: 'Ausente justificado' },
      { studentId: 'EST-005', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 10, notaObservacion: 'Comprensión impecable' },
      { studentId: 'EST-006', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 7.5, notaObservacion: 'Participación activa' }
    ]
  },
  {
    id: 'CLS-002',
    numeroClase: 2,
    fecha: '2026-03-09',
    temario: 'Unidad 1: Fundamentos teóricos, análisis de casos prácticos y trabajo grupal estructurado.',
    observaciones: 'Se resolvieron 4 problemas prácticos en pizarra con buena interacción.',
    progresoEstudiantes: [
      { studentId: 'EST-001', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 9.0, notaObservacion: 'Lideró su mesa' },
      { studentId: 'EST-002', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 8.5, notaObservacion: 'Resolvió ejercicio 3' },
      { studentId: 'EST-003', presente: false, participacion: 'No participo', tareaEntregada: false, notaClase: 0, notaObservacion: 'Ausente sin aviso' },
      { studentId: 'EST-004', presente: true, participacion: 'Regular', tareaEntregada: false, notaClase: 5.0, notaObservacion: 'No trajo guía impresa' },
      { studentId: 'EST-005', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 9.5, notaObservacion: 'Aporte analítico sobresaliente' },
      { studentId: 'EST-006', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 8.0, notaObservacion: 'Buen trabajo en equipo' }
    ]
  },
  {
    id: 'CLS-003',
    numeroClase: 3,
    fecha: '2026-03-16',
    temario: 'Primer Parcial Evaluativo y taller de retroalimentación en tiempo real.',
    observaciones: 'Evaluación individual de 80 minutos. Resultados volcados a la planilla oficial.',
    progresoEstudiantes: [
      { studentId: 'EST-001', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 9.0, notaObservacion: 'Examen sobresaliente' },
      { studentId: 'EST-002', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 8.0, notaObservacion: 'Examen aprobado con solidez' },
      { studentId: 'EST-003', presente: true, participacion: 'Regular', tareaEntregada: true, notaClase: 6.0, notaObservacion: 'Aprobó al límite' },
      { studentId: 'EST-004', presente: true, participacion: 'Regular', tareaEntregada: true, notaClase: 4.5, notaObservacion: 'Requiere instancia de recuperatorio' },
      { studentId: 'EST-005', presente: true, participacion: 'Excelente', tareaEntregada: true, notaClase: 9.8, notaObservacion: 'Puntaje máximo de la sección' },
      { studentId: 'EST-006', presente: true, participacion: 'Buena', tareaEntregada: true, notaClase: 7.5, notaObservacion: 'Buen dominio general' }
    ]
  }
];

export const calculatePromedio = (notas: number[], trabajoEnClase: number): number => {
  if (notas.length === 0) return Number(trabajoEnClase.toFixed(1));
  const sumNotas = notas.reduce((acc, curr) => acc + curr, 0);
  const avgNotas = sumNotas / notas.length;
  // Ponderación habitual: 70% notas parciales, 30% trabajo en clase
  const final = (avgNotas * 0.7) + (trabajoEnClase * 0.3);
  return Number(final.toFixed(1));
};

export const getStudentStatus = (promedio: number, asistencia: number): 'Aprobado' | 'Regular' | 'En Riesgo' => {
  if (promedio >= 7 && asistencia >= 75) return 'Aprobado';
  if (promedio >= 5.5 && asistencia >= 60) return 'Regular';
  return 'En Riesgo';
};
