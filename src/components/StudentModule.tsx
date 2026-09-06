import React, { useState, useEffect } from 'react';
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
  ArrowUpDown,
  LayoutGrid,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student, ClassSession, Course } from '../types';
import { StudentModal } from './StudentModal';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import { ReportModal } from './ReportModal';
import { CourseReportModal } from './CourseReportModal';
import { ConfirmDialog } from './ConfirmDialog';
import { exportDatabaseToSpreadsheet, exportCourseSpreadsheet } from '../services/spreadsheetService';

interface StudentModuleProps {
  students: Student[];
  classSessions: ClassSession[];
  courses?: Course[];
  selectedCourseId?: string | 'all';
  onSelectCourseId?: (courseId: string | 'all') => void;
  onOpenNewCourse?: () => void;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateAttendance: (attendanceMap: Record<string, boolean>, date: string) => void;
  accessToken: string | null;
  folderId: string | null;
}

export const StudentModule: React.FC<StudentModuleProps> = ({
  students,
  classSessions,
  courses = [],
  selectedCourseId = 'all',
  onSelectCourseId,
  onOpenNewCourse,
  onSaveStudent,
  onDeleteStudent,
  onUpdateAttendance,
  accessToken,
  folderId,
}) => {
  const { theme } = useTheme();

  // Internal course filter state synchronized with prop
  const [courseFilter, setCourseFilter] = useState<string | 'all'>(selectedCourseId);

  useEffect(() => {
    setCourseFilter(selectedCourseId);
  }, [selectedCourseId]);

  const handleCourseFilterChange = (id: string | 'all') => {
    setCourseFilter(id);
    if (onSelectCourseId) onSelectCourseId(id);
  };

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
  const [isCourseReportOpen, setIsCourseReportOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Active course object (if filtered)
  const activeCourse = courses.find(c => c.id === courseFilter);

  // Filter by course first
  const courseFilteredStudents = students.filter(s => {
    if (courseFilter === 'all') return true;
    return s.courseId === courseFilter;
  });

  // Calculation of summary metrics for current view
  const totalStudents = courseFilteredStudents.length;
  const avgPromedio = totalStudents > 0 
    ? (courseFilteredStudents.reduce((sum, s) => sum + s.promedioFinal, 0) / totalStudents).toFixed(1)
    : '0';
  const avgAsistencia = totalStudents > 0 
    ? Math.round(courseFilteredStudents.reduce((sum, s) => sum + s.asistencia, 0) / totalStudents)
    : 0;
  const enRiesgoCount = courseFilteredStudents.filter(s => s.estado === 'En Riesgo').length;

  // Filter and Sort logic
  const filteredStudents = courseFilteredStudents
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
      
      {/* Course / Grupo Switcher Bar */}
      {courses.length > 0 && (
        <div className={`p-3.5 rounded-2xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3`}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondaryClass} shrink-0 mr-1 flex items-center gap-1`}>
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cursos:</span>
            </span>

            {/* "Todos" Pill */}
            <button
              type="button"
              onClick={() => handleCourseFilterChange('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                courseFilter === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : `${theme.surfaceClass} ${theme.textSecondaryClass} ${theme.borderClass} hover:${theme.textPrimaryClass}`
              }`}
            >
              <span>Todos los Cursos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${courseFilter === 'all' ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                {students.length}
              </span>
            </button>

            {/* Course specific pills */}
            {courses.map(c => {
              const isSelected = courseFilter === c.id;
              const count = students.filter(s => s.courseId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCourseFilterChange(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : `${theme.surfaceClass} ${theme.textSecondaryClass} ${theme.borderClass} hover:${theme.textPrimaryClass}`
                  }`}
                  style={isSelected ? { backgroundColor: c.color || '#10b981', borderColor: c.color || '#10b981' } : {}}
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : (c.color || '#10b981') }}
                  />
                  <span>{c.nombre}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions for active course */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-open-course-report"
              type="button"
              onClick={() => setIsCourseReportOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border ${theme.borderClass} ${theme.surfaceClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-all`}
              title="Generar informe oficial para este curso"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Informe de {activeCourse ? activeCourse.nombre : 'Curso'}</span>
            </button>

            {onOpenNewCourse && (
              <button
                type="button"
                onClick={onOpenNewCourse}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#161B22] text-slate-300 hover:text-white border border-slate-200/60 dark:border-[#30363D] transition-colors"
                title="Crear un nuevo curso o grupo"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo Grupo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>
              {activeCourse ? `Alumnos (${activeCourse.nombre})` : 'Total Alumnos'}
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {totalStudents}
          </p>
          <span className="text-xs text-emerald-400 font-medium">
            {activeCourse ? activeCourse.materia : 'Matrícula activa en el sistema'}
          </span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Promedio del Grupo</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgPromedio} <span className="text-sm font-normal text-[#8B949E]">/ 10</span>
          </p>
          <span className="text-xs text-emerald-400 font-medium">Cálculo de calificaciones</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Asistencia Media</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgAsistencia}%
          </p>
          <span className="text-xs text-amber-400 font-medium">Presentismo acumulado</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>En Riesgo Pedagógico</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {enRiesgoCount}
          </p>
          <span className="text-xs text-rose-400 font-medium">Nota &lt; 6 o Asist. &lt; 60%</span>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter & Actions */}
      <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-students"
              type="text"
              placeholder="Buscar por nombre, ID o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161B22] p-1 rounded-lg border border-slate-200/60 dark:border-[#30363D]">
            {(['Todos', 'Aprobado', 'Regular', 'En Riesgo'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
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
            onClick={() => {
              if (activeCourse) {
                exportCourseSpreadsheet(activeCourse, students, classSessions, 'ods');
              } else {
                exportDatabaseToSpreadsheet(students, classSessions, 'ods');
              }
            }}
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Estudiante</span>
          </button>
        </div>
      </div>

      {/* Main Students & Grades Table (Synchronized with Google Sheets & Local DB) */}
      <div className={`rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${theme.borderClass} ${theme.surfaceClass} text-slate-600 dark:text-[#8B949E] uppercase tracking-wider font-bold text-[10px]`}>
              <tr>
                <th className="py-3 px-4">
                  ID Estudiante
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-emerald-400" onClick={() => toggleSort('nombre')}>
                  <div className="flex items-center gap-1">
                    <span>Nombre y Apellido</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  Curso / Grupo
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-emerald-400" onClick={() => toggleSort('asistencia')}>
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
                <th className="py-3 px-4 cursor-pointer hover:text-emerald-400" onClick={() => toggleSort('promedio')}>
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
                  const studentCourse = courses.find(c => c.id === student.courseId);

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
                        {studentCourse ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{ 
                              backgroundColor: `${studentCourse.color}15`, 
                              borderColor: `${studentCourse.color}40`,
                              color: studentCourse.color 
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: studentCourse.color }} />
                            <span>{studentCourse.nombre}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Sin curso
                          </span>
                        )}
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
                        <div className="inline-flex items-center gap-1 font-bold text-sm text-emerald-400">
                          <span>{student.promedioFinal.toFixed(1)}</span>
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
                            className={`p-1.5 rounded-lg border ${theme.borderClass} text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                            title="Generar informe individual (PDF / Writer / AbiWord)"
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
                  <td colSpan={9} className="py-8 text-center text-[#8B949E]">
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
        courses={courses}
        defaultCourseId={courseFilter !== 'all' ? courseFilter : courses[0]?.id}
        onSave={onSaveStudent}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
      />

      <QuickAttendanceModal
        isOpen={isAttendanceModalOpen}
        students={courseFilteredStudents}
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

      {/* Course Report Modal */}
      <CourseReportModal
        isOpen={isCourseReportOpen}
        course={activeCourse || courses[0] || null}
        courses={courses}
        students={students}
        classSessions={classSessions}
        onClose={() => setIsCourseReportOpen(false)}
      />

      {/* Destructive Operation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        title="¿Eliminar Estudiante?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a ${studentToDelete?.nombre} (${studentToDelete?.id})?`}
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
