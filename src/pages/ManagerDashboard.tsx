import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  CalendarOff,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Employee, LeaveRequest, TrainingProgram } from '../types';

interface ManagerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<LeaveRequest[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [emps, leaves, trns] = await Promise.all([
        api.getEmployees({ role: 'my-team' }),
        api.getLeaves(),
        api.getTrainingPrograms(),
      ]);
      setTeamMembers(emps);
      setTeamLeaves(leaves);
      setTrainings(trns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;
    setSubmittingReview(true);
    try {
      const res = await api.reviewLeave(selectedLeave._id, status, reviewNotes);
      setMessage(res.message);
      setSelectedLeave(null);
      setReviewNotes('');
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingLeaves = teamLeaves.filter((l) => l.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10 inline-block mb-2">
            Engineering Leadership Hub
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            You are managing {teamMembers.length} active team members. Monitor daily work hours, review time-off requests, and guide technical development.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('training')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-blue-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Assign Training
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-xs border border-blue-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Team Attendance
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Direct Team Members"
          value={teamMembers.length}
          subtitle="Engineering & Tech"
          icon={Users}
          colorTheme="blue"
        />
        <StatsCard
          title="Team Present Today"
          value={Math.max(1, teamMembers.length - 1)}
          subtitle="Logged in on-site/remote"
          icon={CalendarCheck}
          colorTheme="emerald"
        />
        <StatsCard
          title="Pending Leave Approvals"
          value={pendingLeaves.length}
          subtitle="Awaiting your review"
          icon={Clock}
          colorTheme="amber"
        />
        <StatsCard
          title="Active Trainings"
          value={trainings.length}
          subtitle="Upskilling programs"
          icon={GraduationCap}
          colorTheme="purple"
        />
      </div>

      {/* Main split: Team members list + Pending Leave Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Direct Reports & Team Members</h3>
              <p className="text-xs text-slate-500">Profiles, job designations, and status</p>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full Roster <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((emp) => (
              <div
                key={emp._id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all flex items-start gap-3"
              >
                <img
                  src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={emp.firstName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{emp.employeeCode}</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                    {emp.designation}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{emp.email}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Paid Leave: <strong className="text-slate-800">{emp.leaveBalance?.paid || 0}d</strong>
                    </span>
                    <Badge variant={emp.status === 'Active' ? 'emerald' : 'amber'}>
                      {emp.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leave Approvals</h3>
              <p className="text-xs text-slate-500">Requests requiring manager action</p>
            </div>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
              {pendingLeaves.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px]">
            {pendingLeaves.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
                <p className="font-semibold text-slate-600">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending leave requests for your team.</p>
              </div>
            ) : (
              pendingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{leave.employeeName}</span>
                    <Badge variant="purple">{leave.leaveType} Leave</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                    "{leave.reason}"
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
                    <span>
                      {leave.startDate} to {leave.endDate}
                    </span>
                    <span className="font-bold text-slate-700">{leave.daysCount} day(s)</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLeave(leave)}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Review & Decide
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title="Review Team Leave Request"
        description="Verify team capacity and approve or decline the time off."
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{selectedLeave.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Type:</span>
                <span className="font-bold text-indigo-600">{selectedLeave.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-slate-900">
                  {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.daysCount} days)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-0.5">Stated Reason:</span>
                <p className="italic text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                  {selectedLeave.reason}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Comments / Instructions (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                placeholder="e.g., Approved, please sync with Elena to cover on-call tasks."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={submittingReview}
                onClick={() => handleReview('Rejected')}
                className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Reject Request
              </button>
              <button
                disabled={submittingReview}
                onClick={() => handleReview('Approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Approve Leave
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
