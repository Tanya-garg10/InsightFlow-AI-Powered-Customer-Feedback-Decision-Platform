import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'mixed' | 'violet' | 'blue' | 'mint' | 'coral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    default: 'bg-[#F8F9FF] text-[#77758F] border border-[#E2E0EF]',
    positive: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
    negative: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]',
    neutral: 'bg-[#F8F9FF] text-[#77758F] border border-[#E2E0EF]',
    mixed: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    violet: 'bg-[#EEE9FF] text-[#7357F6] border border-[rgba(115,87,246,0.2)]',
    blue: 'bg-[#EFF6FF] text-[#477DFF] border border-[rgba(71,125,255,0.2)]',
    mint: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
    coral: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const catMap: Record<string, string> = {
    'Product Feedback': 'violet',
    'Customer Service': 'blue',
    'Operational Issues': 'mint',
    'Fraud and Scam': 'coral'
  };

  const variant = catMap[category] || 'default';

  return (
    <Badge variant={variant} size="sm" className={className}>
      {category}
    </Badge>
  );
};

interface SentimentBadgeProps {
  sentiment: string;
  className?: string;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, className = '' }) => {
  const sentimentMap: Record<string, string> = {
    positive: 'positive',
    negative: 'negative',
    neutral: 'neutral',
    mixed: 'mixed',
    unassigned: 'default'
  };

  const variant = sentimentMap[sentiment] || 'default';

  return (
    <Badge variant={variant} size="sm" className={className}>
      {sentiment}
    </Badge>
  );
};

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const severityMap: Record<string, string> = {
    high: 'negative',
    medium: 'mixed',
    low: 'positive',
    unknown: 'default'
  };

  const variant = severityMap[severity] || 'default';

  return (
    <Badge variant={variant} size="sm" className={className}>
      {severity}
    </Badge>
  );
};
