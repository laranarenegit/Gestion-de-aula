import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  FileCode,
  Calendar,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Course, Student, ClassSession } from '../types';
import { generateCoursePDF } from '../services/pdfGenerator';
import { generateCourseWordProcessorReport, WordProcessorFormat } from '../services/wordProcessorService';
import { exportCourseSpreadsheet, SpreadsheetFormat } from '../services/spreadsheetService';

interface CourseReportModalProps {
  isOpen: boolean;
  course: Course | null;
  courses: Course[];
  students: Student[];
  classSessions: ClassSession[];
  onClose: () => void;
  onSelectCourse?: (course: Course) => void;
}

export const CourseReportModal: React.FC<CourseReportModalProps> = ({
  isOpen,
  course,
  courses,
  students,
  classSessions,
  onClose,
  onSelectCourse,
}) => {
  const { theme } = useTheme();
  const [activeCourseId, setActiveCourseId] = useState<string>(course?.id || courses[0]?.id || '');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === activeCourseId) || course || courses[0];
  if (!currentCourse) return null;

  const courseStudents = students.filter(s => s.courseId === currentCourse.id);
  const totalStudents = courseStudents.length;
  const avgPromedio = totalStudents > 0 
    ? (courseStudents.reduce((sum, s) => sum + s.promedioFinal, 0) / totalStudents).toFixed(1)
    : '0';
  const avgAsistencia = totalStudents > 0 
    ? Math.round(courseStudents.reduce((sum, s) => sum + s.asistencia, 0) / totalStudents)
    : 0;
  const aprobados = courseStudents.filter(s => s.estado === 'Aprobado').length;
  const regulares = courseStudents.filter(s => s.estado === 'Regular').length;
  const enRiesgo = courseStudents.filter(s => s.estado === 'En Riesgo').length;

  const handleDownloadPDF = () => {
    generateCoursePDF(currentCourse, students, classSessions);
    setSuccessNotice('Planilla oficial en PDF generada.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleDownloadWordProcessor = (format: WordProcessorFormat) => {
    generateCourseWordProcessorReport(currentCourse, students, classSessions, format);
    setSuccessNotice(`Documento .${format.toUpperCase()} generado para LibreOffice Writer / AbiWord.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleDownloadSpreadsheet = (format: SpreadsheetFormat) => {
    exportCourseSpreadsheet(currentCourse, students, classSessions, format);
    setSuccessNotice(`Planilla de cálculo .${format.toUpperCase()} generada con éxito.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="course-report-generator-modal"
        className={`w-full max-w-2xl p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: currentCourse.color || '#10b981' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                Generador de Informes por Curso / Grupo
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Exportación académica y nóminas oficiales para antiX Linux
              </p>
            </div>
          </div>
          <button
            id="btn-close-course-report-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Switcher in Modal */}
        {courses.length > 1 && (
          <div className="mt-4">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textSecondaryClass}`}>
              Seleccionar Curso / Sección:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {courses.map(c => {
                const isSelected = c.id === currentCourse.id;
                const count = students.filter(s => s.courseId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCourseId(c.id);
                      if (onSelectCourse) onSelectCourse(c);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                      isSelected
                        ? 'text-white shadow-xs'
                        : `${theme.surfaceClass} ${theme.textSecondaryClass} ${theme.borderClass} hover:${theme.textPrimaryClass}`
                    }`}
                    style={isSelected ? { backgroundColor: c.color || '#10b981', borderColor: c.color || '#10b981' } : {}}
                  >
                    <span>{c.nombre}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Overview Card */}
        <div className={`mt-4 p-4 rounded-xl border ${theme.surfaceClass} ${theme.borderClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: currentCourse.color || '#10b981' }}
                />
                <h4 className={`text-base font-bold ${theme.textPrimaryClass}`}>
                  {currentCourse.nombre}
                </h4>
              </div>
              <p className={`text-xs ${theme.textSecondaryClass} mt-0.5`}>
                {currentCourse.materia} • {currentCourse.nivelTurno || 'General'} • Ciclo {currentCourse.anioLectivo || '2026'}
              </p>
            </div>

            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-center">
              {totalStudents} Estudiantes Inscriptos
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-[#30363D]">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161B22] text-center">
              <span className={`text-[10px] uppercase font-bold ${theme.textMutedClass}`}>Promedio</span>
              <p className={`text-base font-extrabold ${theme.textPrimaryClass}`}>{avgPromedio} / 10</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161B22] text-center">
              <span className={`text-[10px] uppercase font-bold ${theme.textMutedClass}`}>Asistencia</span>
              <p className={`text-base font-extrabold ${theme.textPrimaryClass}`}>{avgAsistencia}%</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-500">Aprobados</span>
              <p className="text-base font-extrabold text-emerald-400">{aprobados}</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-500">En Riesgo</span>
              <p className="text-base font-extrabold text-rose-400">{enRiesgo}</p>
            </div>
          </div>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="mt-5 space-y-4">
          <p className={`text-xs font-bold uppercase tracking-wider ${theme.textSecondaryClass}`}>
            Opciones de Exportación y Descarga:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. PDF Oficial */}
            <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xs`}>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${theme.textPrimaryClass}`}>Planilla Oficial en PDF</h5>
                    <span className="text-[10px] text-slate-400">Listo para imprimir y archivar</span>
                  </div>
                </div>
                <p className={`text-[11px] ${theme.textSecondaryClass} mt-1`}>
                  Contiene cabecera institucional, métricas del curso, tabla con todos los alumnos, promedios y firmas.
                </p>
              </div>

              <button
                id="btn-export-course-pdf"
                type="button"
                onClick={handleDownloadPDF}
                className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            </div>

            {/* 2. Procesador de Texto (LibreOffice Writer / AbiWord) */}
            <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xs`}>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${theme.textPrimaryClass}`}>Procesador de Texto Editable</h5>
                    <span className="text-[10px] text-slate-400">LibreOffice Writer / AbiWord</span>
                  </div>
                </div>
                <p className={`text-[11px] ${theme.textSecondaryClass} mt-1`}>
                  Documento editable con formato oficial para actas de examen o secretaría académica.
                </p>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <button
                  id="btn-export-course-doc"
                  type="button"
                  onClick={() => handleDownloadWordProcessor('doc')}
                  className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Formato Word / LibreOffice Writer"
                >
                  <Download className="w-3 h-3" />
                  <span>.DOC Writer</span>
                </button>
                <button
                  id="btn-export-course-rtf"
                  type="button"
                  onClick={() => handleDownloadWordProcessor('rtf')}
                  className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Formato liviano para AbiWord en antiX Linux"
                >
                  <Download className="w-3 h-3" />
                  <span>.RTF AbiWord</span>
                </button>
              </div>
            </div>

            {/* 3. Planilla de Cálculo (.ODS / .XLSX) */}
            <div className={`p-4 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xs sm:col-span-2`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${theme.textPrimaryClass}`}>Planilla de Cálculo Exclusiva del Curso</h5>
                    <p className={`text-[11px] ${theme.textSecondaryClass}`}>
                      Exporta únicamente los alumnos de {currentCourse.nombre} con hojas de Estudiantes y Matriz de Seguimiento.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-export-course-ods"
                    type="button"
                    onClick={() => handleDownloadSpreadsheet('ods')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                    title="Formato nativo para LibreOffice Calc en antiX Linux"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ODS (Calc)</span>
                  </button>
                  <button
                    id="btn-export-course-xlsx"
                    type="button"
                    onClick={() => handleDownloadSpreadsheet('xlsx')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-200 transition-colors"
                    title="Formato Microsoft Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.XLSX</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-5 border-t border-slate-200 dark:border-[#30363D] mt-6">
          <button
            id="btn-close-report-modal-footer"
            type="button"
            onClick={onClose}
            className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-xl border ${theme.borderClass} ${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
