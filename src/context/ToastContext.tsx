'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type ToastType = 'success' | 'error';

interface ToastOptions {
  message: string;
  type?: ToastType;
  link?: { label: string; href: string };
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
    setTimeout(() => setToast(null), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[10000] min-w-[320px]"
          >
            <div className="glass-card p-4 flex items-center gap-4 bg-[var(--success-teal)]/10 border-[var(--success-teal)]/20 shadow-[0_0_40px_rgba(20,184,166,0.1)]">
              <div className="w-10 h-10 rounded-full bg-[var(--success-teal)]/20 flex items-center justify-center text-[var(--success-teal)]">
                <CheckCircle2 size={24} />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{toast.message}</p>
                {toast.link && (
                  <Link 
                    href={toast.link.href}
                    className="text-[10px] uppercase tracking-widest font-bold text-[var(--success-teal)] hover:underline mt-1 flex items-center gap-1"
                  >
                    {toast.link.label} <ExternalLink size={10} />
                  </Link>
                )}
              </div>

              <button 
                onClick={() => setToast(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
