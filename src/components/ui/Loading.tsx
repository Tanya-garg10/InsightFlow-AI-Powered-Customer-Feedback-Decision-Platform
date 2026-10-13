import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-[#7357F6]`} />
      {message && <span className="text-sm text-[#77758F]">{message}</span>}
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading InsightFlow platform data...'
}) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7357F6]/10 to-[#477DFF]/10 border border-[rgba(115,87,246,0.12)] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-[#7357F6]" />
        </div>
        <Loading message={message} size="md" />
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect'
}) => {
  const variants = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full'
  };

  return (
    <div className={`shimmer ${variants[variant]} ${className}`} />
  );
};
