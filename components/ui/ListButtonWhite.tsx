import React from 'react';

interface ListButtonWhiteProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string; // Kept to support the extra classes passed by FoodGridMenu
}

export const ListButtonWhite = ({ label, isActive, onClick, className = '' }: ListButtonWhiteProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative pb-2 font-sans font-bold uppercase tracking-wider text-xs transition-all duration-300 whitespace-nowrap cursor-pointer select-none outline-none
        ${isActive 
          ? 'text-[#1B3A6B]' 
          : 'text-slate-400 hover:text-[#1B3A6B]/80'
        }
        ${className}
      `}
    >
      <span>{label}</span>
      
      {/* Premium Deep Blue underline indicator */}
      <span 
        className={`
          absolute bottom-0 left-0 h-[3px] bg-[#1B3A6B] rounded-full transition-all duration-300
          ${isActive 
            ? 'w-full opacity-100 shadow-[0_-2px_8px_rgba(27,58,107,0.2)]' 
            : 'w-0 opacity-0'
          }
        `}
      />
    </button>
  );
};