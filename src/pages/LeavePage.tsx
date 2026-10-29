import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarOff,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';

interface LeavePageProps {
  initialApplyOpen?: boolean;
}

export const LeavePage: React.FC<LeavePageProps> = ({ initialApplyOpen = false }) => {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(initialApplyOpen);
  const [applyData, setApplyData] = useState({
    leaveType: 'Paid' as 'Paid' | 'Sick' | 'Casual' | 'Unpaid',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applying, setApplying] = useState(false);

  // Review Modal
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadLeaves = async () => {
    try {
      const data = await api.getLeaves(statusFilter);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setNotice(null);
    try {
      const res = await api.applyLeave(applyData);
      setNotice({ type: 'success', text: res.message });
      setApplyModalOpen(false);
      setApplyData({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        reason: '',
      });
      await loadLeaves();
      await refreshUser();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Application failed' });
    } finally {
      setApplying(false);
    }
  };

  const handleReviewDecision = async (status: 'Approved' | 'Rejected') => {
    if (!reviewLeave) return;
    setReviewing(true);
    try {
      const res = await api.reviewLeave(reviewLeave._id, status, reviewNotes);
      setNotice({ type: 'success', text: res.message });
      setReviewLeave(null);
      setReviewNotes('');

      if (status === 'Approved') {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // no-op
        }
      }

      await loadLeaves();
      await refreshUser();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Decision failed' });
    } finally {
      setReviewing(false);
    }
  };

  const emp = user?.employee;
  const leaveBalance = emp?.leaveBalance || { paid: 14, sick: 7, casual: 4 };

  // Calculate days for apply form preview
  const calculateDays = () => {
    if (!applyData.startDate || !applyData.endDate) return 0;
    const start = new Date(applyData.startDate);
    const end = new Date(applyData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Request vacation, sick leave, or personal time off with transparent approval tracking'
              : 'Review team time-off requests, manage coverage, and enforce leave quotas'}
          </p>
        </div>

        <button
          onClick={() => setApplyModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Leave Balance Quotas for Current User */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-indigo-700">Paid Leave (PTO)</span>
            <Badge variant="indigo">Annual</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{leaveBalance.paid}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-purple-700">Sick Leave</span>
            <Badge variant="purple">Medical</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{leaveBalance.sick}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-blue-700">Casual Leave</span>
            <Badge variant="blue">Emergency</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{leaveBalance.casual}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Review Notes</th>
                {(!isEmployee || isAdmin) && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CalendarOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{l.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{l.department}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-700">{l.leaveType}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {l.startDate} <span className="text-slate-400">→</span> {l.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{l.daysCount} d</td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="truncate text-slate-600" title={l.reason}>
                        {l.reason}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          l.status === 'Approved'
                            ? 'emerald'
                            : l.status === 'Pending'
                            ? 'amber'
                            : 'rose'
                        }
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-[180px]">
                      {l.reviewedBy ? (
                        <div className="text-[11px]">
                          <p className="font-medium text-slate-700 truncate">{l.reviewedBy}</p>
                          {l.reviewNotes && <p className="text-slate-400 italic truncate">{l.reviewNotes}</p>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </td>
                    {(!isEmployee || isAdmin) && (
                      <td className="py-3 px-4 text-right">
                        {l.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewLeave(l)}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Decide
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Submit Leave Request"
        description="Select dates, choose leave category, and specify reason."
        maxWidth="md"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category *</label>
            <select
              value={applyData.leaveType}
              onChange={(e) =>
                setApplyData({ ...applyData, leaveType: e.target.value as 'Paid' | 'Sick' | 'Casual' | 'Unpaid' })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="Paid">Paid Time Off (PTO) — {leaveBalance.paid} days remaining</option>
              <option value="Sick">Sick Leave — {leaveBalance.sick} days remaining</option>
              <option value="Casual">Casual / Urgent Leave — {leaveBalance.casual} days remaining</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={applyData.startDate}
                onChange={(e) => setApplyData({ ...applyData, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={applyData.endDate}
                onChange={(e) => setApplyData({ ...applyData, endDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {requestedDays > 0 && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-600">Calculated Duration:</span>
              <span className="font-bold text-indigo-900 font-mono">{requestedDays} calendar day(s)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              value={applyData.reason}
              onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
              placeholder="Please provide details for managerial review and coverage planning..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying || requestedDays === 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {applying ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewLeave}
        onClose={() => setReviewLeave(null)}
        title="Review & Decide Leave Request"
        maxWidth="md"
      >
        {reviewLeave && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p>
                <strong>Applicant:</strong> {reviewLeave.employeeName} ({reviewLeave.department})
              </p>
              <p>
                <strong>Category:</strong> {reviewLeave.leaveType} Leave
              </p>
              <p>
                <strong>Duration:</strong> {reviewLeave.startDate} to {reviewLeave.endDate} (
                <strong>{reviewLeave.daysCount} days</strong>)
              </p>
              <p className="pt-2 text-slate-600 italic">"{reviewLeave.reason}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer Feedback Notes</label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes or instructions for the employee..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewLeave(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={reviewing}
                onClick={() => handleReviewDecision('Rejected')}
                className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold"
              >
                Reject
              </button>
              <button
                disabled={reviewing}
                onClick={() => handleReviewDecision('Approved')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
