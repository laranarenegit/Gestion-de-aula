import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ClassSession, Student, StudentClassProgress } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface ClassLogModuleProps {
  classSessions: ClassSession[];
  students: Student[];
  onSaveClassSession: (session: ClassSession) => void;
  onDeleteClassSession: (sessionId: string) => void;
}

export const ClassLogModule: React.FC<ClassLogModuleProps> = ({
  classSessions,
  students,
  onSaveClassSession,
  onDeleteClassSession,
}) => {
  const { theme } = useTheme();

  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(classSessions[0]?.id || null);
  const [classToDelete, setClassToDelete] = useState<ClassSession | null>(null);

  // New Class Form State
  const [numeroClase, setNumeroClase] = useState<number>(classSessions.length + 1);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [temario, setTemario] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [studentProgressMap, setStudentProgressMap] = useState<Record<string, StudentClassProgress>>({});

  const handleOpenNewClass = () => {
    const nextNum = classSessions.length > 0 
      ? Math.max(...classSessions.map(c => c.numeroClase)) + 1 
      : 1;
    setNumeroClase(nextNum);
    setFecha(new Date().toISOString().slice(0, 10));
    setTemario('');
    setObservaciones('');

    // Pre-populate student progress default
    const map: Record<string, StudentClassProgress> = {};
    students.forEach(s => {
      map[s.id] = {
        studentId: s.id,
        presente: true,
        participacion: 'Buena',
        tareaEntregada: true,
        notaClase: 8.0,
        notaObservacion: ''
      };
    });
    setStudentProgressMap(map);
    setIsNewClassModalOpen(true);
  };

  const handleSubmitNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!temario.trim()) return;

    const newSession: ClassSession = {
      id: `CLS-${Date.now().toString().slice(-4)}`,
      numeroClase: Number(numeroClase),
      fecha,
      temario: temario.trim(),
      observaciones: observaciones.trim() || 'Sesión dictada conforme al cronograma.',
      progresoEstudiantes: Object.values(studentProgressMap)
    };

    onSaveClassSession(newSession);
    setIsNewClassModalOpen(false);
  };

  const toggleStudentAttendance = (studentId: string) => {
    setStudentProgressMap(prev => {
      const curr = prev[studentId] || {
        studentId,
        presente: true,
        participacion: 'Buena',
        tareaEntregada: true,
      };
      return {
        ...prev,
        [studentId]: {
          ...curr,
          presente: !curr.presente,
          participacion: !curr.presente ? 'Buena' : 'No participo'
        }
      };
    });
  };

  const updateStudentProgress = (studentId: string, field: keyof StudentClassProgress, value: any) => {
    setStudentProgressMap(prev => {
      const curr = prev[studentId];
      return {
        ...prev,
        [studentId]: {
          ...curr,
          [field]: value
        }
      };
    });
  };

  return (
    <div id="class-log-module-container" className="space-y-6">
      {/* Header and New Class Session Trigger */}
      <div className={`p-5 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
              Bitácora Pedagógica & Temario por Clase
            </h2>
            <p className={`text-xs ${theme.textSecondaryClass}`}>
              Registra contenidos vistos, tareas y el progreso individual de cada estudiante por sesión.
            </p>
          </div>
        </div>

        <button
          id="btn-open-new-class-modal"
          type="button"
          onClick={handleOpenNewClass}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white ${theme.accentClass} shadow-xs transition-colors shrink-0`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Nueva Sesión</span>
        </button>
      </div>

      {/* Class Sessions Timeline / List */}
      <div className="space-y-4">
        {classSessions.map((session) => {
          const isExpanded = expandedClassId === session.id;
          const totalPresentes = session.progresoEstudiantes.filter(p => p.presente).length;
          const total = session.progresoEstudiantes.length;

          return (
            <div 
              key={session.id}
              className={`rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs transition-all overflow-hidden`}
            >
              {/* Session Header Card */}
              <div 
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-[#1F2937]/50"
                onClick={() => setExpandedClassId(isExpanded ? null : session.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-semibold">Clase</span>
                    <span className="text-base font-extrabold leading-none">#{session.numeroClase}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-[#8B949E]">
                        <Calendar className="w-3.5 h-3.5" />
                        {session.fecha}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0D1117] text-slate-600 dark:text-[#C9D1D9] dark:border dark:border-[#30363D] font-medium">
                        {totalPresentes} / {total} presentes ({total > 0 ? Math.round((totalPresentes / total) * 100) : 0}%)
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold mt-1 ${theme.textPrimaryClass}`}>
                      {session.temario}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClassToDelete(session);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    title="Eliminar sesión de clase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className={`p-1.5 rounded-lg border ${theme.borderClass} text-slate-400`}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail: General Observation & Student Progress Grid */}
              {isExpanded && (
                <div className={`p-4 border-t ${theme.borderClass} ${theme.surfaceClass} space-y-4`}>
                  {session.observaciones && (
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-xs">
                      <span className="font-semibold text-slate-700 dark:text-[#C9D1D9]">Observaciones Generales de la Clase: </span>
                      <span className={theme.textSecondaryClass}>{session.observaciones}</span>
                    </div>
                  )}

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.textMutedClass} flex items-center gap-1.5`}>
                      <Users className="w-3.5 h-3.5" />
                      <span>Registro de Progreso Individual por Estudiante</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {session.progresoEstudiantes.map((progress) => {
                        const student = students.find(s => s.id === progress.studentId);
                        const studentName = student ? student.nombre : progress.studentId;

                        return (
                          <div 
                            key={progress.studentId}
                            className="p-3 rounded-lg bg-white/90 dark:bg-[#161B22] border border-slate-200/80 dark:border-[#30363D] text-xs flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className={`font-semibold ${theme.textPrimaryClass}`}>
                                  {studentName}
                                </p>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-[#8B949E]">
                                  {progress.studentId}
                                </span>
                              </div>

                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                progress.presente 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}>
                                {progress.presente ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {progress.presente ? 'Presente' : 'Ausente'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8B949E] pt-1 border-t border-slate-100 dark:border-[#30363D]">
                              <span>Participación: <strong className="text-slate-700 dark:text-[#C9D1D9]">{progress.participacion}</strong></span>
                              <span>Tarea: <strong className={progress.tareaEntregada ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{progress.tareaEntregada ? 'Entregada' : 'Pendiente'}</strong></span>
                            </div>

                            {progress.notaObservacion && (
                              <p className="text-[10px] italic text-slate-400 dark:text-[#8B949E]">
                                "{progress.notaObservacion}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Class Session Modal */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            id="new-class-modal-card"
            className={`w-full max-w-2xl p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                    Registrar Sesión de Clase & Progreso
                  </h3>
                  <p className={`text-xs ${theme.textSecondaryClass}`}>
                    Se sincronizará en la pestaña "Bitacora" de Google Sheets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClassModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewClass} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                    # de Clase
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numeroClase}
                    onChange={(e) => setNumeroClase(Number(e.target.value))}
                    required
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117]`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                    Fecha de la Clase
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117]`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                  Temario / Contenidos Vistos *
                </label>
                <textarea
                  rows={2}
                  value={temario}
                  onChange={(e) => setTemario(e.target.value)}
                  required
                  placeholder="Ej: Unidad 2: Algoritmos condicionales y resolución de problemas prácticos."
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                  Observaciones Generales de la Clase
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Dinámica ágil, se dejó lectura para la próxima semana..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117]`}
                />
              </div>

              {/* Student Progress Checklist Matrix */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#30363D]">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.textMutedClass}`}>
                  Progreso Individual de los Estudiantes para esta Clase
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-[#30363D] max-h-56 overflow-y-auto pr-1">
                  {students.map((student) => {
                    const prog = studentProgressMap[student.id] || {
                      studentId: student.id,
                      presente: true,
                      participacion: 'Buena',
                      tareaEntregada: true,
                    };

                    return (
                      <div key={student.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className={`text-xs font-semibold ${theme.textPrimaryClass}`}>
                            {student.nombre}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-[#8B949E]">
                            {student.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStudentAttendance(student.id)}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                              prog.presente 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {prog.presente ? 'Presente' : 'Ausente'}
                          </button>

                          <select
                            value={prog.participacion}
                            onChange={(e) => updateStudentProgress(student.id, 'participacion', e.target.value)}
                            disabled={!prog.presente}
                            className={`px-2 py-1 text-xs rounded border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] disabled:opacity-40`}
                          >
                            <option value="Excelente">Excelente</option>
                            <option value="Buena">Buena</option>
                            <option value="Regular">Regular</option>
                            <option value="No participo">No participó</option>
                          </select>

                          <label className="flex items-center gap-1 text-xs cursor-pointer text-slate-600 dark:text-[#8B949E]">
                            <input
                              type="checkbox"
                              checked={prog.tareaEntregada}
                              onChange={(e) => updateStudentProgress(student.id, 'tareaEntregada', e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Tarea</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#30363D] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textSecondaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937]`}
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-new-class-session"
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${theme.accentClass} shadow-xs`}
                >
                  Guardar Sesión en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        title="¿Eliminar Registro de Clase?"
        message={`¿Deseas eliminar la Clase #${classToDelete?.numeroClase} del ${classToDelete?.fecha}? Esta operación afectará la bitácora en Google Sheets.`}
        confirmText="Eliminar Sesión"
        isDestructive={true}
        onConfirm={() => {
          if (classToDelete) {
            onDeleteClassSession(classToDelete.id);
            setClassToDelete(null);
          }
        }}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
};
