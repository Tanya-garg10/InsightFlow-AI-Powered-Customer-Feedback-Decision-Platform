import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { IssueItem } from '../types';
import { api } from '../services/api';

interface IssueTrackerViewProps {
  initialIssues: IssueItem[];
  onRefreshIssues: () => void;
}

export const IssueTrackerView: React.FC<IssueTrackerViewProps> = ({
  initialIssues,
  onRefreshIssues,
}) => {
  const [issues, setIssues] = useState<IssueItem[]>(initialIssues);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingIssue, setEditingIssue] = useState<IssueItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Issue Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Product Feedback');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newAction, setNewAction] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    setIssues(initialIssues);
  }, [initialIssues]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await api.getIssues({
        status: statusFilter,
        search,
      });
      setIssues(res.issues);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIssues();
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.createIssue({
        title: newTitle,
        category: newCategory,
        severity: newSeverity as any,
        suggested_action: newAction,
        assigned_to: newAssignee || 'Unassigned',
        notes: newNotes,
      });
      setIsCreating(false);
      setNewTitle('');
      setNewAction('');
      setNewNotes('');
      onRefreshIssues();
      loadIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to create issue');
    }
  };

  const handleUpdateIssue = async (id: string, updates: Partial<IssueItem>) => {
    try {
      await api.updateIssue(id, updates);
      setEditingIssue(null);
      onRefreshIssues();
      loadIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to update issue');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'In Progress':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      default:
        return 'text-slate-700 bg-slate-100 border border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Internal team workflow tracker for feedback issues, assignments, and status triage.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Tracked Issue</span>
        </button>
      </div>

      {/* Honesty Disclaimer Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Transparency Notice:</strong> Statuses displayed below represent our <em>team's recorded operational progress</em>. Marking an issue as "Resolved" means team remediation was executed; it does not claim customer sentiment is verified as resolved without follow-up customer confirmation.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracked issues or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          {['all', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Tracked Team Issue</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Checkout cart crashing on mobile"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="Product Feedback">Product Feedback</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Operational Issues">Operational Issues</option>
                    <option value="Fraud and Scam">Fraud and Scam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assigned Team Member</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="e.g., Engineering Team, QA Lead"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Proposed Corrective Action</label>
                <textarea
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  rows={2}
                  placeholder="What step will the team take?"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Internal Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional context or links..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-md font-medium"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4 w-32">Category</th>
                <th className="py-3 px-4 w-28">Severity</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-36">Assignee</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No issues recorded in tracker matching filter.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900">{issue.title}</div>
                      {issue.suggested_action && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          Action: {issue.suggested_action}
                        </p>
                      )}
                      {issue.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 italic line-clamp-1">
                          Notes: {issue.notes}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Updated: {new Date(issue.updated_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {issue.category}
                    </td>

                    <td className="py-3.5 px-4 capitalize">
                      <span className={`font-semibold ${
                        issue.severity === 'high' ? 'text-rose-600' : issue.severity === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={issue.status}
                        onChange={(e) => handleUpdateIssue(issue.id, { status: e.target.value as any })}
                        className={`text-xs font-medium px-2 py-1 rounded cursor-pointer ${getStatusBadge(issue.status)}`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{issue.assigned_to || 'Unassigned'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingIssue(issue)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        Edit Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Issue Modal */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Issue Details</h3>
              <button onClick={() => setEditingIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Issue Title</label>
                <input
                  type="text"
                  value={editingIssue.title}
                  disabled
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Status</label>
                <select
                  value={editingIssue.status}
                  onChange={(e) => setEditingIssue({ ...editingIssue, status: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assignee</label>
                <input
                  type="text"
                  value={editingIssue.assigned_to || ''}
                  onChange={(e) => setEditingIssue({ ...editingIssue, assigned_to: e.target.value })}
                  placeholder="Assigned team member"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Notes</label>
                <textarea
                  value={editingIssue.notes || ''}
                  onChange={(e) => setEditingIssue({ ...editingIssue, notes: e.target.value })}
                  rows={3}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingIssue(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateIssue(editingIssue.id, {
                    status: editingIssue.status,
                    assigned_to: editingIssue.assigned_to,
                    notes: editingIssue.notes,
                  })}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-md font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
