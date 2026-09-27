import React, { useState } from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Disc,
  Film,
  BookOpen,
  Newspaper,
  Bell,
  Activity,
  Calendar,
  MessageSquare,
  Shield,
  Eye,
  Sliders,
  LogOut,
  ArrowLeft,
  Search,
  ExternalLink,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Lock,
  Smartphone,
  Laptop,
  Check,
  Plus,
  Send,
  Sparkles,
  Bot,
  Coins,
  Gift,
  LifeBuoy,
  Users,
} from 'lucide-react';
import { User, Release, Video, Post, PressArticle, Notification, UserSession, UserActivity, Conversation } from '../types';
import { db } from '../services/db';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useAudio } from '../context/AudioContext';
import { Artwork } from '../components/common/ArtworkPlaceholder';
import { UserAiChat } from '../components/user/ai/UserAiChat';
import { UserWalletView } from '../components/user/wallet/UserWalletView';
import { UserRewardsView } from '../components/user/rewards/UserRewardsView';
import { UserSupportCenter } from '../components/user/support/UserSupportCenter';
import { UserReferralsView } from '../components/user/referrals/UserReferralsView';
import { PrantikChatWorkspace } from '../components/chat/PrantikChatWorkspace';
import { prantikChat } from '../services/prantikChatService';

export type UserStudioTab =
  | 'overview'
  | 'chat'
  | 'ai'
  | 'wallet'
  | 'rewards'
  | 'support'
  | 'referrals'
  | 'ai_usage'
  | 'profile'
  | 'music'
  | 'videos'
  | 'posts'
  | 'press'
  | 'notifications'
  | 'activity'
  | 'bookings'
  | 'messages'
  | 'security'
  | 'privacy'
  | 'settings';

interface UserStudioProps {
  currentUser: User;
  initialTab?: UserStudioTab;
  initialConversationId?: string;
  onBackToSite: () => void;
  onLogout: () => void;
  onOpenReleaseModal: (release: Release) => void;
  onPlayVideo: (video: Video) => void;
  onReadPost: (post: Post) => void;
  onOpenBookingModal: () => void;
}

export const UserStudio: React.FC<UserStudioProps> = ({
  currentUser,
  initialTab = 'overview',
  initialConversationId,
  onBackToSite,
  onLogout,
  onOpenReleaseModal,
  onPlayVideo,
  onReadPost,
  onOpenBookingModal,
}) => {
  const [activeTab, setActiveTab] = useState<UserStudioTab>(initialTab);
  const [notice, setNotice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Context
  const { playTrack, currentTrack, isPlaying } = useAudio();

  // Real-time hooks
  const { releases, videos, posts, press } = useRealtimeData();

  // User-specific database queries (NO FAKE DATA)
  const savedReleases = db.getSavedReleases(currentUser.id);
  const savedVideos = db.getSavedVideos(currentUser.id);
  const savedPosts = db.getSavedPosts(currentUser.id);
  const savedPress = db.getSavedPress(currentUser.id);
  const userNotifications = db.getUserNotifications(currentUser.id);
  const userSessions = db.getUserSessions(currentUser.id);
  const userActivities = db.getUserActivities(currentUser.id);
  const loginEvents = db.getUserLoginEvents(currentUser.id);
  const userBookings = db.getUserBookings(currentUser.id, currentUser.email);
  const userConversations = db.getUserConversations(currentUser.id);

  // Forms state
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    username: currentUser.username || '',
    email: currentUser.email,
    bio: currentUser.bio || '',
    country: currentUser.country || 'India',
    phone: currentUser.phone || '',
    avatar_url: currentUser.avatar_url || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifPrefs, setNotifPrefs] = useState(currentUser.notification_preferences);
  const [privacyPrefs, setPrivacyPrefs] = useState(currentUser.privacy_settings);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newConvSubject, setNewConvSubject] = useState('');
  const [newConvMessage, setNewConvMessage] = useState('');
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteChallenge, setDeleteChallenge] = useState('');

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.updateUserProfile(profileForm);
      showToast('Profile information updated successfully.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }
    try {
      db.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed securely.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Password update failed.');
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = db.exportUserData(currentUser.id);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prantik_sarkar_user_data_${currentUser.username || 'export'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Personal data bundle exported.');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Export failed');
    }
  };

  const handleDeleteAccount = () => {
    if (deleteChallenge !== currentUser.email) {
      showToast('Please type your exact email to confirm deletion.');
      return;
    }
    try {
      db.deleteAccount(currentUser.id);
      onLogout();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Deletion failed');
    }
  };

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConvSubject || !newConvMessage) return;
    const conv = db.createConversation(currentUser.id, newConvSubject, newConvMessage);
    setShowNewConvModal(false);
    setNewConvSubject('');
    setNewConvMessage('');
    setSelectedConversation(conv);
    showToast('Inquiry thread opened with artist management.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyText.trim()) return;
    db.sendConversationReply(selectedConversation.id, replyText.trim(), 'user');
    setReplyText('');
    const updated = db.getUserConversations(currentUser.id).find((c) => c.id === selectedConversation.id);
    if (updated) setSelectedConversation(updated);
    showToast('Message transmitted.');
  };

  const unreadCount = userNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col pt-16">
      {/* User Studio Header */}
      <header className="bg-[#0b0b10] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Website</span>
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <h1 className="font-display font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
            PRANTIK SARKAR <span className="text-rose-500 text-xs font-semibold ml-1">USER STUDIO</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {notice && (
            <span className="text-xs bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1 rounded animate-in fade-in">
              {notice}
            </span>
          )}

          {/* Quick Notification Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full" />
            )}
          </button>

          {/* Profile pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center text-xs font-bold text-rose-300">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-zinc-300 font-medium hidden md:inline truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg mb-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Authenticated Portal</p>
            <p className="text-xs text-white font-medium truncate mt-0.5">{currentUser.email}</p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Role:</span>
              <span className="text-rose-400 font-bold">{currentUser.role}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          {/* AI & VIRTUAL CREDIT CORE SERVICES */}
          <div className="pt-2 pb-1">
            <p className="px-3.5 text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono">
              AI Support & Wallet
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'ai' || activeTab === 'ai_usage' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-rose-400" />
              <span>PRANTIK AI</span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
              FREE 24H
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'wallet' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Wallet & Coins</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'rewards' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Daily Rewards & Spin</span>
            </div>
            <span className="text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
              SPIN
            </span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'support' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-blue-400" />
            <span>Support Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'referrals' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Fan Referrals</span>
            </div>
            <span className="text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
              +1 MIN
            </span>
          </button>

          <div className="pt-2 pb-1">
            <p className="px-3.5 text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono">
              Account & Library
            </p>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'music' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Disc className="w-4 h-4" />
              <span>My Music</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{savedReleases.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'videos' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4" />
              <span>My Videos</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{savedVideos.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'posts' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Saved Posts</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{savedPosts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('press')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'press' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4" />
              <span>Saved Press</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{savedPress.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'notifications' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono bg-rose-600 text-white px-1.5 py-0.5 rounded">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'activity' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'bookings' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{userBookings.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'chat' || activeTab === 'messages' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              <span>PRANTIK Chat</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'security' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Center</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Privacy & Data</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={onLogout}
              className="w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 bg-[#0b0b10] border border-white/10 rounded-xl p-6 sm:p-8 min-h-[650px] shadow-2xl">
          {/* TAB: PRANTIK AI SUPPORT CHAT */}
          {activeTab === 'ai' && (
            <UserAiChat
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
            />
          )}

          {/* TAB: AI USAGE HISTORY */}
          {activeTab === 'ai_usage' && (
            <UserAiChat
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
              initialUsageView={true}
            />
          )}

          {/* TAB: WALLET & COINS */}
          {activeTab === 'wallet' && (
            <UserWalletView
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
            />
          )}

          {/* TAB: DAILY REWARDS & LUCKY ROLL */}
          {activeTab === 'rewards' && (
            <UserRewardsView
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
            />
          )}

          {/* TAB: SUPPORT DESK */}
          {activeTab === 'support' && (
            <UserSupportCenter
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
            />
          )}

          {/* TAB: FAN REFERRALS */}
          {activeTab === 'referrals' && (
            <UserReferralsView
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as UserStudioTab)}
            />
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">
                  Welcome, {currentUser.name}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage your personal library, tour bookings, direct messages, and security credentials.
                </p>
              </div>

              {/* PRANTIK AI & WALLET SPOTLIGHT BANNER */}
              <div className="p-5 bg-gradient-to-r from-rose-950/40 via-zinc-950 to-amber-950/30 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm text-white uppercase">PRANTIK AI • PORTAL ASSISTANT</h3>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                        FREE 24H RESET
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Need help with music, concert dates, booking inquiries, or account settings? Ask PRANTIK AI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Open AI Chat</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wallet</span>
                  </button>
                </div>
              </div>

              {/* Real calculated statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saved Releases</p>
                  <p className="text-3xl font-display font-black text-white">{savedReleases.length}</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saved Videos</p>
                  <p className="text-3xl font-display font-black text-white">{savedVideos.length}</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saved Posts</p>
                  <p className="text-3xl font-display font-black text-white">{savedPosts.length}</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Saved Press</p>
                  <p className="text-3xl font-display font-black text-white">{savedPress.length}</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Unread Notifications</p>
                  <p className="text-3xl font-display font-black text-rose-500">{unreadCount}</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Active Sessions</p>
                  <p className="text-3xl font-display font-black text-white">{userSessions.length || 1}</p>
                </div>
              </div>

              {/* Recently Saved Music Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white uppercase">
                    Recently Saved Releases
                  </h3>
                  {savedReleases.length > 0 && (
                    <button
                      onClick={() => setActiveTab('music')}
                      className="text-xs text-rose-400 hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      View All ({savedReleases.length})
                    </button>
                  )}
                </div>

                {savedReleases.length === 0 ? (
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-lg text-center text-xs text-zinc-400 space-y-2">
                    <p>No saved releases yet.</p>
                    <button
                      onClick={onBackToSite}
                      className="text-rose-400 hover:text-rose-300 uppercase font-semibold text-[11px] cursor-pointer"
                    >
                      Explore Official Discography →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedReleases.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                            <Artwork src={r.artwork_url} alt={r.title} aspect="square" title={r.title} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white uppercase truncate">{r.title}</h4>
                            <p className="text-[11px] text-zinc-400 truncate">{r.artist} · {r.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onOpenReleaseModal(r)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs cursor-pointer"
                            title="Open Release"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              db.toggleSaveItem(currentUser.id, 'release', r.id);
                              showToast(`Removed "${r.title}" from saved library.`);
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded text-xs cursor-pointer"
                            title="Remove Saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity Stream */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white uppercase">
                    Recent Activity
                  </h3>
                  {userActivities.length > 0 && (
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-rose-400 hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Full Activity Log
                    </button>
                  )}
                </div>

                {userActivities.length === 0 ? (
                  <div className="p-6 bg-zinc-950 border border-white/5 rounded-lg text-center text-xs text-zinc-500">
                    No recent activity recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userActivities.slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-zinc-950 border border-white/5 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">
                            [{act.category}]
                          </span>
                          <span className="text-zinc-200">{act.action}</span>
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(act.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  My Profile
                </h2>
                <p className="text-xs text-zinc-400">Manage your personal account details and public identity.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-white/10 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-rose-950 border border-rose-500/50 flex items-center justify-center text-xl font-bold text-rose-300 font-display">
                    {profileForm.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase">{profileForm.name}</h3>
                    <p className="text-zinc-400 text-xs">{profileForm.email}</p>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                      Member since: {new Date(currentUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Email Address (Primary)</label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/5 rounded text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase text-[10px]">Fan Bio / Description</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="A few words about yourself..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white resize-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-xs rounded transition-colors cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MY MUSIC */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Saved Music Releases ({savedReleases.length})
                </h2>
                <p className="text-xs text-zinc-400">Official singles, EPs, and albums saved to your personal library.</p>
              </div>

              {savedReleases.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-4">
                  <Disc className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You haven't saved any releases yet.</p>
                  <p className="text-xs text-zinc-400">Browse the discography and click the save button on any track.</p>
                  <button
                    onClick={onBackToSite}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Explore Music
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedReleases.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded overflow-hidden shrink-0">
                          <Artwork src={r.artwork_url} alt={r.title} aspect="square" title={r.title} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-zinc-500 font-mono">{r.type} · {r.release_date}</span>
                          <h4 className="font-bold text-white uppercase text-sm truncate">{r.title}</h4>
                          <p className="text-xs text-zinc-400">{r.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenReleaseModal(r)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => {
                            db.toggleSaveItem(currentUser.id, 'release', r.id);
                            showToast(`Removed "${r.title}"`);
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Saved Videos & Visuals ({savedVideos.length})
                </h2>
                <p className="text-xs text-zinc-400">Official music videos and cinematic visuals in your library.</p>
              </div>

              {savedVideos.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-4">
                  <Film className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You haven't saved any videos yet.</p>
                  <button
                    onClick={onBackToSite}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Explore Videos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedVideos.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex flex-col justify-between space-y-3"
                    >
                      <div className="relative aspect-video rounded overflow-hidden">
                        <Artwork src={v.thumbnail_url} alt={v.title} aspect="video" title={v.title} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white uppercase text-xs truncate">{v.title}</h4>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{v.published_date}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                          onClick={() => onPlayVideo(v)}
                          className="text-xs font-bold uppercase text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch</span>
                        </button>
                        <button
                          onClick={() => {
                            db.toggleSaveItem(currentUser.id, 'video', v.id);
                            showToast(`Removed "${v.title}"`);
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SAVED POSTS */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Saved Posts & Articles ({savedPosts.length})
                </h2>
                <p className="text-xs text-zinc-400">Journal articles and creative notes bookmarked for reading.</p>
              </div>

              {savedPosts.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-4">
                  <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You haven't saved any articles yet.</p>
                  <button
                    onClick={onBackToSite}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Explore Posts
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">
                          {p.category} · {p.published_date}
                        </span>
                        <h4 className="font-bold text-white uppercase text-sm truncate">{p.title}</h4>
                        <p className="text-zinc-400 line-clamp-1 font-light">{p.excerpt}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onReadPost(p)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded font-semibold uppercase cursor-pointer"
                        >
                          Read Article
                        </button>
                        <button
                          onClick={() => {
                            db.toggleSaveItem(currentUser.id, 'post', p.id);
                            showToast(`Removed "${p.title}"`);
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SAVED PRESS */}
          {activeTab === 'press' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Saved Press Coverage ({savedPress.length})
                </h2>
                <p className="text-xs text-zinc-400">Independent media reviews and interview articles.</p>
              </div>

              {savedPress.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-4">
                  <Newspaper className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You haven't saved any press coverage yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPress.map((pr) => (
                    <div
                      key={pr.id}
                      className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">
                          {pr.publication} · {pr.coverage_type}
                        </span>
                        <h4 className="font-bold text-white uppercase text-sm truncate">{pr.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {pr.external_url && pr.external_url !== '#' && (
                          <a
                            href={pr.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-rose-400 rounded font-semibold uppercase flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            db.toggleSaveItem(currentUser.id, 'press', pr.id);
                            showToast(`Removed "${pr.title}"`);
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    Notifications Inbox
                  </h2>
                  <p className="text-xs text-zinc-400">Release announcements, security alerts, and direct transmissions.</p>
                </div>

                {userNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      db.markAllNotificationsRead(currentUser.id);
                      showToast('All notifications marked as read.');
                    }}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs text-zinc-300 rounded cursor-pointer"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {userNotifications.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-2">
                  <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You're all caught up</p>
                  <p className="text-xs text-zinc-500">No new transmissions currently in your inbox.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 bg-zinc-950 border rounded-lg flex items-start justify-between gap-4 text-xs transition-colors ${
                        !n.is_read ? 'border-rose-500/40 bg-[#121016]' : 'border-white/5'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">[{n.type}]</span>
                          <h4 className="font-bold text-white">{n.title}</h4>
                          {!n.is_read && (
                            <span className="w-2 h-2 bg-rose-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-zinc-300 font-light leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!n.is_read && (
                          <button
                            onClick={() => db.markNotificationRead(n.id)}
                            className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded cursor-pointer"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => db.deleteNotification(n.id)}
                          className="p-1.5 bg-zinc-900 text-zinc-500 hover:text-rose-400 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Account Activity Log
                </h2>
                <p className="text-xs text-zinc-400">Chronological history of actions performed under this session.</p>
              </div>

              {userActivities.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center text-xs text-zinc-500">
                  No activity recorded for this account.
                </div>
              ) : (
                <div className="space-y-2">
                  {userActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-zinc-950 border border-white/5 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-400 font-mono mr-2">
                          [{act.category}]
                        </span>
                        <span className="text-white font-medium">{act.action}</span>
                        {act.details && <span className="text-zinc-500 ml-2">({act.details})</span>}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    My Tour & Event Bookings
                  </h2>
                  <p className="text-xs text-zinc-400">Track performance requests submitted for festivals and shows.</p>
                </div>
                <button
                  onClick={onOpenBookingModal}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Booking</span>
                </button>
              </div>

              {userBookings.length === 0 ? (
                <div className="p-12 bg-zinc-950 border border-white/5 rounded-xl text-center space-y-4">
                  <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-display font-bold text-white uppercase">You don't have any booking requests.</p>
                  <p className="text-xs text-zinc-400">Submit a performance scope form to book Prantik Sarkar.</p>
                  <button
                    onClick={onOpenBookingModal}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Create Booking Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 bg-zinc-950 border border-white/10 rounded-lg space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase text-sm">{b.event_type}</span>
                          <span className="text-zinc-500 font-mono">({b.location})</span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                            b.status === 'ACCEPTED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : b.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400 bg-zinc-900/40 p-3 rounded">
                        <div>
                          <span className="text-zinc-500">Date:</span> {b.event_date}
                        </div>
                        <div>
                          <span className="text-zinc-500">Location:</span> {b.location}
                        </div>
                        <div>
                          <span className="text-zinc-500">Budget:</span> {b.budget || 'Open'}
                        </div>
                        <div>
                          <span className="text-zinc-500">Submitted:</span> {new Date(b.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {b.message && (
                        <p className="text-zinc-300 font-light italic">"{b.message}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: PRANTIK CHAT & DIRECT MESSAGING */}
          {(activeTab === 'chat' || activeTab === 'messages') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    PRANTIK CHAT
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Official internal encrypted communications grid — Direct, Groups, Artist Label Lines & PRANTIK AI.
                  </p>
                </div>
              </div>

              <PrantikChatWorkspace
                currentUser={currentUser}
                initialConversationId={initialConversationId}
                fullHeight={false}
              />
            </div>
          )}

          {/* TAB 11: SECURITY CENTER */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Security Center
                </h2>
                <p className="text-xs text-zinc-400">Manage credentials, active devices, and session tokens.</p>
              </div>

              {/* Password Change */}
              <form onSubmit={handleChangePassword} className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <div className="flex items-center gap-2 text-rose-500 font-bold uppercase text-[11px]">
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded text-xs cursor-pointer"
                >
                  Update Credentials
                </button>
              </form>

              {/* Active Sessions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white uppercase">
                    Active Authenticated Sessions
                  </h3>
                  {userSessions.length > 1 && (
                    <button
                      onClick={() => {
                        db.revokeAllOtherSessions();
                        showToast('Revoked all other devices.');
                      }}
                      className="text-xs text-rose-400 hover:underline uppercase font-semibold cursor-pointer"
                    >
                      Revoke Other Devices
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {userSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-rose-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{sess.device}</span>
                            {sess.is_current && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                                Current Session
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            IP: {sess.ip_address} · {sess.location || 'India'}
                          </p>
                        </div>
                      </div>

                      {!sess.is_current && (
                        <button
                          onClick={() => {
                            db.revokeSession(sess.id);
                            showToast('Session revoked.');
                          }}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded text-[11px] uppercase cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login History */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-white uppercase">
                  Login Event History
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {loginEvents.slice(0, 5).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-zinc-950 border border-white/5 rounded flex items-center justify-between"
                    >
                      <div>
                        <span className="text-emerald-400 font-bold">[{ev.event_type}]</span>{' '}
                        <span className="text-zinc-300">{ev.device_info}</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: PRIVACY & DATA */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Privacy & Data Management
                </h2>
                <p className="text-xs text-zinc-400">Control data export and account erasure rights under GDPR/CCPA.</p>
              </div>

              {/* Data Export Box */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-3 text-xs">
                <h3 className="font-bold text-sm text-white uppercase">Download Account Archive</h3>
                <p className="text-zinc-400 leading-relaxed font-light">
                  Obtain a structured JSON file containing your saved releases, submitted bookings, notification logs, and personal activity.
                </p>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-white font-bold uppercase tracking-wider rounded text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-rose-500" />
                  <span>Export Personal Data (.json)</span>
                </button>
              </div>

              {/* Account Deletion */}
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-4 text-xs">
                <h3 className="font-bold text-sm text-rose-400 uppercase">Danger Zone: Delete Fan Account</h3>
                <p className="text-zinc-400 leading-relaxed font-light">
                  Permanently erase your account, personal data, saved items, and message history. This action cannot be undone.
                </p>

                {deleteConfirmOpen ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-white font-medium">
                      Type your email <strong className="text-rose-400">{currentUser.email}</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteChallenge}
                      onChange={(e) => setDeleteChallenge(e.target.value)}
                      placeholder={currentUser.email}
                      className="w-full px-3 py-2 bg-zinc-950 border border-rose-500/50 rounded text-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase rounded cursor-pointer"
                      >
                        Permanently Delete My Account
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-4 py-2 bg-rose-950 border border-rose-500/50 text-rose-400 hover:text-white rounded font-bold uppercase cursor-pointer"
                  >
                    Request Account Erasure
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 13: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Notification & Studio Settings
                </h2>
                <p className="text-xs text-zinc-400">Configure real-time alerts and platform preferences.</p>
              </div>

              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <h3 className="font-bold text-sm text-white uppercase">Notification Channels</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-zinc-900/60 rounded cursor-pointer">
                    <span className="text-zinc-200">New Music Releases</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.new_releases}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, new_releases: e.target.checked })}
                      className="accent-rose-600 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-zinc-900/60 rounded cursor-pointer">
                    <span className="text-zinc-200">Official Video Premieres</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.new_videos}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, new_videos: e.target.checked })}
                      className="accent-rose-600 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-zinc-900/60 rounded cursor-pointer">
                    <span className="text-zinc-200">Tour & Concert Announcements</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.events}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, events: e.target.checked })}
                      className="accent-rose-600 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-zinc-900/60 rounded cursor-pointer">
                    <span className="text-zinc-200">Booking Status Updates</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.booking_updates}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, booking_updates: e.target.checked })}
                      className="accent-rose-600 w-4 h-4"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      db.updateUserProfile({ notification_preferences: notifPrefs });
                      showToast('Notification preferences saved.');
                    }}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
