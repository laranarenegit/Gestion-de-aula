import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit2, Calculator, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student } from '../types';
import { calculatePromedio, getStudentStatus } from '../data/initialData';

interface StudentModalProps {
  isOpen: boolean;
  student: Student | null; // null for new, existing for edit
  onSave: (student: Student) => void;
  onClose: () => void;
  existingCount: number;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  student,
  onSave,
  onClose,
  existingCount,
}) => {
  const { theme } = useTheme();

  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asistencia, setAsistencia] = useState<number>(100);
  const [trabajoEnClase, setTrabajoEnClase] = useState<number>(8.0);
  const [notasInput, setNotasInput] = useState<string>('8, 8.5');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (student) {
      setId(student.id);
      setNombre(student.nombre);
      setEmail(student.email || '');
      setAsistencia(student.asistencia);
      setTrabajoEnClase(student.trabajoEnClase);
      setNotasInput(student.notasParciales.join(', '));
      setObservaciones(student.observaciones || '');
    } else {
      const nextId = `EST-${String(existingCount + 1).padStart(3, '0')}`;
      setId(nextId);
      setNombre('');
      setEmail('');
      setAsistencia(90);
      setTrabajoEnClase(8.0);
      setNotasInput('8.0, 8.5');
      setObservaciones('');
    }
  }, [student, existingCount, isOpen]);

  if (!isOpen) return null;

  // Parse notas
  const parsedNotas = notasInput
    .split(',')
    .map(n => parseFloat(n.trim()))
    .filter(n => !isNaN(n) && n >= 0 && n <= 10);

  const calculatedPromedio = calculatePromedio(parsedNotas, trabajoEnClase);
  const status = getStudentStatus(calculatedPromedio, asistencia);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const updatedStudent: Student = {
      id: id.trim() || `EST-${Date.now().toString().slice(-4)}`,
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      asistencia: Math.min(100, Math.max(0, Number(asistencia))),
      trabajoEnClase: Math.min(10, Math.max(0, Number(trabajoEnClase))),
      notasParciales: parsedNotas.length > 0 ? parsedNotas : [trabajoEnClase],
      promedioFinal: calculatedPromedio,
      observaciones: observaciones.trim() || undefined,
      estado: status
    };

    onSave(updatedStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="student-edit-modal-card"
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              {student ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                {student ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Sincronizado con las columnas de Google Sheets
              </p>
            </div>
          </div>
          <button
            id="btn-close-student-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                ID Estudiante
              </label>
              <input
                id="input-student-id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                placeholder="EST-001"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                Nombre y Apellido *
              </label>
              <input
                id="input-student-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                placeholder="Ej: Sofía Valenzuela Morales"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
              Correo Institucional (Opcional)
            </label>
            <input
              id="input-student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              placeholder="estudiante@colegio.edu"
            />
          </div>

          {/* Academic Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                Asistencia (%)
              </label>
              <input
                id="input-student-asistencia"
                type="number"
                min="0"
                max="100"
                value={asistencia}
                onChange={(e) => setAsistencia(Number(e.target.value))}
                required
                className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                Trabajo en Clase (1-10)
              </label>
              <input
                id="input-student-trabajo"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={trabajoEnClase}
                onChange={(e) => setTrabajoEnClase(Number(e.target.value))}
                required
                className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
                Notas Parciales
              </label>
              <input
                id="input-student-notas"
                type="text"
                value={notasInput}
                onChange={(e) => setNotasInput(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                placeholder="Ej: 8, 9, 7.5"
              />
              <span className="text-[10px] text-slate-400 dark:text-[#8B949E]">Separadas por comas</span>
            </div>
          </div>

          {/* Real-time Calculation Badge */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 dark:bg-[#161B22] dark:border-[#30363D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-[#E2E8F0]">
                  Cálculo Automático de Promedio Final
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">
                  Fórmula: 70% Parciales + 30% Trabajo en Clase
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-indigo-700 dark:text-indigo-400">
                {calculatedPromedio} / 10
              </span>
              <span className={`block text-[10px] font-bold ${
                status === 'Aprobado' ? 'text-emerald-500 dark:text-emerald-400' :
                status === 'Regular' ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'
              }`}>
                {status}
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textSecondaryClass}`}>
              Observaciones Pedagógicas
            </label>
            <textarea
              id="input-student-observaciones"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} dark:bg-[#0D1117] focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              placeholder="Desempeño, atención en clase o sugerencias para tutoría..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#30363D] flex items-center justify-end gap-2">
            <button
              id="btn-cancel-student-modal"
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textSecondaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
            >
              Cancelar
            </button>
            <button
              id="btn-save-student"
              type="submit"
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${theme.accentClass} flex items-center gap-1.5 shadow-xs transition-colors`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{student ? 'Guardar Cambios' : 'Registrar Estudiante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
