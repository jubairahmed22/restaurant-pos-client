import React from 'react';

export const ListButtonWhite = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-4 text-sm font-bold transition-all duration-200 whitespace-nowrap
        ${isActive 
          ? 'text-white' 
          : 'text-white/70 hover:text-white/70'
        }
      `}
    >
      {label}
      
      {/* The thick underline indicator from your image */}
      {isActive && (
        <span 
          className="absolute bottom-0 left-0 w-full h-[4px] bg-white rounded-t-full shadow-[0_-4px_10px_rgba(255,255,255,0.3)]" 
        />
      )}
    </button>
  );
};