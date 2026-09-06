import React from 'react';
import { 
  FileSpreadsheet, 
  FolderCheck, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { WorkspaceSyncState } from '../types';

interface GoogleSyncBarProps {
  syncState: WorkspaceSyncState;
  onSync: () => void;
  onLogin: () => void;
}

export const GoogleSyncBar: React.FC<GoogleSyncBarProps> = ({
  syncState,
  onSync,
  onLogin,
}) => {
  const { theme } = useTheme();

  return (
    <div 
      id="google-sync-status-bar"
      className={`w-full p-4 mb-6 rounded-xl border ${theme.cardBgClass} ${theme.borderClass} shadow-xs transition-colors`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Status Information */}
        <div className="flex items-start md:items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            syncState.isConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
          }`}>
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${theme.textPrimaryClass}`}>
                Base de Datos Google Sheets:
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-[#0D1117] dark:text-[#C9D1D9] dark:border dark:border-[#30363D]">
                {syncState.spreadsheetName}
              </span>
              {syncState.isConnected ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado a Drive
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Modo Local (Pendiente vincular Google)
                </span>
              )}
            </div>

            <p className={`text-xs mt-0.5 ${theme.textSecondaryClass}`}>
              {syncState.isConnected ? (
                <>
                  Pestañas activas: <span className={`font-medium ${theme.textPrimaryClass}`}>Estudiantes</span> y <span className={`font-medium ${theme.textPrimaryClass}`}>Bitacora</span>.
                  {syncState.lastSyncTime && ` Sincronizado: ${syncState.lastSyncTime}.`}
                </>
              ) : (
                'Inicia sesión con Google para sincronizar automáticamente esta planilla y guardar informes en tu Google Drive.'
              )}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {syncState.isConnected ? (
            <>
              {syncState.spreadsheetUrl && (
                <a
                  id="btn-open-google-sheet"
                  href={syncState.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${theme.borderClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abrir Planilla</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {syncState.folderUrl && (
                <a
                  id="btn-open-drive-folder"
                  href={syncState.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${theme.borderClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
                >
                  <FolderCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Carpeta Informes</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              <button
                id="btn-sync-now"
                type="button"
                onClick={onSync}
                disabled={syncState.isSyncing}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white ${theme.accentClass} transition-colors disabled:opacity-50`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncState.isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
              </button>
            </>
          ) : (
            <button
              id="btn-connect-google-sync"
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google Workspace</span>
            </button>
          )}
        </div>
      </div>

      {syncState.error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{syncState.error}</span>
        </div>
      )}
    </div>
  );
};
