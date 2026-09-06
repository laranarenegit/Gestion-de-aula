/**
 * Types and interfaces for the Student Management System
 * Gestion de Estudiantes con Google Workspace
 */

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
}

export type ThemeKey = 
  | 'azul-corporativo'
  | 'oscuro-elegante'
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
