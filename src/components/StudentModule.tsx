import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  FileText, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student, ClassSession } from '../types';
import { StudentModal } from './StudentModal';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import { ReportModal } from './ReportModal';
import { ConfirmDialog } from './ConfirmDialog';
import { exportDatabaseToSpreadsheet } from '../services/spreadsheetService';
import { FileSpreadsheet } from 'lucide-react';

interface StudentModuleProps {
  students: Student[];
  classSessions: ClassSession[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateAttendance: (attendanceMap: Record<string, boolean>, date: string) => void;
  accessToken: string | null;
  folderId: string | null;
}

export const StudentModule: React.FC<StudentModuleProps> = ({
  students,
  classSessions,
  onSaveStudent,
  onDeleteStudent,
  onUpdateAttendance,
  accessToken,
  folderId,
}) => {
  const { theme } = useTheme();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aprobado' | 'Regular' | 'En Riesgo'>('Todos');
  const [sortBy, setSortBy] = useState<'nombre' | 'promedio' | 'asistencia'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Calculation of summary metrics
  const totalStudents = students.length;
  const avgPromedio = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + s.promedioFinal, 0) / totalStudents).toFixed(1)
    : '0';
  const avgAsistencia = totalStudents > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.asistencia, 0) / totalStudents)
    : 0;
  const enRiesgoCount = students.filter(s => s.estado === 'En Riesgo').length;

  // Filter and Sort logic
  const filteredStudents = students
    .filter(s => {
      const matchSearch = 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'Todos' || s.estado === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'nombre') {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (sortBy === 'promedio') {
        comparison = a.promedioFinal - b.promedioFinal;
      } else if (sortBy === 'asistencia') {
        comparison = a.asistencia - b.asistencia;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (type: 'nombre' | 'promedio' | 'asistencia') => {
    if (sortBy === type) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  return (
    <div id="student-module-container" className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Total Alumnos</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {totalStudents}
          </p>
          <span className="text-xs text-indigo-400 font-medium">Matrícula activa en el curso</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Promedio del Curso</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgPromedio} <span className="text-xs font-normal text-[#8B949E]">/ 10</span>
          </p>
          <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">Cálculo ponderado 70/30</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Asistencia Promedio</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgAsistencia}%
          </p>
          <span className="text-xs text-[#8B949E] font-medium">Meta institucional: &gt;75%</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Casos en Riesgo</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${enRiesgoCount > 0 ? 'text-rose-500' : theme.textPrimaryClass}`}>
            {enRiesgoCount}
          </p>
          <span className="text-xs text-[#8B949E] font-medium">Promedio &lt; 5.5 o Asistencia &lt; 60%</span>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        {/* Search Input & Status Pill Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8B949E]" />
            <input
              id="input-search-students"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, ID o email..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] dark:placeholder-[#8B949E]/60 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['Todos', 'Aprobado', 'Regular', 'En Riesgo'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : `${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937]`
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons: Add Student, Quick Attendance & Export Calc */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-export-calc-ods"
            type="button"
            onClick={() => exportDatabaseToSpreadsheet(students, classSessions, 'ods')}
            title="Descargar base de datos en formato LibreOffice Calc (.ods)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#30363D] text-slate-700 dark:text-[#C9D1D9] hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Planilla Calc (.ods)</span>
          </button>

          <button
            id="btn-open-quick-attendance"
            type="button"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-500/40 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Tomar Asistencia</span>
          </button>

          <button
            id="btn-open-new-student"
            type="button"
            onClick={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white ${theme.accentClass} shadow-xs transition-colors`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Estudiante</span>
          </button>
        </div>
      </div>

      {/* Main Students & Grades Table (Synchronized with Google Sheets) */}
      <div className={`rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${theme.borderClass} ${theme.surfaceClass} text-slate-600 dark:text-[#8B949E] uppercase tracking-wider font-bold text-[10px]`}>
              <tr>
                <th className="py-3 px-4">
                  ID Estudiante
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('nombre')}>
                  <div className="flex items-center gap-1">
                    <span>Nombre y Apellido</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('asistencia')}>
                  <div className="flex items-center gap-1">
                    <span>Asistencia (%)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  Trabajo en Clase
                </th>
                <th className="py-3 px-4">
                  Notas Parciales
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('promedio')}>
                  <div className="flex items-center gap-1">
                    <span>Promedio Final</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  Estado
                </th>
                <th className="py-3 px-4 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.borderClass}`}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50/70 dark:hover:bg-[#1F2937] transition-colors`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-500 dark:text-[#8B949E]">
                        {student.id}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${theme.textPrimaryClass}`}>
                            {student.nombre}
                          </span>
                          {student.email && (
                            <span className="text-[10px] text-[#8B949E]">
                              {student.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-[#30363D] overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                student.asistencia >= 80 ? 'bg-emerald-500' :
                                student.asistencia >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${student.asistencia}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-[#C9D1D9]">
                            {student.asistencia}%
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-[#C9D1D9]">
                          {student.trabajoEnClase}
                        </span>
                        <span className="text-[#8B949E] text-[10px]"> / 10</span>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {student.notasParciales.map((nota, i) => (
                            <span 
                              key={i} 
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0D1117] dark:border dark:border-[#30363D] text-slate-700 dark:text-[#C9D1D9] font-mono text-[11px] font-semibold"
                            >
                              {nota}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="inline-flex items-center gap-1 font-bold text-sm text-indigo-600 dark:text-indigo-400">
                          <span>{student.promedioFinal}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          student.estado === 'Aprobado' ? theme.badgeSuccessClass :
                          student.estado === 'Regular' ? theme.badgeWarningClass : theme.badgeDangerClass
                        }`}>
                          {student.estado}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Report Generator button */}
                          <button
                            id={`btn-report-${student.id}`}
                            type="button"
                            onClick={() => setReportStudent(student)}
                            className={`p-1.5 rounded-lg border ${theme.borderClass} text-indigo-500 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                            title="Generar informe (Google Docs / PDF)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            id={`btn-edit-${student.id}`}
                            type="button"
                            onClick={() => {
                              setEditingStudent(student);
                              setIsStudentModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg border ${theme.borderClass} ${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                            title="Editar datos y calificaciones"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button (with confirmation dialog) */}
                          <button
                            id={`btn-delete-${student.id}`}
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className={`p-1.5 rounded-lg border ${theme.borderClass} text-rose-500 hover:bg-rose-500/10 dark:hover:bg-[#1F2937] transition-colors`}
                            title="Eliminar estudiante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8B949E]">
                    No se encontraron estudiantes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        student={editingStudent}
        existingCount={students.length}
        onSave={onSaveStudent}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
      />

      <QuickAttendanceModal
        isOpen={isAttendanceModalOpen}
        students={students}
        onSaveAttendance={onUpdateAttendance}
        onClose={() => setIsAttendanceModalOpen(false)}
      />

      <ReportModal
        isOpen={!!reportStudent}
        student={reportStudent}
        classSessions={classSessions}
        accessToken={accessToken}
        folderId={folderId}
        onClose={() => setReportStudent(null)}
      />

      {/* Destructive Operation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        title="¿Eliminar Estudiante?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a ${studentToDelete?.nombre} (${studentToDelete?.id})? Esta acción actualizará los registros sincronizados en Google Sheets.`}
        confirmText="Eliminar Estudiante"
        isDestructive={true}
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
