// components/dashboard/KpiCard.tsx
export const KpiCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6  flex items-center justify-between shadow-sm">
    <div className="space-y-1">
      <p className="text-[11px] font-black text-black uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-[#1B3A6B]">{value}</p>
    </div>
    <div className="w-12 h-12 bg-[#1B3A6B] text-white rounded-full flex items-center justify-center">
      <Icon size={24} />
    </div>
  </div>
);