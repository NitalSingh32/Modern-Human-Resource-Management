import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogOut,
  ChevronDown,
  Database,
  ArrowRightLeft,
  Shield,
  Briefcase,
  UserCheck,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenDbModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenDbModal,
  onToggleMobileSidebar,
}) => {
  const { user, logout, switchRoleDemo } = useAuth();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSwitch = async (targetRole: UserRole) => {
    setRoleMenuOpen(false);
    await switchRoleDemo(targetRole);
    setCurrentTab('dashboard');
  };

  const roleBadgeConfig = {
    admin: { label: 'HR Administrator', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield },
    manager: { label: 'Engineering Manager', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Briefcase },
    employee: { label: 'Staff Member', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: UserCheck },
  };

  const currentRoleConfig = roleBadgeConfig[user?.role || 'employee'];
  const RoleIcon = currentRoleConfig.icon;

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return user?.role === 'admin' ? 'HR Operations Dashboard' : user?.role === 'manager' ? 'Team Leadership Dashboard' : 'Employee Portal';
      case 'employees':
        return user?.role === 'manager' ? 'Team Directory' : 'Employee Directory & Roster';
      case 'attendance':
        return 'Attendance & Time Logs';
      case 'leaves':
        return 'Leave Management & Approvals';
      case 'departments':
        return 'Departments & Designations';
      case 'announcements':
        return 'Company Notice Board';
      case 'training':
        return 'Training & Skill Development';
      case 'analytics':
        return 'Workforce Reports & Analytics';
      case 'profile':
        return 'My Account & Preferences';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & view title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 md:hidden hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {getBreadcrumbTitle(currentTab)}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            StaffSync Management Suite • Active Tenant
          </p>
        </div>
      </div>

      {/* Right: Clock, Quick Switcher, Database status & User Menu */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-mono text-slate-800">{time}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{date}</span>
        </div>

        {/* Database diagnostics modal trigger */}
        <button
          onClick={onOpenDbModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 text-xs font-medium transition-colors"
          title="Inspect MongoDB / MERN Architecture Status"
        >
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">DB Architecture</span>
        </button>

        {/* 1-Click Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-900 text-xs font-semibold transition-all shadow-2xs"
            title="Switch demo role perspective"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="capitalize">{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </span>
              </div>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-purple-50 text-purple-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-semibold">HR Administrator</p>
                    <p className="text-[10px] text-slate-400">admin@staffsync.io</p>
                  </div>
                </div>
                {user?.role === 'admin' && <span className="text-[10px] text-purple-600 font-bold">Active</span>}
              </button>

              <button
                onClick={() => handleRoleSwitch('manager')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  user?.role === 'manager'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold">Manager</p>
                    <p className="text-[10px] text-slate-400">manager@staffsync.io</p>
                  </div>
                </div>
                {user?.role === 'manager' && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
              </button>

              <button
                onClick={() => handleRoleSwitch('employee')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  user?.role === 'employee'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Employee</p>
                    <p className="text-[10px] text-slate-400">employee@staffsync.io</p>
                  </div>
                </div>
                {user?.role === 'employee' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
              </button>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-white"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'Avatar'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-slate-100">
                <p className="font-bold text-sm text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentRoleConfig.bg}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {currentRoleConfig.label}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setCurrentTab('profile');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  View Profile & Settings
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
