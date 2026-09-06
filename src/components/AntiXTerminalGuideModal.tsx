import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  FileSpreadsheet, 
  FileText, 
  HardDrive, 
  Play, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AntiXTerminalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AntiXTerminalGuideModal: React.FC<AntiXTerminalGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cmdStep1 = `sudo apt update && sudo apt install -y nodejs npm git libreoffice-calc libreoffice-writer`;
  const cmdStep2 = `cd ~/gestion-estudiantes
npm install --no-audit`;
  const cmdStep3 = `./iniciar-antix.sh`;
  const cmdStep4 = `# Modo Producción de Bajo Consumo (< 25MB de RAM):
npm run build
npx serve dist -p 3000
# O con el servidor nativo de Python 3:
# cd dist && python3 -m http.server 3000`;
  const cmdStep5 = `# Crear acceso directo en el escritorio de antiX:
cp gestion-estudiantes.desktop ~/Desktop/
chmod +x ~/Desktop/gestion-estudiantes.desktop`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="antix-terminal-guide-card"
        className={`w-full max-w-3xl p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[92vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${theme.textPrimaryClass}`}>
                  Instalación y Ejecución Local en antiX Linux
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Offline • Sin Google Drive
                </span>
              </div>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Comandos de terminal paso a paso para sistemas ligeros, planillas Calc y procesador de texto
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlights Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-[#E2E8F0]">Ultra Ligero</p>
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Consumo &lt; 30 MB de RAM</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-[#E2E8F0]">Planillas .ODS / .XLSX</p>
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Para LibreOffice Calc / Gnumeric</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-[#E2E8F0]">Informes .DOC / .RTF</p>
              <p className="text-[11px] text-slate-500 dark:text-[#8B949E]">Para LibreOffice Writer / AbiWord</p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Commands */}
        <div className="mt-5 space-y-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0]">
                  Instalar Node.js y utilidades en antiX Linux
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cmdStep1, 'step1')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step1' ? 'Copiado' : 'Copiar comando'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8B949E] mb-2">
              Abre una terminal (<kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ROXTerm</kbd> o <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl + Alt + T</kbd>) y ejecuta:
            </p>
            <pre className="p-2.5 rounded-lg bg-[#161B22] text-emerald-300 text-xs font-mono overflow-x-auto border border-[#30363D]">
              {cmdStep1}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0]">
                  Instalar dependencias locales del proyecto
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cmdStep2, 'step2')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step2' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8B949E] mb-2">
              Ingresa a la carpeta del proyecto y ejecuta una sola vez:
            </p>
            <pre className="p-2.5 rounded-lg bg-[#161B22] text-slate-200 text-xs font-mono overflow-x-auto border border-[#30363D]">
              {cmdStep2}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0]">
                  Iniciar el sistema con el script de 1 clic
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cmdStep3, 'step3')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step3' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8B949E] mb-2">
              Inicia el servidor local y abre automáticamente tu navegador (Firefox-ESR / SeaMonkey) en <code className="text-indigo-400 font-mono">http://localhost:3000</code>:
            </p>
            <pre className="p-2.5 rounded-lg bg-[#161B22] text-amber-300 text-xs font-mono overflow-x-auto border border-[#30363D]">
              {cmdStep3}
            </pre>
          </div>

          {/* Step 4: Desktop shortcut */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0]">
                  Crear Acceso Directo en el Escritorio IceWM / Fluxbox
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cmdStep5, 'step5')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                {copiedKey === 'step5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step5' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-[#161B22] text-slate-300 text-xs font-mono overflow-x-auto border border-[#30363D]">
              {cmdStep5}
            </pre>
          </div>

          {/* Ultra Low RAM Mode */}
          <div className="p-4 rounded-xl border border-indigo-500/40 dark:bg-[#161B22]/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0]">
                  Modo Producción Ultra-Ligero (Netbooks o PCs de 512MB / 1GB RAM)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cmdStep4, 'step4')}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
              >
                {copiedKey === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'step4' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8B949E] mb-2">
              Compilar la app una sola vez en archivos estáticos HTML/JS y servirlos con consumo de memoria mínimo:
            </p>
            <pre className="p-2.5 rounded-lg bg-[#0D1117] text-indigo-300 text-xs font-mono overflow-x-auto border border-[#30363D]">
              {cmdStep4}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tus datos se guardan localmente en el navegador y puedes exportar a Calc en cualquier momento.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
