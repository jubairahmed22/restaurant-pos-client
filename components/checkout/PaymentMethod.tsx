export const PaymentSelector = ({ isActive, icon: Icon, label }: any) => (
  <div className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive ? 'border-emerald-500 bg-white' : 'border-slate-100 bg-white'}`}>
    <div className="flex items-center gap-3">
      <Icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
      <span className="font-bold text-slate-800">{label}</span>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-emerald-500' : 'border-slate-200'}`}>
      {isActive && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
    </div>
  </div>
);

export const OrderSummaryItem = ({ label, value, isTotal = false }: any) => (
  <div className={`flex justify-between items-center py-3 border-b border-slate-50 ${isTotal ? 'mt-2' : ''}`}>
    <span className={`font-bold ${isTotal ? 'text-[#FF4B55] text-lg' : 'text-slate-400'}`}>{label} :</span>
    <span className={`font-black ${isTotal ? 'text-emerald-500 text-xl' : 'text-[#1E2661]'}`}>${value}</span>
  </div>
);