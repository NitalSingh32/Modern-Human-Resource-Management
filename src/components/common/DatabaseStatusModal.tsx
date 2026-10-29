import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Server, HardDrive, ShieldCheck, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../../services/api';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    status: string;
    database: {
      connectedToMongo: boolean;
      engine: string;
      modelsRegistered: string[];
      counts: Record<string, number>;
    };
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getSystemStatus();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="StaffSync System & Database Architecture"
      description="Real-time MongoDB / MERN Stack engine status"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 text-sm">
                  {data?.database.engine || 'Loading...'}
                </h4>
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full Mongoose schema enforcement & RESTful Express APIs
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
            title="Refresh database diagnostics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Collections Breakdown */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Mongoose Schema Collections
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { name: 'Users', key: 'users', desc: 'Accounts & JWT Auth' },
              { name: 'Employees', key: 'employees', desc: 'Profiles & Salaries' },
              { name: 'Departments', key: 'departments', desc: 'Units & Budgets' },
              { name: 'Attendance', key: 'attendance', desc: 'Time Punches' },
              { name: 'LeaveRequests', key: 'leaveRequests', desc: 'Approvals Workflow' },
              { name: 'Announcements', key: 'announcements', desc: 'Company Notices' },
              { name: 'TrainingPrograms', key: 'trainingPrograms', desc: 'Skills & Courses' },
            ].map((col) => (
              <div key={col.name} className="p-3 rounded-lg border border-slate-100 bg-white hover:border-indigo-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900">{col.name}</span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    {data?.database.counts?.[col.key] ?? '—'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{col.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Config Notes */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs space-y-2 text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>MERN Stack Production Compliance</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            StaffSync uses standard <strong>bcrypt</strong> password hashing with salted rounds, and signs all authorization headers using <strong>HMAC SHA-256 JWT</strong> tokens. Duplicate attendance is guarded by database unique indexes.
          </p>
          <div className="pt-2 border-t border-indigo-100/60 flex flex-wrap gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-500" /> Express 4.21 REST API
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" /> Mongoose 9.1 ODM
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </Modal>
  );
};
