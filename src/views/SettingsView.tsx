import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Server,
  Code2
} from 'lucide-react';
import { DatasetMeta } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  datasets: DatasetMeta[];
  onResetDemo: () => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  datasets,
  onResetDemo,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const [analysisMode, setAnalysisMode] = useState<'prefer_adapted' | 'local_heuristic'>('prefer_adapted');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveMode = async (mode: 'prefer_adapted' | 'local_heuristic') => {
    setAnalysisMode(mode);
    await api.runAnalysis(mode);
    setSaveMsg('Analysis mode updated and pipeline re-executed successfully!');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Analysis Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure runtime pipelines, persistent database storage, and reset demo data.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Analysis Mode Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Inference Pipeline Configuration</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Choose how customer feedback records are analyzed.
        </p>

        <div className="space-y-3 text-xs">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="radio"
              name="analysisMode"
              checked={analysisMode === 'prefer_adapted'}
              onChange={() => handleSaveMode('prefer_adapted')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-semibold text-slate-900">
                Prefer Adaption Enriched Output (Recommended)
              </div>
              <p className="text-slate-500 mt-0.5">
                Matches reviews against the ingested Adaption dataset for validated JSON outputs; applies transparent local baseline for any records without a matched completion.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="radio"
              name="analysisMode"
              checked={analysisMode === 'local_heuristic'}
              onChange={() => handleSaveMode('local_heuristic')}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-semibold text-slate-900">
                Pure Local Transparent Baseline
              </div>
              <p className="text-slate-500 mt-0.5">
                Runs lightweight polarity and risk keyword evaluation on all records without requiring external model outputs or paid API credentials.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Persistent Storage Diagnostics */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Database & Ingested Datasets</h2>
        </div>
        <p className="text-xs text-slate-500">
          Currently mounted datasets in local persistent store:
        </p>

        <div className="divide-y divide-slate-100 text-xs">
          {datasets.map((d) => (
            <div key={d.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">{d.name}</div>
                <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                  File: {d.filename} · Type: {d.type}
                </div>
              </div>
              <div className="text-right font-mono text-slate-700">
                {d.total_rows} rows ({d.unique_reviews} unique)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Demo Data Card */}
      <div className="bg-white p-6 rounded-xl border border-rose-200/70 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-rose-700">
          <RotateCcw className="w-4 h-4" />
          <h2 className="text-sm font-bold">Reset Demo Data</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Restore the application to the baseline test datasets. This clears custom uploaded records, restores initial issue tracking states, and reinitializes default feedback samples.
        </p>

        <button
          onClick={onResetDemo}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Reset to Initial Demo State
        </button>
      </div>

      {/* Local Python FastAPI Instructions Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Code2 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold">Local Python FastAPI Execution Instructions</h2>
        </div>
        <p className="text-xs text-slate-500">
          Want to run the separate Python FastAPI + SQLite backend on your local terminal? Use:
        </p>
        <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
{`# 1. Start Python FastAPI backend
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# 2. Run Python Unit Tests
python3 -m pytest backend/test_main.py`}
        </pre>
      </div>
    </div>
  );
};
