// components/ui/Button.tsx
export const Button = ({ variant = 'primary', icon: Icon, children, ...props }: any) => {
  const styles: any = {
    primary: 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700',
    outline: 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white border-transparent hover:bg-rose-600',
  };

  return (
    <button {...props} className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all border ${styles[variant]} disabled:opacity-50`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// components/ui/Pagination.tsx
export const Pagination = () => (
  <div className="flex items-center gap-2">
    <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50">{'<'}</button>
    <button className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg font-bold">1</button>
    <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">2</button>
    <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">3</button>
    <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50">{'>'}</button>
  </div>
);