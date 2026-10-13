import React from 'react';
import { FileText, Sparkles, Inbox, Upload } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7357F6]/10 to-[#477DFF]/10 border border-[rgba(115,87,246,0.12)] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#25243A] mb-2">{title}</h3>
      <p className="text-sm text-[#77758F] max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7357F6] text-white rounded-lg text-sm font-medium hover:bg-[#6B4FE6] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export const NoDataEmpty: React.FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <EmptyState
    icon={<Inbox className="w-8 h-8 text-[#77758F]" />}
    title="No data available"
    description="Upload a CSV file to get started with analyzing customer feedback."
    action={onUpload ? { label: 'Upload CSV', onClick: onUpload } : undefined}
  />
);

export const NoAnalysisEmpty: React.FC<{ onRunAnalysis?: () => void }> = ({ onRunAnalysis }) => (
  <EmptyState
    icon={<Sparkles className="w-8 h-8 text-[#7357F6]" />}
    title="No analysis available"
    description="Run the analysis pipeline to generate insights from your feedback data."
    action={onRunAnalysis ? { label: 'Run Analysis', onClick: onRunAnalysis } : undefined}
  />
);

export const NoFeedbackEmpty: React.FC<{ onUpload?: () => void }> = ({ onUpload }) => (
  <EmptyState
    icon={<FileText className="w-8 h-8 text-[#77758F]" />}
    title="No feedback records"
    description="Upload customer feedback data to explore and analyze reviews."
    action={onUpload ? { label: 'Upload Feedback', onClick: onUpload } : undefined}
  />
);
