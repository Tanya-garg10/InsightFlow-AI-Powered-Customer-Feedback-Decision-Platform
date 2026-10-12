import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, ShieldAlert, CheckCircle, Edit3, Save, ExternalLink } from 'lucide-react';
import { FeedbackItem, SentimentType, SeverityType } from '../types';

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  onSaveOverride: (id: string, updates: Partial<FeedbackItem>) => Promise<void>;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  item,
  onClose,
  onSaveOverride,
}) => {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentType>(item.sentiment || 'neutral');
  const [severity, setSeverity] = useState<SeverityType>(item.severity || 'low');
  const [action, setAction] = useState(item.recommended_action || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveOverride(item.id, {
        sentiment,
        severity,
        recommended_action: action,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getSentimentDot = (s?: string) => {
    switch (s) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-500';
      case 'negative':
        return 'text-rose-600 bg-rose-500';
      case 'mixed':
        return 'text-amber-600 bg-amber-500';
      default:
        return 'text-slate-600 bg-slate-400';
    }
  };

  const getSeverityColor = (sev?: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-700 font-semibold';
      case 'medium':
        return 'text-amber-700 font-medium';
      case 'low':
        return 'text-emerald-700 font-medium';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-slate-400">{item.id}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700">{item.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] text-slate-400">
              Provenance: {item.provenance === 'adapted_dataset' ? 'Adaption Test Run' : item.provenance === 'manual_override' ? 'Manual Override' : 'Transparent Baseline'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Review Text Block */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Original Customer Review
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/70 text-slate-900 text-sm leading-relaxed font-sans">
              "{item.review}"
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Preserved exact verbatim review without modification.
            </div>
          </div>

          {/* AI Inferred Insights Box */}
          <div className="border border-indigo-100 bg-indigo-50/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Analysis Details (AI-Inferred)
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Correct Labels'}</span>
              </button>
            </div>

            {/* Inferred attributes */}
            {!isEditing ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Inferred Sentiment</div>
                  <div className="flex items-center gap-1.5 font-medium capitalize">
                    <span className={`w-2 h-2 rounded-full ${getSentimentDot(item.sentiment)}`} />
                    <span className={getSentimentDot(item.sentiment).split(' ')[0]}>{item.sentiment || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Inferred Severity</div>
                  <div className={`capitalize ${getSeverityColor(item.severity)}`}>
                    {item.severity || 'Unknown'}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-400 mb-1">Issue Summary</div>
                  <div className="text-slate-800 text-xs">
                    {item.issue_summary || 'No summary available.'}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-400 mb-1">Key Topics</div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    {item.key_topics && item.key_topics.length > 0 ? (
                      item.key_topics.map((t, idx) => (
                        <React.Fragment key={idx}>
                          <span>{t}</span>
                          {idx < item.key_topics!.length - 1 && <span aria-hidden="true" className="text-slate-300">·</span>}
                        </React.Fragment>
                      ))
                    ) : (
                      <span>General</span>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-400 mb-1">Supporting Evidence Snippet</div>
                  <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded border border-slate-200/60 font-mono">
                    "{item.evidence || item.review}"
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-slate-400 mb-1">Suggested Team Action</div>
                  <div className="text-xs text-slate-800 bg-white/80 p-2.5 rounded border border-slate-200/60">
                    {item.recommended_action || 'No action specified.'}
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Edit Mode */
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Override Sentiment
                    </label>
                    <select
                      value={sentiment}
                      onChange={(e) => setSentiment(e.target.value as SentimentType)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Override Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as SeverityType)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Custom Action Note
                  </label>
                  <textarea
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Provide customized recommendation..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Override'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ethical & Methodology Caveat */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Ethical Notice:</strong> Inferred sentiment and severity are heuristic signals generated either by Adaption test output or lightweight local heuristics. Customer fraud allegations are unverified statements and require formal transaction investigation.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-400">
          <span>Added: {new Date(item.created_at).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
