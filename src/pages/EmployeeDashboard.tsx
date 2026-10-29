import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  CalendarOff,
  GraduationCap,
  Megaphone,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Attendance, LeaveRequest, Announcement, TrainingProgram } from '../types';

interface EmployeeDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenApplyLeave: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onNavigate,
  onOpenApplyLeave,
}) => {
  const { user, refreshUser } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [clockLocation, setClockLocation] = useState('Remote - VPN Secure');
  const [punchLoading, setPunchLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [todayRes, leaves, anns, trns] = await Promise.all([
        api.getTodayAttendance(),
        api.getLeaves(),
        api.getAnnouncements(),
        api.getTrainingPrograms(),
      ]);
      setTodayAttendance(todayRes.myAttendance);
      setMyLeaves(leaves);
      setAnnouncements(anns.slice(0, 3));
      setTrainings(trns);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setPunchLoading(true);
    setNotice(null);
    try {
      const res = await api.checkIn(clockLocation);
      setTodayAttendance(res.data);
      setNotice({ type: 'success', text: res.message });

      // Celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // no-op
      }
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Check-in failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setPunchLoading(true);
    setNotice(null);
    try {
      const res = await api.checkOut();
      setTodayAttendance(res.data);
      setNotice({ type: 'success', text: res.message });
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Check-out failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  const emp = user?.employee;
  const leaveBalance = emp?.leaveBalance || { paid: 14, sick: 7, casual: 4 };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 inline-block mb-2">
            Employee Workspace
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Hello, {user?.name}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            {emp?.designation || 'Staff Member'} • {emp?.department || 'Engineering'} • Code: {emp?.employeeCode || 'EMP-1003'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenApplyLeave}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <CalendarOff className="w-4 h-4" />
            Apply for Leave
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Attendance Log
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Live Punch Clock Widget & Leave Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Punch Clock Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Time Punch</h3>
              </div>
              <Badge
                variant={
                  todayAttendance?.checkOut
                    ? 'slate'
                    : todayAttendance?.checkIn
                    ? 'emerald'
                    : 'amber'
                }
              >
                {todayAttendance?.checkOut
                  ? 'Completed Shift'
                  : todayAttendance?.checkIn
                  ? 'Currently Clocked In'
                  : 'Pending Check-In'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Mark your daily presence. Shift times automatically update your timesheet for payroll.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Check-in Time:</span>
                <span className="font-mono font-bold text-slate-800">
                  {todayAttendance?.checkIn || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Check-out Time:</span>
                <span className="font-mono font-bold text-slate-800">
                  {todayAttendance?.checkOut || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Logged Hours:</span>
                <span className="font-mono font-bold text-indigo-600">
                  {todayAttendance?.workHours ? `${todayAttendance.workHours} hrs` : '0.0 hrs'}
                </span>
              </div>
            </div>

            {/* Location selector */}
            {!todayAttendance?.checkIn && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Working From:
                </label>
                <select
                  value={clockLocation}
                  onChange={(e) => setClockLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Headquarters - On-site">Headquarters - On-site Desk</option>
                  <option value="Remote - VPN Secure">Remote - Home Office / VPN</option>
                  <option value="Client Site">Client Site / Field Meeting</option>
                </select>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            {!todayAttendance?.checkIn ? (
              <button
                disabled={punchLoading}
                onClick={handleCheckIn}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Punch Check-In Now</span>
              </button>
            ) : !todayAttendance?.checkOut ? (
              <button
                disabled={punchLoading}
                onClick={handleCheckOut}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Punch Check-Out (End Shift)</span>
              </button>
            ) : (
              <div className="text-center py-2 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                Shift closed for today. Great job!
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your Leave Quotas</h3>
                <p className="text-xs text-slate-500">Available time off balances for current fiscal year</p>
              </div>
              <button
                onClick={onOpenApplyLeave}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                + Request Leave
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                  Paid Time Off (PTO)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-950 font-mono">
                    {leaveBalance.paid}
                  </span>
                  <span className="text-xs text-indigo-700">days left</span>
                </div>
                <div className="w-full bg-indigo-200/50 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                  Sick Leave
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-purple-950 font-mono">
                    {leaveBalance.sick}
                  </span>
                  <span className="text-xs text-purple-700">days left</span>
                </div>
                <div className="w-full bg-purple-200/50 rounded-full h-1.5 mt-2">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                  Casual Leave
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-blue-950 font-mono">
                    {leaveBalance.casual}
                  </span>
                  <span className="text-xs text-blue-700">days left</span>
                </div>
                <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Leave Status Mini Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Recent Application:{' '}
              {myLeaves.length > 0 ? (
                <strong className="text-slate-800">
                  {myLeaves[0].leaveType} ({myLeaves[0].startDate})
                </strong>
              ) : (
                'No leaves requested'
              )}
            </span>
            {myLeaves.length > 0 && (
              <Badge
                variant={
                  myLeaves[0].status === 'Approved'
                    ? 'emerald'
                    : myLeaves[0].status === 'Pending'
                    ? 'amber'
                    : 'rose'
                }
              >
                {myLeaves[0].status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Training Programs & Company Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Enrolled Training & Upskilling</h3>
            </div>
            <button
              onClick={() => onNavigate('training')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Programs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trainings.map((trn) => {
              const myEnrollment = trn.enrolledEmployees.find((e) => e.employeeId === user?.employeeId);
              const progress = myEnrollment ? myEnrollment.progressPercent : 35;
              return (
                <div key={trn._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{trn.title}</h4>
                    <span className="text-[10px] font-bold text-indigo-600 font-mono">{progress}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">{trn.description}</p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Announcements */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Company Notices</h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Notice Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant={
                      ann.priority === 'Urgent'
                        ? 'rose'
                        : ann.priority === 'Important'
                        ? 'purple'
                        : 'blue'
                    }
                  >
                    {ann.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.postedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
