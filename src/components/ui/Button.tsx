import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-[#7357F6] text-white hover:bg-[#6B4FE6] active:scale-[0.98] shadow-sm',
    secondary: 'bg-white text-[#25243A] border border-[rgba(115,87,246,0.12)] hover:bg-[#F5F4FC] hover:border-[rgba(115,87,246,0.24)]',
    ghost: 'bg-transparent text-[#77758F] hover:bg-[#F5F4FC] hover:text-[#25243A]',
    danger: 'bg-[#E11D48] text-white hover:bg-[#BE123C] active:scale-[0.98] shadow-sm'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  disabled = false
}) => {
  const variants = {
    default: 'text-[#77758F] hover:bg-[#F5F4FC] hover:text-[#25243A]',
    primary: 'text-[#7357F6] hover:bg-[#EEE9FF]',
    danger: 'text-[#E11D48] hover:bg-[#FFF1F2]'
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
    </button>
  );
};
