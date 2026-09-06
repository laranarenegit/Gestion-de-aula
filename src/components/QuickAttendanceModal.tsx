import React, { useState } from 'react';
import { X, CheckCheck, UserCheck, Calendar, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student } from '../types';

interface QuickAttendanceModalProps {
  isOpen: boolean;
  students: Student[];
  onSaveAttendance: (attendanceMap: Record<string, boolean>, date: string) => void;
  onClose: () => void;
}

export const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({
  isOpen,
  students,
  onSaveAttendance,
  onClose,
}) => {
  const { theme } = useTheme();
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    students.forEach(s => { init[s.id] = true; });
    return init;
  });

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMarkAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    students.forEach(s => { updated[s.id] = present; });
    setAttendance(updated);
  };

  const handleSave = () => {
    onSaveAttendance(attendance, date);
    onClose();
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="quick-attendance-modal-card"
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                Toma Rápida de Asistencia
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Actualiza el porcentaje de asistencia general con 1 clic
              </p>
            </div>
          </div>
          <button
            id="btn-close-attendance-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date and Quick Batch Actions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-[#8B949E]" />
            <span className="text-xs font-semibold text-slate-700 dark:text-[#C9D1D9]">Fecha:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`px-2 py-1 text-xs rounded-md border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#161B22]`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll(true)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50 transition-colors"
            >
              Todos Presentes
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll(false)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border dark:border-rose-800/50 transition-colors"
            >
              Todos Ausentes
            </button>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="mt-3 flex items-center justify-between text-xs px-1">
          <span className={theme.textSecondaryClass}>
            Estudiantes registrados: <strong className={theme.textPrimaryClass}>{students.length}</strong>
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {presentCount} presentes / {students.length - presentCount} ausentes
          </span>
        </div>

        {/* Attendance List */}
        <div className="mt-3 divide-y divide-slate-100 dark:divide-[#30363D] max-h-64 overflow-y-auto pr-1">
          {students.map((student) => {
            const isPresent = attendance[student.id] !== false;
            return (
              <div 
                key={student.id} 
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className={`text-xs font-semibold ${theme.textPrimaryClass}`}>
                    {student.nombre}
                  </p>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-[#8B949E]">
                    {student.id} • Actual: {student.asistencia}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(student.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isPresent
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  <CheckCheck className={`w-3.5 h-3.5 ${isPresent ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{isPresent ? 'Presente' : 'Ausente'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#30363D] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textSecondaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            Cancelar
          </button>
          <button
            id="btn-save-quick-attendance"
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${theme.accentClass} flex items-center gap-1.5 shadow-xs transition-colors`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Aplicar Asistencia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
