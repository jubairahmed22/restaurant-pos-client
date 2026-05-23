import React from 'react';
import { Star, Trash2 } from 'lucide-react';

interface CategoryCardProps {
  cat: {
    _id: string;
    title: string;
    image: string;
    options?: string;
    rating?: string;
  };
  onDelete: (id: string) => void;
}

const CategoryCard = ({ cat, onDelete }: CategoryCardProps) => {
  return (
    <div className="bg-white  p-5 border border-gray-200 rounded relative group shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-4">
        {/* Circular Image from Reference */}
        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-50 flex-shrink-0">
          <img 
            src={cat.image} 
            alt={cat.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2>
            {cat.title}
          </h2>
          {/* <p className="text-slate-400 font-bold text-xs mb-1">
            {cat.options || '16+ Options'}
          </p>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-orange-400 fill-orange-400" />
            <span className="text-slate-700 font-black text-sm">
              {cat.rating || '4.3/5'}
            </span>
          </div> */}
        </div>
      </div>
 asdfasd
      {/* Hover Action Button */}
      {/* <button 
        onClick={() => onDelete(cat._id)}
        className="absolute -top-2 -right-2 p-2 bg-rose-50 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-rose-100 hover:bg-rose-500 hover:text-white"
      >
        <Trash2 size={14} />
      </button> */}
    </div>
  );
};

export default CategoryCard;