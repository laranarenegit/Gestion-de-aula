import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Terminal, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  HardDrive,
  RefreshCw,
  ChevronDown,
  FileDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Student, ClassSession } from '../types';
import { 
  exportDatabaseToSpreadsheet, 
  importSpreadsheetToDatabase, 
  downloadSpreadsheetTemplate,
  SpreadsheetFormat 
} from '../services/spreadsheetService';

interface LocalDatabaseBarProps {
  students: Student[];
  classSessions: ClassSession[];
  onImportStudents: (importedStudents: Student[]) => void;
  onOpenTerminalGuide: () => void;
  onResetToInitial: () => void;
}

export const LocalDatabaseBar: React.FC<LocalDatabaseBarProps> = ({
  students,
  classSessions,
  onImportStudents,
  onOpenTerminalGuide,
  onResetToInitial,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleExport = (format: SpreadsheetFormat) => {
    try {
      exportDatabaseToSpreadsheet(students, classSessions, format);
      setIsExportMenuOpen(false);
      setImportStatus({
        type: 'success',
        message: `Planilla .${format.toUpperCase()} generada con éxito para LibreOffice Calc / Excel.`,
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 4000);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Error al exportar: ${err.message}`,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'loading', message: `Leyendo planilla "${file.name}"...` });

    try {
      const result = await importSpreadsheetToDatabase(file);
      if (result.students && result.students.length > 0) {
        onImportStudents(result.students);
        setImportStatus({
          type: 'success',
          message: result.message,
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Error al procesar la planilla seleccionada.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    }
  };

  return (
    <div 
      id="local-database-bar"
      className={`border-b ${theme.borderClass} ${theme.cardBgClass} transition-colors px-4 py-2.5 shadow-xs`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: antiX Local Mode & Persistence Indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* antiX badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🐧 antiX Linux • 100% Local y Autónomo</span>
          </div>

          {/* Database indicator */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#C9D1D9]">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Base de Datos Local activa: <strong>{students.length} estudiantes</strong>, <strong>{classSessions.length} clases</strong>
            </span>
          </div>

          <span className="hidden lg:inline-block text-slate-400 dark:text-[#8B949E]">•</span>
          <span className="hidden lg:inline-block text-[11px] text-slate-500 dark:text-[#8B949E]">
            Sin vinculación a Google Drive ni consumo de nube
          </span>
        </div>

        {/* Right: Spreadsheet Controls & Terminal Guide */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden File Input for Spreadsheet Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ods,.xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Import Spreadsheet Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Importar planilla .ods (LibreOffice Calc), .xlsx o .csv"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#30363D] text-slate-700 dark:text-[#C9D1D9] hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Importar Planilla (.ods / .xlsx)</span>
          </button>

          {/* Export Spreadsheet Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Planilla</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {isExportMenuOpen && (
              <div 
                className={`absolute right-0 mt-1 w-64 rounded-xl shadow-xl border ${theme.borderClass} ${theme.surfaceClass} z-40 p-1.5 animate-in fade-in duration-100`}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-200 dark:border-[#30363D] mb-1">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-[#E2E8F0]">Descargar Base de Datos</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#8B949E]">Selecciona el formato para tu planilla</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExport('ods')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-[#E2E8F0]">LibreOffice Calc (.ODS)</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#8B949E]">Nativo de antiX Linux / LibreOffice</p>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('xlsx')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] flex items-center justify-between group mt-1"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-[#E2E8F0]">Microsoft Excel (.XLSX)</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#8B949E]">Compatible universal</p>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] flex items-center justify-between group mt-1"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-[#E2E8F0]">Texto Plano CSV (.CSV)</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#8B949E]">Ultra-ligero universal</p>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                </button>

                <div className="pt-1 mt-1 border-t border-slate-200 dark:border-[#30363D]">
                  <button
                    type="button"
                    onClick={() => {
                      downloadSpreadsheetTemplate('ods');
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-[#8B949E]"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>Descargar Plantilla en Blanco (.ods)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Installation Guide Button */}
          <button
            type="button"
            onClick={onOpenTerminalGuide}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Guía Terminal antiX</span>
          </button>
        </div>
      </div>

      {/* Notification Toast for Import/Export */}
      {importStatus.type && (
        <div className="max-w-7xl mx-auto mt-2 animate-in fade-in slide-in-from-top-1">
          <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : importStatus.type === 'error'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
          }`}>
            {importStatus.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            {importStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {importStatus.type === 'loading' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
            <span>{importStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
