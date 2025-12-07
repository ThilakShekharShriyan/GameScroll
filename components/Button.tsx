import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-3 rounded-lg font-bold transition-all duration-200 active:scale-95 flex items-center justify-center";
  
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    danger: "bg-red-500 hover:bg-red-400 text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
           <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Processing...
        </span>
      ) : children}
    </button>
  );
};
