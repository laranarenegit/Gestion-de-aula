import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="confirm-dialog-card"
        className={`w-full max-w-md p-6 rounded-xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} animate-in zoom-in-95 duration-150`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isDestructive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-semibold ${theme.textPrimaryClass}`}>
              {title}
            </h3>
          </div>
          <button
            id="btn-close-confirm-dialog"
            onClick={onCancel}
            className={`p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`mt-3 text-sm leading-relaxed ${theme.textSecondaryClass}`}>
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-dialog"
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 text-sm font-medium rounded-lg border ${theme.borderClass} ${theme.cardBgClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            {cancelText}
          </button>
          <button
            id="btn-confirm-action"
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
