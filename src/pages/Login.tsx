import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Shield,
  Briefcase,
  UserCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@staffsync.io');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'admin' as UserRole,
      title: 'HR Administrator',
      email: 'admin@staffsync.io',
      password: 'admin123',
      name: 'Sarah Jenkins',
      desc: 'Full workforce oversight, employee CRUD, leave approvals, analytics',
      icon: Shield,
      accent: 'border-purple-500 bg-purple-50/50 text-purple-900',
    },
    {
      role: 'manager' as UserRole,
      title: 'Engineering Manager',
      email: 'manager@staffsync.io',
      password: 'manager123',
      name: 'Marcus Vance',
      desc: 'Team monitoring, team leave approvals, skill & training planning',
      icon: Briefcase,
      accent: 'border-blue-500 bg-blue-50/50 text-blue-900',
    },
    {
      role: 'employee' as UserRole,
      title: 'Staff Member',
      email: 'employee@staffsync.io',
      password: 'employee123',
      name: 'Elena Rostova',
      desc: 'Personal check-in/out punch clock, leave requests, training hub',
      icon: UserCheck,
      accent: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
  ];

  const handleSelectRole = (acc: typeof demoAccounts[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">StaffSync</h2>
        <p className="mt-1.5 text-sm text-slate-300">Modern Human Resource Management Solution</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-slate-900">
          {/* Quick Demo Role Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Profiles (Pre-seeded)
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">Select a role to test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? acc.accent
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-xs font-bold leading-tight">{acc.title}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{acc.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@staffsync.io"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Encrypted with bcrypt</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer architecture notes */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Secured with JWT, role-based authorization guards & Mongoose ODM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
