import React from 'react';
import {
  Search,
  Upload,
  RotateCcw,
  Sparkles,
  Database,
  Loader2,
  X,
  Command
} from 'lucide-react';
import { DatasetMeta } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  datasets: DatasetMeta[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onOpenUpload: () => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onResetDemo: () => void;
  feedbackTotal: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onOpenUpload,
  onRunAnalysis,
  isAnalyzing,
  onResetDemo,
  feedbackTotal,
}) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[rgba(115,87,246,0.12)] px-6 flex items-center justify-between shrink-0 no-print sticky top-0 z-50">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-[#A8A6BF] absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#7357F6] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews, evidence, or keywords..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#F5F4FC] border border-[rgba(115,87,246,0.12)] rounded-xl text-sm text-[#25243A] placeholder:text-[#A8A6BF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7357F6]/20 focus:border-[#7357F6] transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A6BF] hover:text-[#25243A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#A8A6BF] border border-[rgba(115,87,246,0.12)] rounded px-1.5 py-0.5">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Dataset Selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F4FC] rounded-xl border border-[rgba(115,87,246,0.12)]">
          <Database className="w-3.5 h-3.5 text-[#7357F6]" />
          <select
            value={selectedDatasetId}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="text-xs font-medium text-[#25243A] bg-transparent border-0 focus:outline-none cursor-pointer"
          >
            <option value="all">All Datasets ({feedbackTotal} rows)</option>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.total_rows} rows)
              </option>
            ))}
          </select>
        </div>

        {/* Upload Dataset Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#25243A] bg-white border border-[rgba(115,87,246,0.12)] hover:bg-[#F5F4FC] hover:border-[rgba(115,87,246,0.24)] rounded-xl transition-all duration-200"
        >
          <Upload className="w-3.5 h-3.5 text-[#77758F]" />
          <span>Upload CSV</span>
        </button>

        {/* Run Analysis Trigger */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl text-white transition-all duration-200 shadow-sm ${
            isAnalyzing
              ? 'bg-[#A8A6BF] cursor-not-allowed'
              : 'bg-gradient-to-r from-[#7357F6] to-[#477DFF] hover:shadow-md active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Analysis</span>
            </>
          )}
        </button>

        {/* Reset Demo Option */}
        <button
          onClick={onResetDemo}
          title="Reset to default test datasets"
          className="p-2 text-[#77758F] hover:text-[#25243A] hover:bg-[#F5F4FC] rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-[rgba(115,87,246,0.12)] mx-1" />

        {/* Team Avatar Mock */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7357F6] to-[#477DFF] border border-[rgba(115,87,246,0.12)] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            TA
          </div>
          <span className="text-xs text-[#25243A] font-medium hidden sm:inline">Team Lead</span>
        </div>
      </div>
    </header>
  );
};
