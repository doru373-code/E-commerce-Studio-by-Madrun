
import React from 'react';
import { StyleOption } from '../types';

interface StyleCardProps {
  style: StyleOption;
  isSelected: boolean;
  onClick: () => void;
}

const StyleCard: React.FC<StyleCardProps> = ({ style, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer group overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500 h-64 ${
        isSelected ? 'border-indigo-600 ring-8 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <img 
        src={style.previewUrl} 
        alt={style.label}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <h3 className="font-extrabold text-2xl tracking-tight">{style.label}</h3>
        <p className="text-sm font-medium text-white/80 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">{style.description}</p>
      </div>
      {isSelected && (
        <div className="absolute top-6 right-6 bg-indigo-600 text-white rounded-full p-2 shadow-2xl">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default StyleCard;
