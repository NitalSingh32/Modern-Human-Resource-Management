import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarOff,
  Building2,
  Megaphone,
  GraduationCap,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pendingLeaveCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  pendingLeaveCount = 0,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leaves', label: 'Leave Requests', icon: CalendarOff, badge: pendingLeaveCount },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'training', label: 'Training & Dev', icon: GraduationCap },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  const managerNav: NavItem[] = [
    { id: 'dashboard', label: 'Manager Hub', icon: LayoutDashboard },
    { id: 'employees', label: 'My Team', icon: Users },
    { id: 'attendance', label: 'Team Attendance', icon: CalendarCheck },
    { id: 'leaves', label: 'Leave Approvals', icon: CalendarOff, badge: pendingLeaveCount },
    { id: 'training', label: 'Training Programs', icon: GraduationCap },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'Profile & Settings', icon: UserCheck },
  ];

  const employeeNav: NavItem[] = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'leaves', label: 'Leave Requests', icon: CalendarOff },
    { id: 'training', label: 'My Training', icon: GraduationCap },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'manager' ? managerNav : employeeNav;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200/90 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                StaffSync
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                  HRMS
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Enterprise Suite</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Role Pill Banner */}
      {!collapsed && (
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Logged Role:</span>
            <span
              className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[11px] ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : role === 'manager'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {role === 'admin' ? 'HR Administrator' : role === 'manager' ? 'Manager' : 'Employee'}
            </span>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {/* Badge if available */}
              {item.badge !== undefined && item.badge > 0 && !collapsed && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-100 text-rose-700 animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.badge !== undefined && item.badge > 0 && collapsed && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle when in collapsed state */}
      {collapsed && (
        <div className="p-3 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Quick Role switch notice inside sidebar */}
      {!collapsed && (
        <div className="p-3 m-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-xl border border-indigo-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Role-Based Access</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Current session enforced by backend JWT claims. Switch role in top bar anytime.
          </p>
        </div>
      )}
    </aside>
  );
};
