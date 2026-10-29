import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Normal' as 'Normal' | 'Important' | 'Urgent',
    targetDepartment: 'All',
    pinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      const list = await api.getAnnouncements();
      setAnnouncements(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAnnouncement(formData);
      setNotice({ type: 'success', text: 'Announcement published to bulletin board.' });
      setAddModalOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: 'Normal',
        targetDepartment: 'All',
        pinned: false,
      });
      await loadAnnouncements();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Publish failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      setNotice({ type: 'success', text: 'Announcement removed.' });
      await loadAnnouncements();
    } catch (err: unknown) {
      setNotice({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  const filtered = announcements.filter((a) => {
    if (priorityFilter !== 'All' && a.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Notice Board</h2>
          <p className="text-xs text-slate-500">
            Company-wide broadcasts, policy updates, events, and essential announcements
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
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

      {/* Priority Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        {['All', 'Urgent', 'Important', 'Normal'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              priorityFilter === p
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Feed list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading notices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No announcements match this filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                item.pinned
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      <Pin className="w-3 h-3 fill-indigo-600" /> Pinned
                    </span>
                  )}
                  <Badge
                    variant={
                      item.priority === 'Urgent'
                        ? 'rose'
                        : item.priority === 'Important'
                        ? 'purple'
                        : 'blue'
                    }
                  >
                    {item.priority} Priority
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    Target: <strong className="text-slate-600">{item.targetDepartment}</strong>
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Posted by <strong className="text-slate-700">{item.authorName}</strong> ({item.authorRole})
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.postedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Announcement Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Broadcast Company Announcement"
        description="Share official updates with all staff or specific teams."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q4 Townhall & Benefits Update"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as 'Normal' | 'Important' | 'Urgent' })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="All">All Staff (Company-wide)</option>
                <option value="Engineering">Engineering Only</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body / Message *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full details of the announcement..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="pinned" className="text-xs text-slate-700 font-semibold cursor-pointer">
              Pin to top of bulletin feed
            </label>
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
              {saving ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
