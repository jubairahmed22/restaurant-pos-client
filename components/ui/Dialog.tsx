'use client';

import React, { createContext, useContext, useEffect } from 'react';

/* =========================
   Context
========================= */

type DialogContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog components must be used inside <Dialog>');
  }
  return ctx;
};

/* =========================
   Main Dialog
========================= */

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <div
          className="bg-white rounded w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

/* =========================
   DialogContent
========================= */

export const DialogContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="p-6">{children}</div>;
};

/* =========================
   DialogHeader
========================= */

export const DialogHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setOpen } = useDialog();

  return (
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      {children}

      {/* optional close button support */}
      <button
        onClick={() => setOpen(false)}
        className="text-slate-400 hover:text-slate-600 text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
};

/* =========================
   DialogTitle
========================= */

export const DialogTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h3 className="font-black text-slate-800 uppercase tracking-tight">
      {children}
    </h3>
  );
};