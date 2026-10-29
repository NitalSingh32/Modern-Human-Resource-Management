import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrainingProgram, Employee } from '../types';

export const TrainingPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManage = isAdmin || isManager;

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    department: 'Engineering',
    startDate: '',
    endDate: '',
    category: 'Technical Engineering',
    enrolledEmployeeIds: [] as string[],
  });

  // Progress update modal
  const [progressModal, setProgressModal] = useState<{
    programId: string;
    employeeId: string;
    employeeName: string;
    currentPercent: number;
  } | null>(null);
  const [newPercent, setNewPercent] = useState<number>(0);

  const loadData = async () => {
    try {
      const [trns, emps] = await Promise.all([
        api.getTrainingPrograms(),
        api.getEmployees(),
      ]);
      setPrograms(trns);
      setEmployees(emps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createTrainingProgram(formData);
      setNotice({ type: 'success', text: `Training program "${formData.title}" created.` });
      setAddModalOpen(false);
      setFormData({
        title: '',
        description: '',
        instructor: '',
        department: 'Engineering',
        startDate: '',
        endDate: '',
        category: 'Technical Engineering',
        enrolledEmployeeIds: [],
      });
      await loadData();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Creation failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!progressModal) return;
    try {
      const isCompleted = newPercent >= 100;
      await api.updateTrainingProgress(progressModal.programId, {
        employeeId: progressModal.employeeId,
        progressPercent: newPercent,
        status: isCompleted ? 'Completed' : newPercent > 0 ? 'In Progress' : 'Not Started',
      });

      if (isCompleted) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {
          // no-op
        }
        setNotice({ type: 'success', text: `Course marked as completed for ${progressModal.employeeName}! 🎉` });
      } else {
        setNotice({ type: 'success', text: `Progress updated to ${newPercent}%.` });
      }

      setProgressModal(null);
      await loadData();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update progress' });
    }
  };

  const toggleEmployeeEnroll = (id: string) => {
    setFormData((prev) => {
      const exists = prev.enrolledEmployeeIds.includes(id);
      return {
        ...prev,
        enrolledEmployeeIds: exists
          ? prev.enrolledEmployeeIds.filter((e) => e !== id)
          : [...prev.enrolledEmployeeIds, id],
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Training & Skill Development</h2>
          <p className="text-xs text-slate-500">
            Upskilling curricula, compliance workshops, and team learning trajectories
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Training Program
          </button>
        )}
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

      {/* Program Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading training programs...
          </div>
        ) : (
          programs.map((prog) => (
            <div
              key={prog._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        prog.status === 'Completed'
                          ? 'emerald'
                          : prog.status === 'In Progress'
                          ? 'indigo'
                          : 'slate'
                      }
                    >
                      {prog.status}
                    </Badge>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {prog.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {prog.startDate} to {prog.endDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{prog.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{prog.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Instructor:</span>
                    <span className="font-semibold text-slate-800">{prog.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department Scope:</span>
                    <span className="font-semibold text-indigo-600">{prog.department}</span>
                  </div>
                </div>

                {/* Enrolled participants & Progress */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-500" /> Enrolled Staff ({prog.enrolledEmployees?.length || 0})
                  </span>

                  <div className="space-y-2">
                    {(prog.enrolledEmployees || []).map((member) => (
                      <div
                        key={member.employeeId}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={member.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={member.employeeName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-800">{member.employeeName}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">({member.status})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-slate-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${member.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-indigo-600 w-8 text-right">
                            {member.progressPercent}%
                          </span>

                          {(canManage || member.employeeId === user?.employeeId) && (
                            <button
                              onClick={() => {
                                setProgressModal({
                                  programId: prog._id,
                                  employeeId: member.employeeId,
                                  employeeName: member.employeeName,
                                  currentPercent: member.progressPercent,
                                });
                                setNewPercent(member.progressPercent);
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Progress Modal */}
      <Modal
        isOpen={!!progressModal}
        onClose={() => setProgressModal(null)}
        title="Update Course Completion Progress"
        maxWidth="sm"
      >
        {progressModal && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Updating progress for <strong>{progressModal.employeeName}</strong>:
            </p>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-bold">
                <span>Progress Percentage:</span>
                <span className="text-base text-indigo-600 font-mono">{newPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newPercent}
                onChange={(e) => setNewPercent(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Not Started)</span>
                <span>50% (In Progress)</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setProgressModal(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Save Progress
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Training Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Design Training Program"
        description="Launch an upskilling module and assign cohort members."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Microservices Architecture with Node & Docker"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Trainer *</label>
              <input
                type="text"
                required
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="e.g. Dr. Jordan Bell"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Cloud Security"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Curriculum overview and learning objectives..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Employees to Enroll
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
              {employees.map((emp) => {
                const isSelected = formData.enrolledEmployeeIds.includes(emp._id);
                return (
                  <label
                    key={emp._id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                      isSelected ? 'bg-indigo-50 border border-indigo-200 font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEmployeeEnroll(emp._id)}
                        className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{emp.department}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Launch Training'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
