
import React from 'react';
import { Language, translations } from '../translations';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  lang?: Language;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  lang = 'en',
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-10 py-6 rounded-3xl font-bold text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 tracking-tight";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0",
    secondary: "bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0",
    outline: "bg-transparent border-4 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  const t = translations[lang];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-7 w-7 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t.studio.generating}
        </>
      ) : children}
    </button>
  );
};

export default Button;
