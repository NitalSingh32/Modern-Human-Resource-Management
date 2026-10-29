import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Attendance, Department } from '../types';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [todaySummary, setTodaySummary] = useState<{
    todayDate: string;
    myAttendance: Attendance | null;
    summary: { totalPresent: number; totalLate: number; totalAbsent: number; allRecordsCount: number };
  } | null>(null);

  const [dateFilter, setDateFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [workLocation, setWorkLocation] = useState('Headquarters - On-site');

  const loadData = async () => {
    try {
      const [list, todayRes, depts] = await Promise.all([
        api.getAttendance({
          date: dateFilter || undefined,
          department: deptFilter !== 'All' ? deptFilter : undefined,
        }),
        api.getTodayAttendance(),
        api.getDepartments(),
      ]);
      setAttendanceList(list);
      setTodaySummary(todayRes);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFilter, deptFilter]);

  const handlePunchCheckIn = async () => {
    setPunchLoading(true);
    setBannerNotice(null);
    try {
      const res = await api.checkIn(workLocation);
      setBannerNotice({ type: 'success', text: res.message });
      try {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } catch {
        // no-op
      }
      await loadData();
    } catch (err: unknown) {
      setBannerNotice({ type: 'error', text: err instanceof Error ? err.message : 'Check-in failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchCheckOut = async () => {
    setPunchLoading(true);
    setBannerNotice(null);
    try {
      const res = await api.checkOut();
      setBannerNotice({ type: 'success', text: res.message });
      await loadData();
    } catch (err: unknown) {
      setBannerNotice({ type: 'error', text: err instanceof Error ? err.message : 'Check-out failed' });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (attendanceList.length === 0) return;
    const headers = ['Date', 'Employee Code', 'Name', 'Department', 'Check In', 'Check Out', 'Hours', 'Status', 'Location'];
    const rows = attendanceList.map((a) => [
      a.date,
      a.employeeCode,
      `"${a.employeeName}"`,
      `"${a.department}"`,
      a.checkIn || '',
      a.checkOut || '',
      a.workHours || '0',
      a.status,
      `"${a.location || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StaffSync_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const myRecordToday = todaySummary?.myAttendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance & Timesheets</h2>
          <p className="text-xs text-slate-500">
            {isEmployee
              ? 'Your personal check-in/out records and monthly attendance log'
              : 'Enterprise attendance tracking, shift timestamps, and compliance logs'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Timesheet (CSV)
        </button>
      </div>

      {bannerNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-slate-400 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Employee Quick Punch Bar (Shown prominently for staff and managers) */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-indigo-200 border border-white/10">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Shift Terminal</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  myRecordToday?.checkIn ? 'bg-emerald-400 text-slate-900' : 'bg-amber-400 text-slate-900'
                }`}
              >
                {myRecordToday?.checkIn ? 'Checked In' : 'Not Logged Today'}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {myRecordToday?.checkIn
                ? `Logged in at ${myRecordToday.checkIn} • Working from ${myRecordToday.location}`
                : 'Click Check-In below to log your start of day.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!myRecordToday?.checkIn && (
            <select
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl text-xs px-3 py-2 focus:outline-hidden"
            >
              <option value="Headquarters - On-site" className="text-slate-900">Headquarters - On-site</option>
              <option value="Remote - VPN Secure" className="text-slate-900">Remote - VPN Secure</option>
              <option value="Client Site" className="text-slate-900">Client Site</option>
            </select>
          )}

          {!myRecordToday?.checkIn ? (
            <button
              disabled={punchLoading}
              onClick={handlePunchCheckIn}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Punch Check-In</span>
            </button>
          ) : !myRecordToday?.checkOut ? (
            <button
              disabled={punchLoading}
              onClick={handlePunchCheckOut}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Punch Check-Out</span>
            </button>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-emerald-200">
              Shift Ended ({myRecordToday.checkOut})
            </span>
          )}
        </div>
      </div>

      {/* Attendance Stats Cards */}
      {!isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Checked In"
            value={todaySummary?.summary.totalPresent || 0}
            subtitle="Logged in today"
            icon={CalendarCheck}
            colorTheme="emerald"
          />
          <StatsCard
            title="Late Arrivals"
            value={todaySummary?.summary.totalLate || 0}
            subtitle="Checked in after 09:30 AM"
            icon={Clock}
            colorTheme="amber"
          />
          <StatsCard
            title="Unreported / Absent"
            value={todaySummary?.summary.totalAbsent || 0}
            subtitle="No check-in record"
            icon={Users}
            colorTheme="rose"
          />
          <StatsCard
            title="Total Daily Shifts"
            value={todaySummary?.summary.allRecordsCount || 0}
            subtitle="Active timesheets"
            icon={CalendarCheck}
            colorTheme="indigo"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {!isEmployee && (
          <div className="w-full sm:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No attendance records found for this criteria.
                  </td>
                </tr>
              ) : (
                attendanceList.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">{row.date}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{row.employeeName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{row.employeeCode}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.department}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{row.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{row.checkOut || '—'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {row.workHours ? `${row.workHours} hrs` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          row.status === 'Present'
                            ? 'emerald'
                            : row.status === 'Late'
                            ? 'amber'
                            : row.status === 'Half-day'
                            ? 'blue'
                            : 'rose'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">{row.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
