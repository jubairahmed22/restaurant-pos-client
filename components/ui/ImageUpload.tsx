// components/ui/ImageUpload.tsx
import { UploadCloud } from 'lucide-react';

export const ImageUpload = ({ label }: { label: string }) => (
  <div className="space-y-2">
    <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">{label}</p>
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud size={24} />
      </div>
      <p className="text-lg font-bold text-slate-700">
        Drop your images here, or <span className="text-indigo-600">click to browse</span>
      </p>
      <p className="text-xs text-slate-400 mt-2">1600 x 1200 (4:3) recommended. PNG, JPG and GIF allowed</p>
    </div>
  </div>
);