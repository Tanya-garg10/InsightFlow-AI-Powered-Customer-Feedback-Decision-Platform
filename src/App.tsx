import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import { UploadModal } from './components/UploadModal';
import { OverviewView } from './views/OverviewView';
import { FeedbackExplorerView } from './views/FeedbackExplorerView';
import { AIInsightsView } from './views/AIInsightsView';
import { PrioritizationView } from './views/PrioritizationView';
import { RecommendationsView } from './views/RecommendationsView';
import { IssueTrackerView } from './views/IssueTrackerView';
import { ReportsView } from './views/ReportsView';
import { AdaptionLabView } from './views/AdaptionLabView';
import { SettingsView } from './views/SettingsView';

import {
  FeedbackItem,
  IssueItem,
  RecommendationItem,
  DatasetMeta,
  OverviewAnalytics
} from './types';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [analytics, setAnalytics] = useState<OverviewAnalytics | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState('all');

  // Modals
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load core application data
  const loadData = async () => {
    try {
      const [dsRes, anRes, issRes, recRes, fbRes] = await Promise.all([
        api.getDatasets(),
        api.getOverviewAnalytics(),
        api.getIssues(),
        api.getRecommendations(),
        api.getFeedback({ limit: 100 }),
      ]);

      setDatasets(dsRes.datasets);
      setAnalytics(anRes);
      setIssues(issRes.issues);
      setRecommendations(recRes.recommendations);
      setAllFeedback(fbRes.items);
    } catch (err) {
      console.error('Error loading initial app state:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.runAnalysis();
      await loadData();
    } catch (err: any) {
      alert('Analysis pipeline failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset to initial demo dataset state? This restores default records.')) {
      setInitialLoading(true);
      try {
        await api.resetDemoData();
        await loadData();
      } finally {
        setInitialLoading(false);
      }
    }
  };

  const handleSaveFeedbackOverride = async (id: string, updates: Partial<FeedbackItem>) => {
    await api.updateFeedback(id, updates);
    await loadData();
  };

  const handleRecommendationStatusChange = async (id: string, status: 'under_review' | 'accepted' | 'rejected') => {
    await api.updateRecommendationStatus(id, status);
    const recRes = await api.getRecommendations();
    setRecommendations(recRes.recommendations);
  };

  // Compute coverage of adapted items
  const adaptedCount = analytics?.provenance_distribution?.adapted_dataset || 0;
  const totalFeedbackCount = analytics?.total_records || 0;
  const adaptedCoverage = totalFeedbackCount > 0
    ? Math.round((adaptedCount / totalFeedbackCount) * 100)
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        feedbackCount={totalFeedbackCount}
        adaptedCoverage={adaptedCoverage}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q && currentTab !== 'feedback') {
              setCurrentTab('feedback');
            }
          }}
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={setSelectedDatasetId}
          onOpenUpload={() => setIsUploadOpen(true)}
          onRunAnalysis={handleRunAnalysis}
          isAnalyzing={isAnalyzing}
          onResetDemo={handleResetDemo}
          feedbackTotal={totalFeedbackCount}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto">
          {initialLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading InsightFlow platform data...</p>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <OverviewView
                  analytics={analytics}
                  onNavigateToFeedback={() => setCurrentTab('feedback')}
                  onNavigateToIssues={() => setCurrentTab('prioritization')}
                  onNavigateToRecommendations={() => setCurrentTab('recommendations')}
                  onSelectFeedback={(item) => setSelectedFeedback(item)}
                />
              )}

              {currentTab === 'feedback' && (
                <FeedbackExplorerView
                  onSelectFeedback={(item) => setSelectedFeedback(item)}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  searchFilter={searchQuery}
                />
              )}

              {currentTab === 'insights' && (
                <AIInsightsView
                  analytics={analytics}
                  onRunAnalysis={handleRunAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {currentTab === 'prioritization' && (
                <PrioritizationView
                  issues={issues}
                  onNavigateToTracker={() => setCurrentTab('tracker')}
                />
              )}

              {currentTab === 'recommendations' && (
                <RecommendationsView
                  recommendations={recommendations}
                  onStatusChange={handleRecommendationStatusChange}
                />
              )}

              {currentTab === 'tracker' && (
                <IssueTrackerView
                  initialIssues={issues}
                  onRefreshIssues={async () => {
                    const issRes = await api.getIssues();
                    setIssues(issRes.issues);
                  }}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  analytics={analytics}
                  issues={issues}
                  recommendations={recommendations}
                />
              )}

              {currentTab === 'adaption' && (
                <AdaptionLabView
                  datasets={datasets}
                  feedback={allFeedback}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  datasets={datasets}
                  onResetDemo={handleResetDemo}
                  onRunAnalysis={handleRunAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <FeedbackDetailModal
        item={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onSaveOverride={handleSaveFeedbackOverride}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={loadData}
      />
    </div>
  );
}
