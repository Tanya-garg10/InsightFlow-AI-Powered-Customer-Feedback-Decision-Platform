import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'raw' | 'adaption'>('raw');
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file.');
      return;
    }

    setFile(selected);

    // Read first few lines for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0).slice(0, 5);
      const parsed = lines.map(line => line.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
      setPreviewRows(parsed);
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Please select a CSV file first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'raw') {
        const res = await api.uploadDataset(file);
        setSuccessMsg(`Successfully imported ${res.imported_rows} feedback rows (${res.unique_reviews} unique reviews)!`);
      } else {
        const res = await api.importAdaption(file);
        setSuccessMsg(`Imported Adaption dataset: ${res.valid_json_count} valid JSON completions parsed (${res.valid_json_percentage}% valid)!`);
      }
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleTemplate = () => {
    let content = '';
    let filename = '';
    if (activeTab === 'raw') {
      content = 'review,category\n"The product works great and has improved my productivity.",Product Feedback\n"Support team was responsive and solved my issue within minutes.",Customer Service\n"The delivery was delayed by a week.",Operational Issues\n"I was charged twice for a single order.",Fraud and Scam';
      filename = 'insightflow_sample_feedback_template.csv';
    } else {
      content = 'review,enhanced_prompt,enhanced_completion,category,original_context\n"The product design is sleek and modern.",,"```json\n{\n  ""sentiment"": ""positive"",\n  ""issue_summary"": ""Customer loves sleek design"",\n  ""key_topics"": [""Design"", ""Usability""],\n  ""severity"": ""low"",\n  ""recommended_action"": ""Highlight in marketing"",\n  ""evidence"": ""sleek and modern""\n}\n```",Product Feedback,Product Feedback';
      filename = 'insightflow_sample_adaption_template.csv';
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Upload Dataset</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-1 mx-6 mt-4 bg-slate-100 rounded-lg flex items-center gap-1">
          <button
            onClick={() => { setActiveTab('raw'); setFile(null); setPreviewRows([]); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'raw'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raw Feedback Dataset (review, category)
          </button>
          <button
            onClick={() => { setActiveTab('adaption'); setFile(null); setPreviewRows([]); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'adaption'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adaption Output (enhanced_completion)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeTab === 'raw'
              ? 'Upload a CSV containing customer reviews and categories. Requires at least a "review" column.'
              : 'Upload the adapted CSV exported from Adaption containing generated JSON completions. Evaluates validation and parsing stats.'}
          </p>

          {/* Drag & drop upload box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            {file ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700">Click or drag a CSV file here</p>
                <p className="text-xs text-slate-400 mt-1">Accepts UTF-8 formatted CSV files up to 25MB</p>
              </div>
            )}
          </div>

          {/* Sample template trigger */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Need a template to test with?</span>
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sample CSV</span>
            </button>
          </div>

          {/* Preview rows */}
          {previewRows.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs font-mono overflow-x-auto max-h-36">
              <div className="text-[10px] text-slate-400 uppercase font-sans mb-1 font-semibold">Header & Preview Sample:</div>
              {previewRows.map((row, i) => (
                <div key={i} className="text-slate-700 truncate py-0.5 border-b border-slate-100 last:border-0">
                  {row.slice(0, 4).join(' | ')}
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isSubmitting}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 ${
              !file || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing CSV...</span>
              </>
            ) : (
              <span>Import Dataset</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
