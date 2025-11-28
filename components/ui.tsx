import React from 'react';
import { Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- Card ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  let colorClass = "bg-gray-100 text-gray-800";
  let label = status;
  
  if (!status) return null;

  // Translation mapping
  switch (status.toUpperCase()) {
    case 'VERIFIED':
      colorClass = "bg-green-100 text-green-800";
      label = "已认证";
      break;
    case 'ACTIVE':
      colorClass = "bg-indigo-100 text-indigo-800";
      label = "进行中";
      break;
    case 'PENDING':
      colorClass = "bg-yellow-100 text-yellow-800";
      label = "审核中";
      break;
    case 'REJECTED':
      colorClass = "bg-red-100 text-red-800";
      label = "已驳回";
      break;
    case 'CLOSED':
      colorClass = "bg-gray-100 text-gray-600";
      label = "已结束";
      break;
    case 'BUILDING_ADMIN':
      colorClass = "bg-purple-100 text-purple-800";
      label = "楼栋管家";
      break;
    case 'SUPER_ADMIN':
      colorClass = "bg-indigo-100 text-indigo-800";
      label = "管理员";
      break;
    case 'OWNER':
      colorClass = "bg-blue-100 text-blue-800";
      label = "业主";
      break;
    case 'VOTED':
      colorClass = "bg-green-100 text-green-800";
      label = "已投票";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Progress Bar ---
export const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = '' }) => {
  const percentage = Math.round((value / max) * 100) || 0;
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};