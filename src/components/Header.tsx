import React from 'react';
import {
  Search,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews, evidence, or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Dataset Selector */}
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDatasetId}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border-0 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Upload CSV</span>
        </button>

        {/* Run Analysis Trigger */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white transition-all shadow-xs cursor-pointer ${
            isAnalyzing
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
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
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Team Avatar Mock */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs">
            TA
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Team Lead</span>
        </div>
      </div>
    </header>
  );
};
