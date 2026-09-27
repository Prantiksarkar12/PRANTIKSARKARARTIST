import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  Send,
  Users,
  Music,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowRight,
  MessageSquare,
  History,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Phone,
  Globe,
  Radio,
  Tv,
} from 'lucide-react';
import { useRealtimeData } from '../../../hooks/useRealtimeData';
import { labelService, OFFICIAL_LABEL_EMAIL } from '../../../services/labelInviteService';
import {
  LabelApplication,
  LabelApplicationStatus,
  LabelInvitationStatus,
  LabelPaymentStatus,
  LabelApplicationNote,
  LabelApplicationContact,
} from '../../../types';

interface AdminLabelApplicationsProps {
  initialSelectedAppId?: string | null;
  onSelectApplication?: (id: string | null) => void;
}

export const AdminLabelApplications: React.FC<AdminLabelApplicationsProps> = ({
  initialSelectedAppId,
  onSelectApplication,
}) => {
  const { labelApplications, labelCapacity } = useRealtimeData();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(initialSelectedAppId || null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Action States
  const [actionNotice, setActionNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Direct Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New Note
  const [newNoteText, setNewNoteText] = useState('');
  const [noteIsInternal, setNoteIsInternal] = useState(true);

  // Filtered List
  const filteredApps = labelApplications.filter((app) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      app.application_status === statusFilter ||
      app.payment_status === statusFilter ||
      app.invitation_status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.primary_genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const selectedApp = selectedAppId
    ? labelApplications.find((a) => a.id === selectedAppId) || null
    : null;

  const notes = selectedApp ? labelService.getApplicationNotes(selectedApp.id) : [];
  const contacts = selectedApp ? labelService.getApplicationContacts(selectedApp.id) : [];
  const statusHistory = selectedApp ? labelService.getApplicationStatusHistory(selectedApp.id) : [];
  const auditLogs = selectedApp ? labelService.getApplicationAuditLogs(selectedApp.id) : [];
  const emails = selectedApp ? labelService.getApplicationEmails(selectedApp.id) : [];

  const handleSelectApp = (id: string | null) => {
    setSelectedAppId(id);
    if (onSelectApplication) onSelectApplication(id);
    setActionNotice('');
    setErrorNotice('');
  };

  // Actions
  const handleApprove = () => {
    if (!selectedApp) return;
    setErrorNotice('');
    const res = labelService.approveArtistApplication(selectedApp.id, 'Prantik Sarkar (Owner)');
    if (res.success) {
      setActionNotice(`Artist ${selectedApp.artist_name} officially APPROVED and onboarded to active roster.`);
    } else {
      setErrorNotice(res.error || 'Approval failed.');
    }
  };

  const handleReject = () => {
    if (!selectedApp) return;
    const reason = prompt('Enter rejection feedback or internal reason (optional):');
    const res = labelService.updateApplicationStatus(
      selectedApp.id,
      'REJECTED',
      reason || 'Not aligned with label direction at this time.',
      'Prantik Sarkar (Owner)'
    );
    if (res.success) {
      setActionNotice(`Application ${selectedApp.id} marked as REJECTED.`);
    }
  };

  const handleWaitlist = () => {
    if (!selectedApp) return;
    const res = labelService.updateApplicationStatus(
      selectedApp.id,
      'WAITLISTED',
      'Placed on prioritized waitlist due to current roster capacity.',
      'Prantik Sarkar (Owner)'
    );
    if (res.success) {
      setActionNotice(`Application ${selectedApp.id} moved to WAITLIST.`);
    }
  };

  const handleRequestMoreInfo = () => {
    if (!selectedApp) return;
    const questions = prompt('Specify what additional information or materials are required:');
    if (!questions) return;
    const res = labelService.updateApplicationStatus(
      selectedApp.id,
      'MORE_INFORMATION_REQUIRED',
      questions,
      'Prantik Sarkar (Owner)'
    );
    if (res.success) {
      setActionNotice(`Requested more information for application ${selectedApp.id}. Email notification sent.`);
    }
  };

  const handleInvite = () => {
    if (!selectedApp) return;
    const res = labelService.inviteApplicant(
      selectedApp.id,
      ['Music Distribution', 'Video Distribution', 'VEVO Services'],
      'Invitation issued via Admin Application Review',
      'Prantik Sarkar (Owner)'
    );
    if (res.success && res.invitation) {
      setActionNotice(`Official invitation token ${res.invitation.token} issued to ${selectedApp.email}.`);
    } else {
      setErrorNotice(res.error || 'Failed to issue invitation.');
    }
  };

  const handleWithdraw = () => {
    if (!selectedApp) return;
    labelService.updateApplicationStatus(selectedApp.id, 'WITHDRAWN', 'Withdrawn by admin.', 'Prantik Sarkar (Owner)');
    setActionNotice(`Application ${selectedApp.id} marked as WITHDRAWN.`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNoteText.trim()) return;
    labelService.addApplicationNote(selectedApp.id, newNoteText.trim(), 'Prantik Sarkar (Owner)', OFFICIAL_LABEL_EMAIL, noteIsInternal);
    setNewNoteText('');
    setActionNotice('Internal note recorded.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      const res = labelService.sendAdminReply(
        selectedApp.id,
        replySubject || `Regarding Your Application — PRANTIK SARKAR ARTIST RECORD | ${selectedApp.id}`,
        replyBody.trim(),
        'Prantik Sarkar (Owner)'
      );
      if (res.success) {
        setActionNotice(`Official dispatch sent from ${OFFICIAL_LABEL_EMAIL} to ${selectedApp.email}.`);
        setReplyModalOpen(false);
        setReplyBody('');
        setReplySubject('');
      } else {
        setErrorNotice(res.error || 'Failed to send message.');
      }
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: LabelApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">SUBMITTED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">UNDER REVIEW</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">APPROVED</span>;
      case 'WAITLISTED':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">WAITLISTED</span>;
      case 'MORE_INFORMATION_REQUIRED':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">MORE INFO REQ</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">REJECTED</span>;
      case 'WITHDRAWN':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-white/10">WITHDRAWN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Capacity */}
      <div className="p-6 bg-[#0b0b12] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-white uppercase tracking-tight">
              Artist Application Review Center
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              PRANTIK SARKAR ARTIST RECORD
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Official invite-only application queue, curatorial review, and transactional communications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono">
            <span className="text-zinc-500">Roster Capacity: </span>
            <strong className="text-emerald-400">{labelCapacity.current_active_artists}</strong>
            <span className="text-zinc-500"> / {labelCapacity.maximum_active_artists} Approved</span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-xs text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice('')} className="text-xs text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: List on Left, Selected App on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applications List (4 cols) */}
        <div className="lg:col-span-4 bg-[#0b0b12] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, Artist, City..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SUBMITTED', label: 'Submitted' },
                { id: 'UNDER_REVIEW', label: 'Review' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'WAITLISTED', label: 'Waitlist' },
                { id: 'REJECTED', label: 'Rejected' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === f.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Entries */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredApps.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No applications matching filter.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedAppId === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-lg'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-rose-400">{app.id}</span>
                      {getStatusBadge(app.application_status)}
                    </div>

                    <div>
                      <div className="font-bold text-white text-xs">{app.artist_name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{app.full_name} • {app.primary_genre}</div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/5">
                      <span>{app.city}, {app.country}</span>
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Application View (8 cols) */}
        <div className="lg:col-span-8 bg-[#0b0b12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          {!selectedApp ? (
            <div className="p-16 text-center text-zinc-500 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="font-bold text-white text-base">Select an Application</h3>
              <p className="text-xs max-w-sm mx-auto">
                Choose an application dossier from the left sidebar to examine credentials, streaming links, and perform admin actions.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Dossier Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-rose-400">{selectedApp.id}</span>
                    {getStatusBadge(selectedApp.application_status)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-white/10">
                      Invite: {selectedApp.invitation_status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-white/10">
                      Payment: {selectedApp.payment_status}
                    </span>
                  </div>

                  <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1.5">
                    {selectedApp.artist_name}
                  </h1>
                  <p className="text-xs text-zinc-400">
                    Legal Name: <strong className="text-white">{selectedApp.full_name}</strong> • Submitted: {new Date(selectedApp.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setReplySubject(`Regarding Application ${selectedApp.id} — PRANTIK SARKAR ARTIST RECORD`);
                      setReplyModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>Contact</span>
                  </button>

                  {selectedApp.invitation_status !== 'INVITED' && selectedApp.invitation_status !== 'ACCEPTED' && (
                    <button
                      onClick={handleInvite}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Issue Invite</span>
                    </button>
                  )}

                  {selectedApp.application_status !== 'APPROVED' && (
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={handleWaitlist}
                    className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-purple-200 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Waitlist
                  </button>

                  <button
                    onClick={handleRequestMoreInfo}
                    className="px-3 py-2 bg-orange-900/60 hover:bg-orange-800 border border-orange-500/30 text-orange-200 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Request Info
                  </button>

                  <button
                    onClick={handleReject}
                    className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Sections Breakdown Grid */}
              <div className="space-y-6 text-xs">
                {/* 1. Contact & Identity (Section A & 3) */}
                <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-white uppercase text-xs text-rose-400 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Contact & Artist Identity</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block">Email</span>
                      <a href={`mailto:${selectedApp.email}`} className="text-white hover:text-rose-400 font-mono font-semibold">
                        {selectedApp.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Phone</span>
                      <span className="text-white font-mono">{selectedApp.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">WhatsApp</span>
                      <span className="text-white font-mono">{selectedApp.whatsapp || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Location</span>
                      <span className="text-white">{selectedApp.city}, {selectedApp.country}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Artist Type</span>
                      <span className="text-white font-semibold">{selectedApp.artist_type}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Primary Genre</span>
                      <span className="text-white font-semibold">{selectedApp.primary_genre}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Started Year</span>
                      <span className="text-white">{selectedApp.started_making_music_year}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Preferred Contact</span>
                      <span className="text-amber-400 font-semibold">{selectedApp.preferred_contact_method}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Artist Bio & Vision</span>
                    <p className="text-zinc-300 text-xs leading-relaxed mt-1">
                      {selectedApp.artist_bio}
                    </p>
                  </div>
                </div>

                {/* 2. Streaming Profiles (Section 4) */}
                <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-white uppercase text-xs text-rose-400 flex items-center gap-2">
                    <Music className="w-3.5 h-3.5" />
                    <span>Streaming Profiles & Social Presence</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedApp.spotify_url && (
                      <a href={selectedApp.spotify_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold">
                        <span>Spotify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApp.apple_music_url && (
                      <a href={selectedApp.apple_music_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-pink-400 hover:text-pink-300 flex items-center gap-1.5 font-bold">
                        <span>Apple Music</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApp.youtube_url && (
                      <a href={selectedApp.youtube_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-red-400 hover:text-red-300 flex items-center gap-1.5 font-bold">
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApp.instagram_url && (
                      <a href={selectedApp.instagram_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-purple-400 hover:text-purple-300 flex items-center gap-1.5 font-bold">
                        <span>Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApp.portfolio_url && (
                      <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-bold">
                        <span>Portfolio / Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApp.epk_url && (
                      <a href={selectedApp.epk_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-bold">
                        <span>EPK Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. Music Experience & Distribution (Section 5 & 6) */}
                <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-white uppercase text-xs text-rose-400 flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Music Experience & Distribution Details</span>
                  </h3>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500 font-semibold block">Type of music created:</span>
                      <p className="text-zinc-200 mt-0.5">{selectedApp.music_type_description}</p>
                    </div>
                    {selectedApp.artistic_influences && (
                      <div>
                        <span className="text-zinc-500 font-semibold block">Influences:</span>
                        <p className="text-zinc-300">{selectedApp.artistic_influences}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-zinc-500 block">Masters Quality</span>
                        <span className="text-white font-bold">{selectedApp.professional_quality_masters}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Rights Ownership</span>
                        <span className="text-white font-bold">{selectedApp.rights_ownership}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Prev Distributed</span>
                        <span className="text-white">{selectedApp.previously_distributed}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Desired Frequency</span>
                        <span className="text-white">{selectedApp.desired_release_frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Services Requested & Why PSAR (Section 7 & 12) */}
                <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-white uppercase text-xs text-rose-400 flex items-center gap-2">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Requested Label Services & Statement of Intent</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedApp.services_interest || {})
                      .filter(([k, v]) => v === true && !k.endsWith('_details'))
                      .map(([k]) => (
                        <span key={k} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-white font-mono text-[10px]">
                          ✓ {k.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ))}
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Why they want to work with PSAR:</span>
                    <p className="text-zinc-200 leading-relaxed">{selectedApp.why_work_with_psar}</p>
                  </div>
                </div>

                {/* 5. Direct Communications & Status History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Internal Notes */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Internal Notes ({notes.length})</span>
                      </span>
                    </div>

                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={2}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add internal A&R review note..."
                        className="w-full p-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-[11px]"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <input
                            type="checkbox"
                            checked={noteIsInternal}
                            onChange={(e) => setNoteIsInternal(e.target.checked)}
                            className="rounded text-rose-600"
                          />
                          <span>Internal Only</span>
                        </label>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notes.map((n) => (
                        <div key={n.id} className="p-2.5 bg-zinc-900 rounded-lg border border-white/5 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span className="font-bold text-zinc-300">{n.author_name}</span>
                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-zinc-300">{n.note_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit & Email History */}
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-3">
                    <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Official Communications & Audit Trail</span>
                    </span>

                    <div className="space-y-2 max-h-60 overflow-y-auto text-[10px] font-mono">
                      {emails.map((e) => (
                        <div key={e.id} className="p-2 bg-zinc-900 rounded border border-white/5 space-y-0.5">
                          <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-emerald-400 font-bold">DISPATCH: {e.template_type}</span>
                            <span>{new Date(e.sent_at).toLocaleDateString()}</span>
                          </div>
                          <div className="text-zinc-200 truncate">{e.subject}</div>
                          <div className="text-zinc-500">From: {e.from_email} • Status: {e.delivery_status}</div>
                        </div>
                      ))}

                      {auditLogs.map((a) => (
                        <div key={a.id} className="p-2 bg-black/60 rounded border border-white/5 text-zinc-400 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-rose-400">{a.action}</span>
                            <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-zinc-500">{a.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct Reply / Message Modal */}
      {replyModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0b12] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">
                  Direct Applicant Communication
                </h3>
                <p className="text-xs text-zinc-400">
                  Sending from official label email: <strong className="text-rose-400 font-mono">{OFFICIAL_LABEL_EMAIL}</strong>
                </p>
              </div>
              <button onClick={() => setReplyModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">To</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedApp.artist_name} <${selectedApp.email}>`}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Official Message Body</label>
                <textarea
                  required
                  rows={5}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Compose official label communication..."
                  className="w-full p-3 bg-zinc-900 border border-white/15 rounded-xl text-white leading-relaxed"
                />
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 text-[11px] text-zinc-500">
                This dispatch will be routed via the official record label email system and logged in the application audit history.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingReply ? 'Transmitting...' : 'Send Official Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
