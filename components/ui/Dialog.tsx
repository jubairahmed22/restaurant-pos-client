// components/ui/Dialog.tsx
export const Dialog = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};