import { ShoppingCart } from "lucide-react";

// Standard Food Card (Best Seller)
export const FoodCard = ({ item }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative group">
    <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">Best Seller</span>
    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50">
      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
    </div>
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-black text-slate-800">{item.name}</h3>
      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
        <span className="text-orange-400 text-xs">★</span>
        <span className="text-[10px] font-bold text-slate-600">{item.rating}/5</span>
      </div>
    </div>
    <p className="text-xs text-slate-400 font-bold mb-4">{item.size}</p>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-indigo-500 uppercase">Regular Price</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-800">${item.price}</span>
          <span className="text-xs text-slate-400 line-through">${item.oldPrice}</span>
        </div>
      </div>
      <button className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
        <ShoppingCart size={20} />
      </button>
    </div>
  </div>
);

// POS Horizontal Small Card
export const FoodCardPos = ({ item }: any) => (
  <div className="bg-white border border-slate-100 p-3 rounded-xl flex gap-4 items-center relative">
    <div className="w-16 h-16 rounded-lg overflow-hidden bg-orange-50">
      <img src={item.image} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
      <p className="text-slate-500 font-bold text-sm">${item.price}</p>
      <button className="text-[10px] font-bold text-slate-400 underline decoration-slate-200">View Details ↗</button>
    </div>
    <span className="text-indigo-600 font-black absolute right-4 top-4">#{item.id}</span>
    <p className="text-[10px] text-slate-400 font-bold absolute right-4 bottom-4">Orders: {item.orders}x</p>
  </div>
);