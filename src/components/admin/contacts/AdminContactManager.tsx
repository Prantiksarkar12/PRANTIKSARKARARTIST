import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { ContactDepartment } from '../../../types';
import { db } from '../../../services/db';

interface AdminContactManagerProps {
  departments: ContactDepartment[];
}

export const AdminContactManager: React.FC<AdminContactManagerProps> = ({ departments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<ContactDepartment | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    department_key: string;
    title: string;
    email: string;
    description: string;
    display_order: number;
    is_active: boolean;
  }>({
    department_key: '',
    title: '',
    email: '',
    description: '',
    display_order: 1,
    is_active: true,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    showNotification(`Copied ${email} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      department_key: '',
      title: '',
      email: '',
      description: '',
      display_order: departments.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: ContactDepartment) => {
    setEditingDept(dept);
    setFormData({
      id: dept.id,
      department_key: dept.department_key,
      title: dept.title,
      email: dept.email,
      description: dept.description || '',
      display_order: dept.display_order ?? 1,
      is_active: dept.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.email.trim()) return;

    db.saveContactDepartment(formData);
    setIsModalOpen(false);
    showNotification(
      editingDept
        ? `Updated contact department "${formData.title}".`
        : `Added new contact department "${formData.title}".`
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove department "${title}"?`)) {
      db.deleteContactDepartment(id);
      showNotification(`Deleted contact department "${title}".`);
    }
  };

  const handleToggleActive = (dept: ContactDepartment) => {
    db.saveContactDepartment({
      ...dept,
      is_active: !dept.is_active,
    });
    showNotification(`${!dept.is_active ? 'Activated' : 'Deactivated'} ${dept.title}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-zinc-900 border border-rose-500/50 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest mb-1 font-mono">
            <Mail className="w-4 h-4" />
            <span>Admin → Contact Information</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Prantik Sarkar Artist Contacts
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-light">
            Configure direct departmental email inboxes for Booking, Licensing, Collaborations, Sponsorships, Promotion, and Copyright.
            You can add new contact categories and email addresses anytime to customize how inquiries reach management.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Contact Type</span>
        </button>
      </div>

      {/* Contact Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className={`p-5 rounded-xl border transition-all ${
              dept.is_active
                ? 'bg-zinc-950/80 border-white/10 hover:border-white/20'
                : 'bg-zinc-950/40 border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">#{dept.display_order}</span>
                  <h3 className="font-display font-bold text-base text-white uppercase tracking-tight">
                    {dept.title}
                  </h3>
                  <button
                    onClick={() => handleToggleActive(dept)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer ${
                      dept.is_active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {dept.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>
                {dept.description && (
                  <p className="text-xs text-zinc-400 font-light line-clamp-2">
                    {dept.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Edit Department"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(dept.id, dept.title)}
                  className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Department"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Address & Actions */}
            <div className="p-3 rounded-lg bg-zinc-900/90 border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs font-mono font-medium text-rose-300 truncate">
                  {dept.email}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyEmail(dept.email, dept.id)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId === dept.id ? 'Copied!' : 'Copy'}</span>
                </button>
                <a
                  href={`mailto:${dept.email}`}
                  className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Compose email"
                >
                  <Send className="w-3 h-3" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0e14] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest block font-bold">
                Admin → Contact Information
              </span>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                {editingDept ? `Edit ${editingDept.title}` : 'Add New Contact Category'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Department Name / Contact Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Booking & Licensing, Collaborations, Sponsorships"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Target Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. prantiksarkarartist@hotmail.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                  Description / Instructions for Senders (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what inquiries belong here..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dept_is_active"
                        checked={formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: true })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dept_is_active"
                        checked={!formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: false })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Disabled</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-colors"
                >
                  Save Contact Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
