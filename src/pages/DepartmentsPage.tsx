import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, DollarSign, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Department } from '../types';

export const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    budget: 150000,
    designationInput: '',
  });

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const designations = formData.designationInput
        ? formData.designationInput.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Specialist', 'Associate', 'Lead'];

      await api.createDepartment({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        headOfDepartment: formData.headOfDepartment || 'Unassigned',
        budget: Number(formData.budget),
        designations,
      });

      setNotice({ type: 'success', text: `Department "${formData.name}" established successfully.` });
      setAddModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        budget: 150000,
        designationInput: '',
      });
      await loadDepartments();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Creation failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Departments & Designations</h2>
          <p className="text-xs text-slate-500">
            Organizational hierarchy, functional business units, and assigned leadership
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Department
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

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading departments...
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center font-mono text-xs">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                      <p className="text-[11px] text-slate-400">Head: {dept.headOfDepartment}</p>
                    </div>
                  </div>
                  <Badge variant="indigo">{dept.employeeCount || 0} Staff</Badge>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {dept.description || 'Organizational department supporting business core functions.'}
                </p>

                {/* Designations list */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-indigo-500" /> Active Job Designations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(dept.designations || []).map((des) => (
                      <span
                        key={des}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-[10px] font-medium text-slate-700"
                      >
                        {des}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-mono text-slate-800 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  ${dept.budget?.toLocaleString() || '100,000'} / yr
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">Active Unit</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Establish New Corporate Department"
        description="Define department name, code, leadership and allowed job titles."
        maxWidth="md"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Data Science & AI"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code (2-4 letters) *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. DSAI"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Head of Department</label>
            <input
              type="text"
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              placeholder="e.g. Dr. Jonathan Hayes"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Budget ($)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Primary responsibilities and domain focus..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designations (comma-separated)
            </label>
            <input
              type="text"
              value={formData.designationInput}
              onChange={(e) => setFormData({ ...formData, designationInput: e.target.value })}
              placeholder="Senior Scientist, ML Engineer, Data Analyst"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
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
              {saving ? 'Creating...' : 'Establish Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
