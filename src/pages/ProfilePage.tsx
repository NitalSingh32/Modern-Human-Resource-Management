import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const emp = user?.employee;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: emp?.phone || '',
    street: emp?.address?.street || '',
    city: emp?.address?.city || '',
    state: emp?.address?.state || '',
    zipCode: emp?.address?.zipCode || '',
    country: emp?.address?.country || 'USA',
    emergencyName: emp?.emergencyContact?.name || '',
    emergencyRelation: emp?.emergencyContact?.relation || '',
    emergencyPhone: emp?.emergencyContact?.phone || '',
    skillsInput: emp?.skills ? emp.skills.join(', ') : '',
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emp?._id) return;
    setSaving(true);
    try {
      const skills = formData.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateEmployee(emp._id, {
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        emergencyContact: {
          name: formData.emergencyName,
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
        skills,
      });

      setNotice({ type: 'success', text: 'Personal details updated successfully.' });
      setEditModalOpen(false);
      await refreshUser();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Profile & Settings</h2>
          <p className="text-xs text-slate-500">
            Account identity, corporate assignment, permitted contact details, and emergency contacts
          </p>
        </div>

        <button
          onClick={() => setEditModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          Edit Personal Info
        </button>
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

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
            alt={user?.name || 'Avatar'}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md shrink-0"
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h3>
                <p className="text-sm font-semibold text-indigo-600">{emp?.designation || 'Staff Member'}</p>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'manager' ? 'blue' : 'emerald'}>
                  {user?.role === 'admin' ? 'HR Administrator' : user?.role === 'manager' ? 'Manager' : 'Employee'}
                </Badge>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {emp?.employeeCode || 'EMP-1003'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {emp?.phone || '+1 (555) 000-0000'}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {emp?.department || 'Engineering'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Joined: {emp?.joiningDate || '2023-01-15'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Residential Address */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Residential Address
            </span>
            <p className="text-slate-700 font-medium">{emp?.address?.street || '742 Evergreen Terrace'}</p>
            <p className="text-slate-600">
              {emp?.address?.city || 'San Francisco'}, {emp?.address?.state || 'CA'} {emp?.address?.zipCode || '94107'}
            </p>
            <p className="text-slate-500">{emp?.address?.country || 'United States'}</p>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-500" /> Emergency Contact
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Person:</span>
              <span className="font-bold text-slate-900">{emp?.emergencyContact?.name || 'Family Contact'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Relationship:</span>
              <span className="font-semibold text-slate-800">{emp?.emergencyContact?.relation || 'Spouse'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Emergency Phone:</span>
              <span className="font-mono font-bold text-slate-900">{emp?.emergencyContact?.phone || '+1 (555) 234-8909'}</span>
            </div>
          </div>
        </div>

        {/* Skills & Badges */}
        {emp?.skills && emp.skills.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-100">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" /> Certified Skills & Competencies
            </span>
            <div className="flex flex-wrap gap-2">
              {emp.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Permitted Profile Information"
        description="Update your phone number, home address, emergency contacts, and professional skills."
        maxWidth="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Residential Address</label>
            <input
              type="text"
              placeholder="Street address"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-2"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="State / Region"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Emergency Contact Details</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Spouse)"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Emergency Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
