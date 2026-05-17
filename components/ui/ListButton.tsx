import React from 'react';

interface ListButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const ListButton = ({ label, isActive, onClick }: ListButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-bold transition-all duration-200 whitespace-nowrap
        ${isActive 
          ? 'text-slate-900' 
          : 'text-slate-500 hover:text-slate-700'
        }`}
    >
      {label}
      {/* The Underline Indicator seen in your screenshot */}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-black rounded-full animate-in fade-in slide-in-from-bottom-1" />
      )}
    </button>
  );
};