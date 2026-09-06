import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  Users, 
  FileText, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  UserPlus,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Course, Student, ClassSession } from '../types';
import { CourseModal } from './CourseModal';
import { CourseReportModal } from './CourseReportModal';
import { ConfirmDialog } from './ConfirmDialog';
import { exportCourseSpreadsheet } from '../services/spreadsheetService';

interface CourseModuleProps {
  courses: Course[];
  students: Student[];
  classSessions: ClassSession[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onSelectCourseForStudents: (courseId: string) => void;
  onQuickAddStudentToCourse: (courseId: string) => void;
}

export const CourseModule: React.FC<CourseModuleProps> = ({
  courses,
  students,
  classSessions,
  onSaveCourse,
  onDeleteCourse,
  onSelectCourseForStudents,
  onQuickAddStudentToCourse,
}) => {
  const { theme } = useTheme();

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [reportCourse, setReportCourse] = useState<Course | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Global metrics across all courses
  const totalCourses = courses.length;
  const totalStudents = students.length;
  const avgPromedioGlobal = totalStudents > 0
    ? (students.reduce((acc, s) => acc + s.promedioFinal, 0) / totalStudents).toFixed(1)
    : '0';
  const avgAsistenciaGlobal = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + s.asistencia, 0) / totalStudents)
    : 0;

  const handleOpenNewCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleOpenReport = (course: Course) => {
    setReportCourse(course);
    setIsReportModalOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      onDeleteCourse(courseToDelete.id);
      setCourseToDelete(null);
    }
  };

  return (
    <div id="course-module-container" className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className={`p-5 rounded-2xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${theme.textPrimaryClass}`}>
                Cursos & Grupos de Estudiantes
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {totalCourses} {totalCourses === 1 ? 'Curso' : 'Cursos'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${theme.textSecondaryClass}`}>
              Organiza tus listados en secciones independientes, genera informes oficiales por grupo y administra tus divisiones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-global-course-report"
            type="button"
            onClick={() => {
              setReportCourse(courses[0] || null);
              setIsReportModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-all`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Informes de Curso</span>
          </button>

          <button
            id="btn-add-new-course"
            type="button"
            onClick={handleOpenNewCourse}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Curso / Grupo</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Total Cursos</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {totalCourses}
          </p>
          <span className="text-xs text-emerald-400 font-medium">Divisiones curriculares activas</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Matrícula General</span>
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {totalStudents}
          </p>
          <span className="text-xs text-blue-400 font-medium">Estudiantes registrados en total</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Promedio Global</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgPromedioGlobal} <span className="text-sm font-normal opacity-70">/ 10</span>
          </p>
          <span className="text-xs text-amber-400 font-medium">Rendimiento institucional</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.textSecondaryClass}`}>Asistencia Media</span>
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${theme.textPrimaryClass}`}>
            {avgAsistenciaGlobal}%
          </p>
          <span className="text-xs text-purple-400 font-medium">Presencialidad acumulada</span>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textSecondaryClass}`}>
            Nómina de Cursos Configurados ({courses.length})
          </h3>
          <span className="text-xs text-slate-400">
            Haz clic en "Ver Estudiantes" para gestionar sus notas y asistencias
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => {
            const courseStudents = students.filter(s => s.courseId === course.id);
            const count = courseStudents.length;
            const avg = count > 0 
              ? (courseStudents.reduce((acc, s) => acc + s.promedioFinal, 0) / count).toFixed(1)
              : '-';
            const asist = count > 0 
              ? Math.round(courseStudents.reduce((acc, s) => acc + s.asistencia, 0) / count)
              : '-';
            const aprobados = courseStudents.filter(s => s.estado === 'Aprobado').length;
            const enRiesgo = courseStudents.filter(s => s.estado === 'En Riesgo').length;

            return (
              <div 
                key={course.id}
                id={`course-card-${course.id}`}
                className={`rounded-2xl border ${theme.cardBgClass} ${theme.borderClass} shadow-md overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 transition-all group`}
              >
                <div>
                  {/* Top Color Banner */}
                  <div 
                    className="h-2.5 w-full transition-all"
                    style={{ backgroundColor: course.color || '#10b981' }}
                  />

                  <div className="p-5">
                    {/* Course Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: course.color || '#10b981' }}
                          />
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {course.id}
                          </span>
                        </div>
                        <h4 className={`text-base font-bold mt-1 tracking-tight ${theme.textPrimaryClass} group-hover:text-emerald-400 transition-colors`}>
                          {course.nombre}
                        </h4>
                        <p className={`text-xs font-medium ${theme.textSecondaryClass}`}>
                          {course.materia}
                        </p>
                      </div>

                      {/* Top Action Menu */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditCourse(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
                          title="Editar Curso"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Eliminar Curso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      {course.nivelTurno && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-[#161B22] text-slate-300 border border-slate-200/60 dark:border-[#30363D]">
                          {course.nivelTurno}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-[#161B22] text-slate-300 border border-slate-200/60 dark:border-[#30363D]">
                        Ciclo {course.anioLectivo || '2026'}
                      </span>
                    </div>

                    {course.descripcion && (
                      <p className={`text-xs mt-2 line-clamp-2 ${theme.textMutedClass}`}>
                        {course.descripcion}
                      </p>
                    )}

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-[#30363D]">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#161B22]/80 text-center">
                        <span className={`text-[10px] uppercase font-bold ${theme.textMutedClass}`}>Alumnos</span>
                        <p className={`text-sm font-extrabold ${theme.textPrimaryClass}`}>{count}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#161B22]/80 text-center">
                        <span className={`text-[10px] uppercase font-bold ${theme.textMutedClass}`}>Promedio</span>
                        <p className={`text-sm font-extrabold ${theme.textPrimaryClass}`}>{avg}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#161B22]/80 text-center">
                        <span className={`text-[10px] uppercase font-bold ${theme.textMutedClass}`}>Asistencia</span>
                        <p className={`text-sm font-extrabold ${theme.textPrimaryClass}`}>{asist}{count > 0 ? '%' : ''}</p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    {count > 0 && (
                      <div className="flex items-center justify-between text-[11px] mt-2 px-1 text-slate-400">
                        <span className="text-emerald-400 font-semibold">{aprobados} aprobados</span>
                        <span className="text-rose-400 font-semibold">{enRiesgo} en riesgo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReport(course)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border ${theme.borderClass} ${theme.surfaceClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Informe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickAddStudentToCourse(course.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border ${theme.borderClass} ${theme.surfaceClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                    >
                      <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                      <span>+ Alumno</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCourseForStudents(course.id)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl text-white shadow-sm transition-all active:scale-98"
                    style={{ backgroundColor: course.color || '#10b981' }}
                  >
                    <span>Ver Estudiantes & Planilla</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Course Card Button */}
          <button
            type="button"
            onClick={handleOpenNewCourse}
            className={`min-h-[280px] rounded-2xl border-2 border-dashed ${theme.borderClass} hover:border-emerald-500/60 p-6 flex flex-col items-center justify-center gap-3 transition-all hover:bg-emerald-500/5 group`}
          >
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#161B22] text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className={`text-sm font-bold ${theme.textPrimaryClass} group-hover:text-emerald-400 transition-colors`}>
                Agregar Nuevo Curso o Grupo
              </h4>
              <p className={`text-xs mt-1 ${theme.textSecondaryClass}`}>
                Crea otra sección, división o año escolar
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Course Edit/Create Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        course={editingCourse}
        onSave={onSaveCourse}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        existingCount={courses.length}
      />

      {/* Course Report Modal */}
      <CourseReportModal
        isOpen={isReportModalOpen}
        course={reportCourse}
        courses={courses}
        students={students}
        classSessions={classSessions}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportCourse(null);
        }}
        onSelectCourse={c => setReportCourse(c)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!courseToDelete}
        title="¿Eliminar este Curso / Grupo?"
        message={`Estás a punto de eliminar el curso "${courseToDelete?.nombre}". Los estudiantes no se borrarán pero quedarán sin curso asignado.`}
        confirmText="Eliminar Curso"
        onConfirm={confirmDelete}
        onCancel={() => setCourseToDelete(null)}
      />
    </div>
  );
};
