import React, { useState, useEffect } from 'react';
import { X, LayoutGrid, Check, BookmarkCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Course } from '../types';

interface CourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onSave: (course: Course) => void;
  onClose: () => void;
  existingCount: number;
}

const PRESET_COLORS = [
  { label: 'Esmeralda', value: '#10b981', border: 'border-emerald-500', bg: 'bg-emerald-500' },
  { label: 'Índigo', value: '#6366f1', border: 'border-indigo-500', bg: 'bg-indigo-500' },
  { label: 'Violeta / Neón', value: '#a855f7', border: 'border-purple-500', bg: 'bg-purple-500' },
  { label: 'Ámbar', value: '#f59e0b', border: 'border-amber-500', bg: 'bg-amber-500' },
  { label: 'Rosa / Pixel', value: '#ec4899', border: 'border-pink-500', bg: 'bg-pink-500' },
  { label: 'Celeste / Cielo', value: '#0ea5e9', border: 'border-sky-500', bg: 'bg-sky-500' },
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  course,
  onSave,
  onClose,
  existingCount,
}) => {
  const { theme } = useTheme();

  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [materia, setMateria] = useState('');
  const [nivelTurno, setNivelTurno] = useState('Secundaria - Turno Mañana');
  const [anioLectivo, setAnioLectivo] = useState('2026');
  const [color, setColor] = useState('#10b981');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (course) {
      setId(course.id);
      setNombre(course.nombre);
      setMateria(course.materia);
      setNivelTurno(course.nivelTurno || 'Secundaria - Turno Mañana');
      setAnioLectivo(course.anioLectivo || '2026');
      setColor(course.color || '#10b981');
      setDescripcion(course.descripcion || '');
    } else {
      setId(`CURSO-${String(existingCount + 1).padStart(2, '0')}`);
      setNombre('');
      setMateria('');
      setNivelTurno('Secundaria - Turno Mañana');
      setAnioLectivo('2026');
      setColor(PRESET_COLORS[existingCount % PRESET_COLORS.length].value);
      setDescripcion('');
    }
  }, [course, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !materia.trim()) return;

    const savedCourse: Course = {
      id: id.trim() || `CURSO-${Date.now().toString().slice(-4)}`,
      nombre: nombre.trim(),
      materia: materia.trim(),
      nivelTurno: nivelTurno.trim() || undefined,
      anioLectivo: anioLectivo.trim() || '2026',
      color: color || '#10b981',
      descripcion: descripcion.trim() || undefined,
    };

    onSave(savedCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="course-form-modal-card"
        className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: color }}
            >
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                {course ? 'Editar Curso / Grupo' : 'Registrar Nuevo Curso o Grupo'}
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Organización de estudiantes y bitácora académica
              </p>
            </div>
          </div>
          <button
            id="btn-close-course-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
                Código / ID
              </label>
              <input
                id="input-course-id"
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                required
                className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                placeholder="CURSO-01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
                Nombre del Curso / División *
              </label>
              <input
                id="input-course-nombre"
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                placeholder="Ej. 1° Año «A» - Informática"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
              Materia / Asignatura / Taller *
            </label>
            <input
              id="input-course-materia"
              type="text"
              value={materia}
              onChange={e => setMateria(e.target.value)}
              required
              className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
              placeholder="Ej. Programación & Algoritmos, Matemáticas, Taller de Redes"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
                Nivel / Turno
              </label>
              <input
                id="input-course-turno"
                type="text"
                value={nivelTurno}
                onChange={e => setNivelTurno(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                placeholder="Secundaria - Turno Mañana"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
                Ciclo / Año Lectivo
              </label>
              <input
                id="input-course-anio"
                type="text"
                value={anioLectivo}
                onChange={e => setAnioLectivo(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
                placeholder="2026"
              />
            </div>
          </div>

          {/* Color theme selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme.textSecondaryClass}`}>
              Color Distintivo del Curso
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected 
                        ? `${c.border} ring-2 ring-emerald-500/40 font-bold ${theme.cardBgClass}` 
                        : `${theme.borderClass} ${theme.surfaceClass} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs" 
                      style={{ backgroundColor: c.value }}
                    />
                    <span className={theme.textPrimaryClass}>{c.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSecondaryClass}`}>
              Descripción u Objetivos Pedagógicos (Opcional)
            </label>
            <textarea
              id="input-course-desc"
              rows={2}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${theme.inputBgClass} ${theme.borderClass} ${theme.textPrimaryClass} focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
              placeholder="Objetivos curriculares, observaciones del grupo o división..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#30363D]">
            <button
              id="btn-cancel-course-form"
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border ${theme.borderClass} ${theme.textSecondaryClass} hover:${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
            >
              Cancelar
            </button>
            <button
              id="btn-submit-course-form"
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-transform active:scale-95`}
              style={{ backgroundColor: color }}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{course ? 'Guardar Cambios' : 'Crear Curso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
