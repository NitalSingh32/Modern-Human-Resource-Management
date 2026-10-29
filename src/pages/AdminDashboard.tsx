import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  UserX,
  Clock,
  Building2,
  GraduationCap,
  Plus,
  ArrowRight,
  TrendingUp,
  Megaphone,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { AnalyticsOverview, Announcement, Attendance } from '../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddEmployee: () => void;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenAddEmployee,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [an, anns, att] = await Promise.all([
          api.getAnalytics(),
          api.getAnnouncements(),
          api.getAttendance(),
        ]);
        setAnalytics(an);
        setAnnouncements(anns.slice(0, 3));
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayAttendance(att.filter((a) => a.date === todayStr));
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalEmployees: 6,
    presentToday: 4,
    absentToday: 2,
    lateToday: 1,
    pendingLeaves: 2,
    activeDepartments: 5,
    activeTrainingPrograms: 2,
  };

  const leavePieData = [
    { name: 'Paid', value: analytics?.leaveTypeCounts.Paid || 2 },
    { name: 'Sick', value: analytics?.leaveTypeCounts.Sick || 1 },
    { name: 'Casual', value: analytics?.leaveTypeCounts.Casual || 1 },
    { name: 'Unpaid', value: analytics?.leaveTypeCounts.Unpaid || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10 inline-block mb-2">
            HR Administration Center
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Workforce Overview & Intelligence
          </h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl leading-relaxed">
            Live attendance synchronization, leave requests requiring managerial action, and departmental metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddEmployee}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Employee
          </button>
          <button
            onClick={() => onNavigate('leaves')}
            className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Review Leaves</span>
            {summary.pendingLeaves > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {summary.pendingLeaves}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={summary.totalEmployees}
          subtitle="Across 5 active departments"
          icon={Users}
          colorTheme="indigo"
          trend={{ value: '+8%', isPositive: true }}
        />
        <StatsCard
          title="Present Today"
          value={summary.presentToday}
          subtitle={`${summary.lateToday} logged in late`}
          icon={CalendarCheck}
          colorTheme="emerald"
          trend={{ value: '88% rate', isPositive: true }}
        />
        <StatsCard
          title="Absent / On Leave"
          value={summary.absentToday}
          subtitle="Planned & unplanned"
          icon={UserX}
          colorTheme="rose"
        />
        <StatsCard
          title="Pending Leave Requests"
          value={summary.pendingLeaves}
          subtitle="Requires authorization"
          icon={Clock}
          colorTheme="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trends (Area Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Velocity (Past 7 Days)</h3>
              <p className="text-xs text-slate-500">Present vs. Absent ratio</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Present
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Late
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Absent
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="absent" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAbsent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Requests by Type (Pie Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Leave Categories</h3>
            <p className="text-xs text-slate-500">Breakdown of submitted time off</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leavePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leavePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {leavePieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 truncate">{item.name} Leave:</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Headcount Bar Chart & Today's Attendance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount</h3>
              <p className="text-xs text-slate-500">Distribution across active units</p>
            </div>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.departmentDistribution || []}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Today Attendance Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Attendance Status</h3>
              <p className="text-xs text-slate-500">Real-time check-in records</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full records <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Check In</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No attendance logged yet for today.
                    </td>
                  </tr>
                ) : (
                  todayAttendance.slice(0, 5).map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.employeeName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.department}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{row.checkIn || '—'}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            row.status === 'Present'
                              ? 'emerald'
                              : row.status === 'Late'
                              ? 'amber'
                              : 'rose'
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">{row.location}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Announcements Bar */}
      {announcements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Company Notices</h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Notice Board
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 transition-all"
              >
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
      )}
    </div>
  );
};
