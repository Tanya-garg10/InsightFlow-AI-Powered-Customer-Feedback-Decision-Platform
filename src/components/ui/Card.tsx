import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const baseClass = 'if-card';
  const hoverClass = hover ? 'if-card-hover cursor-pointer' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClass} ${hoverClass} ${clickClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface GradientPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'hero' | 'subtle' | 'mint' | 'peach';
}

export const GradientPanel: React.FC<GradientPanelProps> = ({
  children,
  className = '',
  variant = 'hero'
}) => {
  const gradients = {
    hero: 'bg-gradient-to-br from-[#7357F6] to-[#477DFF]',
    subtle: 'bg-gradient-to-br from-[#EEE9FF] to-[#E8F0FF]',
    mint: 'bg-gradient-to-br from-[#BDF4DD] to-[#D1FAE5]',
    peach: 'bg-gradient-to-br from-[#FFE0D2] to-[#FEF3C7]'
  };

  return (
    <div className={`${gradients[variant]} ${className} rounded-2xl`}>
      {children}
    </div>
  );
};
