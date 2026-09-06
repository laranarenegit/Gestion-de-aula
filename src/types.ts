/**
 * Types and interfaces for the Student Management System
 * Gestion de Estudiantes con Google Workspace
 */

export interface Course {
  id: string; // e.g. "CUR-001"
  nombre: string; // e.g. "1° Año 'A' - Informática"
  materia: string; // e.g. "Introducción a la Programación"
  nivelTurno?: string; // e.g. "Secundaria - Turno Mañana"
  anioLectivo?: string; // e.g. "2026"
  color?: 'emerald' | 'indigo' | 'violet' | 'amber' | 'rose' | 'sky';
  descripcion?: string;
}

export interface Student {
  id: string; // ID_Estudiante e.g. "EST-001"
  nombre: string; // Nombre_y_Apellido
  asistencia: number; // Asistencia (%) e.g. 92
  trabajoEnClase: number; // Trabajo_en_Clase (calificacion 1-10 o 0-100)
  notasParciales: number[]; // Array de notas parciales e.g. [8, 9, 7.5]
  promedioFinal: number; // Promedio_Final calculado
  email?: string;
  observaciones?: string;
  estado?: 'Aprobado' | 'Regular' | 'En Riesgo';
  courseId?: string; // ID del curso o grupo al que pertenece el estudiante
}

export interface StudentClassProgress {
  studentId: string;
  presente: boolean;
  participacion: 'Excelente' | 'Buena' | 'Regular' | 'No participo';
  tareaEntregada: boolean;
  notaClase?: number;
  notaObservacion?: string;
}

export interface ClassSession {
  id: string;
  numeroClase: number; // # de Clase
  fecha: string; // YYYY-MM-DD
  temario: string; // Temario / Contenidos Vistos
  observaciones: string; // Observaciones generales
  progresoEstudiantes: StudentClassProgress[]; // Progreso individual por estudiante vinculado
  courseId?: string; // ID del curso opcional para bitácora por grupo
}

export type ThemeKey = 
  | 'gamer-8bit'
  | 'oscuro-elegante'
  | 'azul-corporativo'
  | 'minimalista-minimal'
  | 'pastel-educativo'
  | 'esmeralda-academico';

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  description: string;
  bgClass: string;
  cardBgClass: string;
  surfaceClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  textMutedClass: string;
  accentClass: string;
  accentHoverClass: string;
  accentTextClass: string;
  borderClass: string;
  badgeSuccessClass: string;
  badgeWarningClass: string;
  badgeDangerClass: string;
  isDark: boolean;
}

export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string | null;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface WorkspaceSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  spreadsheetId: string | null;
  spreadsheetName: string;
  spreadsheetUrl: string | null;
  folderId: string | null;
  folderUrl: string | null;
  lastSyncTime: string | null;
  error: string | null;
}
