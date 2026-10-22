import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const toastStyles = {
        success: { bg: 'rgba(5,150,105,0.95)', border: '#059669', text: '#D1FAE5' },
        error:   { bg: 'rgba(185,28,28,0.95)',  border: '#DC2626', text: '#FEE2E2' },
        warning: { bg: 'rgba(180,83,9,0.95)',   border: '#D97706', text: '#FEF3C7' },
        info:    { bg: 'var(--bg-card)',          border: 'var(--border)', text: 'var(--text-primary)' },
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map(toast => {
                    const s = toastStyles[toast.type] || toastStyles.info;
                    return (
                        <div key={toast.id}
                            className="flex items-start gap-3 p-4 rounded-xl shadow-xl"
                            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                            {toast.type === 'success' && <CheckCircle size={18} className="mt-0.5 shrink-0" />}
                            {toast.type === 'error'   && <XCircle size={18} className="mt-0.5 shrink-0" />}
                            {toast.type === 'warning' && <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                            {toast.type === 'info'    && <Info size={18} className="mt-0.5 shrink-0" />}
                            <span className="text-sm font-medium flex-1">{toast.message}</span>
                            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx.addToast;
};
