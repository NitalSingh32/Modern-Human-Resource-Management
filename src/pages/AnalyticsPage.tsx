import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatsCard } from '../components/common/StatsCard';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const deptBudgetData = (data?.departmentDistribution || []).map((d) => ({
    name: d.name,
    budget: Math.round(d.budget / 1000), // in $k
    employees: d.employees,
  }));

  const leaveBreakdown = [
    { name: 'Paid Time Off', value: data?.leaveTypeCounts.Paid || 2 },
    { name: 'Medical/Sick', value: data?.leaveTypeCounts.Sick || 1 },
    { name: 'Casual/Personal', value: data?.leaveTypeCounts.Casual || 1 },
    { name: 'Unpaid Leave', value: data?.leaveTypeCounts.Unpaid || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Enterprise headcount distribution, budget allocations, attendance trends, and leave rates
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Print / Save PDF Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Headcount"
          value={data?.summary.totalEmployees || 0}
          subtitle="Full-time & Contract"
          icon={Users}
          colorTheme="indigo"
          trend={{ value: '100% active', isPositive: true }}
        />
        <StatsCard
          title="Attendance Stability"
          value="94.2%"
          subtitle="Rolling 30-day punctuality"
          icon={CalendarCheck}
          colorTheme="emerald"
          trend={{ value: '+2.1%', isPositive: true }}
        />
        <StatsCard
          title="Annual Dept Budgets"
          value="$2.42M"
          subtitle="Approved payroll & tools"
          icon={DollarSign}
          colorTheme="purple"
        />
        <StatsCard
          title="Leave Requests In Flight"
          value={data?.summary.pendingLeaves || 0}
          subtitle="Pending decision"
          icon={CalendarOff}
          colorTheme="amber"
        />
      </div>

      {/* Two Big Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Budgets ($K) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Department Operating Budgets ($ in Thousands)</h3>
            <p className="text-xs text-slate-500">Annual capital expenditure and operational limits</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBudgetData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [`$${val}k`, 'Operating Budget']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Distribution Pie */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">Time-off Portfolio Analysis</h3>
            <p className="text-xs text-slate-500">Distribution of company leave claims</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveBreakdown.map((_, index) => (
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
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
