/**
 * CarbonSnap — RoadmapFeedbackView.tsx
 * FSD: features layer — roadmap & feedback
 * Public roadmap items, upvoting and feature feedback collection.
 */
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
  Bug,
  Lightbulb,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { RoadmapItem, FeedbackReport } from '../../shared/model/types';
import {
  fetchRoadmapItems,
  upvoteRoadmapItem,
  submitFeedback,
  fetchFeedbackReports
} from '../../shared/api/client';

export const RoadmapFeedbackView: React.FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState<'BUG' | 'FEATURE_REQUEST' | 'GENERAL'>('FEATURE_REQUEST');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rItems, fReports] = await Promise.all([
        fetchRoadmapItems(),
        fetchFeedbackReports()
      ]);
      setItems(rItems);
      setFeedbacks(fReports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpvote = async (id: string) => {
    try {
      const updated = await upvoteRoadmapItem(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const newFeedback = await submitFeedback({
        userEmail: userEmail.trim() || 'pilot_user@acmecorp.com',
        category,
        message
      });
      setFeedbacks((prev) => [newFeedback, ...prev]);
      setMessage('');
      setSuccessMessage('Thank you! Your feedback has been logged directly into our engineering issue pipeline.');
    } catch (e: any) {
      alert(`Submission error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const planned = items.filter((i) => i.status === 'PLANNED');
  const inProgress = items.filter((i) => i.status === 'IN_PROGRESS');
  const completed = items.filter((i) => i.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        <span className="font-medium text-neutral-700">Loading Public Roadmap & Community Feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-neutral-900 text-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-400 text-black text-xs font-black uppercase px-2.5 py-1 rounded">
                Open Product Roadmap & Transparency
              </span>
              <span className="bg-neutral-800 text-neutral-300 text-xs px-2.5 py-1 rounded font-mono">
                GitHub Board Bridge
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Community Roadmap & Feedback Hub
            </h1>
            <p className="text-neutral-400 text-sm max-w-2xl">
              Upvote upcoming CarbonSnap features, track our development milestones live from GitHub, or submit direct bug reports and feature requests.
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span>Product Development Kanban</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Planned */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">PLANNED</h3>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {planned.length}
              </span>
            </div>

            <div className="space-y-3">
              {planned.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleUpvote(item.id)}
                      className="flex items-center space-x-1 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{item.upvotes}</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-neutral-600">{item.description}</p>

                  <a
                    href={item.githubIssueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 pt-1"
                  >
                    <span>View GitHub Issue</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-900">IN PROGRESS</h3>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {inProgress.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgress.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleUpvote(item.id)}
                      className="flex items-center space-x-1 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{item.upvotes}</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-neutral-600">{item.description}</p>

                  <a
                    href={item.githubIssueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 pt-1"
                  >
                    <span>View GitHub Issue</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">COMPLETED</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>

            <div className="space-y-3">
              {completed.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm space-y-3 opacity-90">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-neutral-500 flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{item.upvotes}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-900 leading-snug line-through text-neutral-500">{item.title}</h4>
                  <p className="text-xs text-neutral-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* In-App Feedback Widget Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-neutral-900">In-App Pilot Feedback & Bug Reporting Widget</h3>
          </div>
          <p className="text-xs text-neutral-600">
            Report bugs or submit custom feature requests directly into our team queue.
          </p>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-800 underline">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-700">Your Email Address</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. sarah@acmecorp.com"
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-700">Category</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="BUG">Bug / Issue Report</option>
              <option value="GENERAL">General Feedback</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="block text-xs font-bold text-neutral-700">Message / Issue Details</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your request or issue in detail..."
              required
              className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback to Engineering</span>
            </button>
          </div>
        </form>

        {/* Recent Feedback Logs */}
        {feedbacks.length > 0 && (
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Recent Submitted Pilot Feedback</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs flex justify-between items-start">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-neutral-900">{f.userEmail}</span>
                      <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-neutral-700">{f.message}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {new Date(f.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
