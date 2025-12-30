import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Apagar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 px-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel} />
      
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${
            variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
          }`}>
            <AlertCircle size={32} />
          </div>
          
          <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-neutral-100 dark:border-neutral-800">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-r border-neutral-100 dark:border-neutral-800"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-colors ${
              variant === 'danger' 
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' 
                : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};