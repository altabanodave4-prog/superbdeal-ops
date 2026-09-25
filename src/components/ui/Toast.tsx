import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

/** Quiet, dismissible status message — low fatigue for long shifts */
export function Toast() {
  const toastMessage = useAppStore((s) => s.toastMessage);
  const clearToast = useAppStore((s) => s.clearToast);

  useEffect(() => {
    if (!toastMessage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearToast();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] max-w-[min(92vw,22rem)] bg-slate-800 text-slate-50 text-[13px] font-medium px-3 py-2 rounded-lg shadow-md border border-slate-700/80 flex items-start gap-2"
    >
      <span className="flex-1 pt-0.5 leading-snug">{toastMessage}</span>
      <button
        type="button"
        onClick={clearToast}
        className="p-0.5 rounded text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-400"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" aria-hidden />
      </button>
    </div>
  );
}
