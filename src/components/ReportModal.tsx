import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  FolderCheck,
  AlertCircle,
  FileCode,
  Printer
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student, ClassSession } from '../types';
import { generateStudentPDF } from '../services/pdfGenerator';
import { generateWordProcessorReport, WordProcessorFormat } from '../services/wordProcessorService';
import { createGoogleDocReport } from '../services/googleWorkspace';

interface ReportModalProps {
  isOpen: boolean;
  student: Student | null;
  classSessions: ClassSession[];
  accessToken: string | null;
  folderId: string | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  student,
  classSessions,
  accessToken,
  folderId,
  onClose,
}) => {
  const { theme } = useTheme();
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDownloadPDF = () => {
    generateStudentPDF(student, classSessions);
  };

  const handleDownloadWordProcessor = (format: WordProcessorFormat) => {
    try {
      generateWordProcessorReport(student, classSessions, format);
      setSuccessNotice(`Documento .${format.toUpperCase()} generado. Puedes abrirlo directamente con LibreOffice Writer o AbiWord.`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      setErrorMsg(`Error al generar el documento: ${err.message}`);
    }
  };

  const handleCreateGoogleDoc = async () => {
    if (!accessToken) {
      setErrorMsg('Debes iniciar sesión con Google para generar y guardar el documento directamente en Google Drive.');
      return;
    }

    try {
      setIsGeneratingDoc(true);
      setErrorMsg(null);
      const res = await createGoogleDocReport(accessToken, folderId, student, classSessions);
      setGeneratedDocUrl(res.docUrl);
    } catch (err: any) {
      console.error('Error creating Google Doc:', err);
      setErrorMsg(err.message || 'Error al comunicarse con Google Docs API');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="student-report-generator-modal"
        className={`w-full max-w-xl p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[90vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimaryClass}`}>
                Generador de Informe Individual
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Exportación académica oficial para {student.nombre}
              </p>
            </div>
          </div>
          <button
            id="btn-close-report-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Summary Preview Card */}
        <div className={`mt-5 p-4 rounded-xl border ${theme.surfaceClass} ${theme.borderClass}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {student.id}
              </span>
              <h4 className={`text-base font-bold ${theme.textPrimaryClass}`}>
                {student.nombre}
              </h4>
              <p className={`text-xs ${theme.textMutedClass}`}>
                {student.email || 'Sin correo asignado'}
              </p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
              student.estado === 'Aprobado' ? theme.badgeSuccessClass :
              student.estado === 'Regular' ? theme.badgeWarningClass : theme.badgeDangerClass
            }`}>
              {student.estado}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-[#0D1117] border border-slate-200/60 dark:border-[#30363D]">
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Promedio</p>
              <p className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0]">{student.promedioFinal} / 10</p>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-[#0D1117] border border-slate-200/60 dark:border-[#30363D]">
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Asistencia</p>
              <p className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0]">{student.asistencia}%</p>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-[#0D1117] border border-slate-200/60 dark:border-[#30363D]">
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Trabajo Clase</p>
              <p className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0]">{student.trabajoEnClase} / 10</p>
            </div>
          </div>

          {student.observaciones && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-[#30363D] text-xs">
              <span className="font-semibold text-slate-700 dark:text-[#C9D1D9]">Observación pedagógica: </span>
              <span className={theme.textSecondaryClass}>{student.observaciones}</span>
            </div>
          )}
        </div>

        {/* Action Options */}
        <div className="mt-6 space-y-3">
          <h5 className={`text-xs font-bold uppercase tracking-wider ${theme.textMutedClass}`}>
            Seleccionar Formato de Exportación (100% Local y Offline)
          </h5>

          {/* Option 1: Word Processor (LibreOffice Writer / AbiWord) */}
          <div className={`p-4 rounded-xl border border-indigo-500/30 ${theme.surfaceClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold ${theme.textPrimaryClass}`}>
                    Procesador de Texto (LibreOffice Writer / AbiWord)
                  </p>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                    antiX
                  </span>
                </div>
                <p className={`text-xs ${theme.textSecondaryClass}`}>
                  Documento editable con formato oficial, tablas de asistencia y membrete listo para editar en antiX.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadWordProcessor('doc')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                title="Abrir en LibreOffice Writer o Word"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Formato .DOC</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadWordProcessor('rtf')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#30363D] text-slate-700 dark:text-[#C9D1D9] hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
                title="Formato ligero universal para AbiWord"
              >
                <span>.RTF</span>
              </button>
            </div>
          </div>

          {/* Option 2: Download PDF Direct */}
          <div className={`p-4 rounded-xl border ${theme.borderClass} ${theme.cardBgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${theme.textPrimaryClass}`}>
                  Descargar Informe en PDF Oficial
                </p>
                <p className={`text-xs ${theme.textSecondaryClass}`}>
                  Genera una boleta formal en PDF con membrete institucional, gráfico de asistencia y campo de firmas.
                </p>
              </div>
            </div>

            <button
              id="btn-download-pdf-direct"
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>

          {/* Option 3: Google Docs (Optional only if user connects) */}
          {accessToken && (
            <div className={`p-4 rounded-xl border ${theme.borderClass} ${theme.cardBgClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${theme.textPrimaryClass}`}>
                    Google Docs en la Nube (Opcional)
                  </p>
                  <p className={`text-xs ${theme.textSecondaryClass}`}>
                    Guarda una copia en tu cuenta de Google Drive sincronizada.
                  </p>
                </div>
              </div>

              <button
                id="btn-export-google-doc"
                type="button"
                onClick={handleCreateGoogleDoc}
                disabled={isGeneratingDoc}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#30363D] text-slate-700 dark:text-[#C9D1D9] hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors disabled:opacity-50 shrink-0"
              >
                {isGeneratingDoc ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Subir a Docs</span>
                  </>
                )}
              </button>
            </div>
          )}

          {generatedDocUrl && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Documento de Google creado exitosamente en tu Drive!</span>
              </div>
              <a
                id="link-open-created-doc"
                href={generatedDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
              >
                <span>Abrir Google Doc</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#30363D] flex justify-end">
          <button
            id="btn-close-report-dialog"
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
