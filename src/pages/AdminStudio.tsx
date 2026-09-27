import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Disc,
  Film,
  BookOpen,
  Newspaper,
  Calendar,
  Camera,
  FileText,
  Mail,
  Inbox,
  Sliders,
  History,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Star,
  Download,
  Sparkles,
  RefreshCw,
  Users,
  Shield,
  Key,
  Globe,
  Database,
  Code2,
  Flag,
  Radio,
  Layers,
  Palette,
  AlertTriangle,
  Play,
  Send,
  Eye,
  ExternalLink,
  Lock,
  Cpu,
  Terminal,
  Bot,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { db } from '../services/db';
import { useRealtimeData } from '../hooks/useRealtimeData';
import {
  Release,
  Video,
  Post,
  PressArticle,
  EventItem,
  GalleryItem,
  EPKFile,
  User,
  UserRole,
  PromotionItem,
  ApiKeyItem,
  WebhookItem,
  BackgroundJob,
  FeatureFlag,
  SiteProject,
} from '../types';
import { SitesList } from '../components/admin/sites/SitesList';
import { NewSiteWizard } from '../components/admin/sites/NewSiteWizard';
import { TemplatesCatalog } from '../components/admin/sites/TemplatesCatalog';
import { GlobalBuilds } from '../components/admin/sites/GlobalBuilds';
import { GlobalDeployments } from '../components/admin/sites/GlobalDeployments';
import { GlobalDomains } from '../components/admin/sites/GlobalDomains';
import { SiteWorkspace } from '../components/admin/sites/SiteWorkspace';
import { SiteConsole } from '../components/admin/sites/console/SiteConsole';
import { AiControlCenter } from '../components/admin/ai/AiControlCenter';
import { AdminLabelPricing } from '../components/admin/label/AdminLabelPricing';
import { AdminLabelApplications } from '../components/admin/label/AdminLabelApplications';
import { PrantikChatWorkspace } from '../components/chat/PrantikChatWorkspace';
import { AdminPlatformManager } from '../components/admin/platforms/AdminPlatformManager';
import { AdminContactManager } from '../components/admin/contacts/AdminContactManager';
import { AdminAiProviderManager } from '../components/admin/ai/AdminAiProviderManager';
import { AdminWebsiteBuilder } from '../components/admin/ai/AdminWebsiteBuilder';
import { AdminPaymentGatewayManager } from '../components/admin/payments/AdminPaymentGatewayManager';

interface AdminStudioProps {
  onBackToSite: () => void;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

type AdminSection =
  | 'overview'
  | 'chat'
  | 'platforms'
  | 'contacts'
  | 'ai_builder'
  | 'ai_providers'
  | 'payments'
  | 'label_pricing'
  | 'label_applications'
  | 'ai'
  | 'ai_agents'
  | 'ai_agent'
  | 'ai_features'
  | 'ai_tasks'
  | 'ai_suggestions'
  | 'ai_changes'
  | 'ai_scheduled'
  | 'ai_approvals'
  | 'ai_policies'
  | 'sites'
  | 'sites_new'
  | 'sites_templates'
  | 'sites_builds'
  | 'sites_deployments'
  | 'sites_domains'
  | 'sites_workspace'
  | 'sites_console'
  | 'website'
  | 'releases'
  | 'videos'
  | 'posts'
  | 'press'
  | 'events'
  | 'gallery'
  | 'epk'
  | 'promotions'
  | 'users'
  | 'bookings'
  | 'messages'
  | 'notifications'
  | 'media'
  | 'seo'
  | 'database'
  | 'developer'
  | 'security'
  | 'settings'
  | 'audit';

export const AdminStudio: React.FC<AdminStudioProps> = ({
  onBackToSite,
  currentRoute,
  onNavigate,
}) => {
  const {
    settings,
    currentUser,
    allReleases,
    allVideos,
    allPosts,
    allPress,
    allEvents,
    gallery,
    epkFiles,
    bookings,
    messages,
    sites,
    allMusicPlatforms,
    allContactDepartments,
  } = useRealtimeData();

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<string>('overview');
  const [sitesMenuOpen, setSitesMenuOpen] = useState(true);
  const [aiMenuOpen, setAiMenuOpen] = useState(true);
  const [notice, setNotice] = useState('');

  // Handle URL route synchronization
  useEffect(() => {
    if (!currentRoute) return;

    if (currentRoute === '/admin/platforms' || currentRoute.startsWith('/admin/platform')) {
      setActiveSection('platforms');
    } else if (currentRoute === '/admin/contacts' || currentRoute.startsWith('/admin/contact')) {
      setActiveSection('contacts');
    } else if (currentRoute === '/admin/builder' || currentRoute === '/admin/ai/builder') {
      setActiveSection('ai_builder');
    } else if (currentRoute === '/admin/providers' || currentRoute === '/admin/ai/providers') {
      setActiveSection('ai_providers');
    } else if (currentRoute === '/admin/payments' || currentRoute.startsWith('/admin/payment') || currentRoute === '/admin/gateways') {
      setActiveSection('payments');
    } else if (currentRoute === '/admin/chat' || currentRoute === '/owner/chat' || currentRoute.startsWith('/admin/chat') || currentRoute.startsWith('/owner/chat')) {
      setActiveSection('chat');
    } else if (currentRoute === '/admin/label/pricing' || currentRoute.startsWith('/admin/label')) {
      setActiveSection('label_pricing');
    } else if (currentRoute === '/admin/ai' || currentRoute.startsWith('/admin/ai')) {
      const sub = currentRoute.replace('/admin/ai', '').replace(/^\//, '');
      if (sub === 'agents') setActiveSection('ai_agents');
      else if (sub === 'agent') setActiveSection('ai_agent');
      else if (sub === 'features') setActiveSection('ai_features');
      else if (sub === 'tasks') setActiveSection('ai_tasks');
      else if (sub === 'suggestions') setActiveSection('ai_suggestions');
      else if (sub === 'changes') setActiveSection('ai_changes');
      else if (sub === 'scheduled') setActiveSection('ai_scheduled');
      else if (sub === 'approvals') setActiveSection('ai_approvals');
      else if (sub === 'policies') setActiveSection('ai_policies');
      else setActiveSection('ai');
    } else if (currentRoute.includes('/console')) {
      // e.g. /admin/sites/:siteId/console
      const match = currentRoute.match(/\/admin\/sites\/([^\/]+)\/console/);
      if (match && match[1]) {
        setSelectedSiteId(match[1]);
        setActiveSection('sites_console');
      } else if (sites.length > 0) {
        setSelectedSiteId(sites[0].id);
        setActiveSection('sites_console');
      }
    }
  }, [currentRoute, sites]);

  const handleOpenSiteWorkspace = (siteId: string, initialTab: string = 'overview') => {
    setSelectedSiteId(siteId);
    setWorkspaceInitialTab(initialTab);
    if (initialTab === 'console') {
      setActiveSection('sites_console');
      onNavigate?.(`/admin/sites/${siteId}/console`);
    } else {
      setActiveSection('sites_workspace');
      onNavigate?.(`/admin/sites/${siteId}/workspace`);
    }
  };

  const handleOpenSiteConsole = (siteId: string) => {
    setSelectedSiteId(siteId);
    setActiveSection('sites_console');
    onNavigate?.(`/admin/sites/${siteId}/console`);
  };

  // Form states
  const [editingRelease, setEditingRelease] = useState<Partial<Release> | null>(null);
  const [editingVideo, setEditingVideo] = useState<Partial<Video> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingPress, setEditingPress] = useState<Partial<PressArticle> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [editingEPK, setEditingEPK] = useState<Partial<EPKFile> | null>(null);
  const [editingPromo, setEditingPromo] = useState<Partial<PromotionItem> | null>(null);

  // New API Key & Webhook Modals
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  // Notification dispatcher form
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'SYSTEM' as const,
    audience: 'all',
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState(settings);

  // Live database queries
  const allUsers = db.getUsers();
  const subscribers = db.getSubscribers();
  const auditLogs = db.getAuditLogs();
  const featureFlags = db.getFeatureFlags();
  const apiKeys = db.getApiKeys();
  const webhooks = db.getWebhooks();
  const backgroundJobs = db.getBackgroundJobs();
  const promotions = db.getPromotions();
  const mediaFiles = db.getMediaFiles();

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const isOwner = currentUser?.role === 'OWNER' || currentUser?.role === 'SUPER_ADMIN';

  // Release save
  const handleSaveRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRelease?.title) return;
    db.saveRelease(editingRelease);
    setEditingRelease(null);
    showToast(`Release "${editingRelease.title}" saved and published.`);
  };

  // Video save
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo?.title || !editingVideo?.video_url) return;
    db.saveVideo(editingVideo);
    setEditingVideo(null);
    showToast(`Video visualizer "${editingVideo.title}" saved.`);
  };

  // Post save
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.content) return;
    db.savePost(editingPost);
    setEditingPost(null);
    showToast(`Article "${editingPost.title}" published.`);
  };

  // Press save
  const handleSavePress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPress?.title || !editingPress?.publication) return;
    db.savePress(editingPress);
    setEditingPress(null);
    showToast(`Press entry "${editingPress.title}" recorded.`);
  };

  // Event save
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.date) return;
    db.saveEvent(editingEvent);
    setEditingEvent(null);
    showToast(`Live tour event "${editingEvent.title}" scheduled.`);
  };

  // Gallery save
  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery?.title) return;
    db.saveGalleryItem(editingGallery);
    setEditingGallery(null);
    showToast(`Gallery asset "${editingGallery.title}" uploaded.`);
  };

  // EPK save
  const handleSaveEPK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEPK?.title) return;
    db.saveEPKFile(editingEPK);
    setEditingEPK(null);
    showToast(`EPK Resource "${editingEPK.title}" published.`);
  };

  // Promotion save
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo?.title) return;
    db.savePromotion(editingPromo);
    setEditingPromo(null);
    showToast(`Promotion banner "${editingPromo.title}" deployed.`);
  };

  // Dispatch system notification
  const handleDispatchNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    db.sendAdminNotification(notifForm.title, notifForm.message, notifForm.type, notifForm.audience);
    setNotifForm({ title: '', message: '', type: 'SYSTEM', audience: 'all' });
    showToast('Real-time system notification dispatched.');
  };

  // Create API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const { secretKey } = db.createApiKey(newKeyName, ['READ', 'WRITE', 'MEDIA']);
    setGeneratedKey(secretKey);
    setNewKeyName('');
    showToast('API Key generated securely.');
  };

  // Create Webhook
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    db.createWebhook(newWebhookUrl, ['release.published', 'video.published', 'booking.created']);
    setNewWebhookUrl('');
    showToast('Webhook endpoint registered.');
  };

  // Trigger Backup
  const handleRunBackup = () => {
    db.triggerJob('Full Database PostgreSQL Backup', 'BACKUP');
    showToast('Backup job queued and executed.');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col pt-16 font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#0b0b10] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="font-display font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
            PRANTIK SARKAR <span className="text-rose-500 text-xs font-semibold ml-1">ADMIN CONTROL CONSOLE</span>
          </h1>
          <span className="text-zinc-600 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-amber-400 font-bold hidden sm:inline font-mono">
            {currentUser?.role || 'OWNER'} ({currentUser?.email})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {notice && (
            <span className="text-xs bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1 rounded animate-in fade-in">
              {notice}
            </span>
          )}

          <button
            onClick={onBackToSite}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-semibold uppercase tracking-wider text-white rounded transition-colors cursor-pointer"
          >
            ← Public Website
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="p-3 bg-zinc-950 border border-white/10 rounded-lg mb-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">System Controller</p>
            <p className="text-xs text-white font-medium truncate mt-0.5">{settings.artist_name} Platform</p>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Database Engine:</span>
              <span className="text-emerald-400 font-mono font-bold">PostgreSQL / Redis</span>
            </div>
          </div>

          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'overview' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview Cockpit</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('chat');
              onNavigate?.('/admin/chat');
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'chat' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              <span>PRANTIK Chat</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
              COMMS
            </span>
          </button>

          {/* AI ENGINEERING & 24/7 AGENT CONTROL CENTER */}
          <div className="pt-1 pb-1">
            <button
              onClick={() => {
                setActiveSection('ai');
                setAiMenuOpen(!aiMenuOpen);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                activeSection.startsWith('ai') ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-rose-400" />
                <span>AI Engineering</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                24/7
              </span>
            </button>

            {aiMenuOpen && (
              <div className="pl-6 pt-1.5 pb-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveSection('ai_builder');
                    onNavigate?.('/admin/builder');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                    activeSection === 'ai_builder' ? 'text-amber-300 font-bold bg-amber-950/40' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Website Builder</span>
                  </span>
                  <span className="text-[9px] px-1 bg-amber-950 text-amber-300 rounded font-mono font-bold">New</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('ai_providers');
                    onNavigate?.('/admin/providers');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                    activeSection === 'ai_providers' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>• AI Provider Manager</span>
                  <span className="text-[9px] px-1 bg-rose-950 text-rose-300 rounded font-mono font-bold">Multi</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('ai');
                    onNavigate?.('/admin/ai');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Control Center
                </button>
                <button
                  onClick={() => {
                    setActiveSection('ai_agents');
                    onNavigate?.('/admin/ai/agents');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                    activeSection === 'ai_agents' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>• AI Agent Modes</span>
                  <span className="text-[9px] px-1 bg-rose-950 text-rose-300 rounded font-mono font-bold">25</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('ai_agent');
                    onNavigate?.('/admin/ai/agent');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_agent' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • PRANTIK SITE AI
                </button>
                <button
                  onClick={() => setActiveSection('ai_features')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_features' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Feature Factory
                </button>
                <button
                  onClick={() => setActiveSection('ai_tasks')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_tasks' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Task Queue
                </button>
                <button
                  onClick={() => setActiveSection('ai_suggestions')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_suggestions' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Audit & Proposals
                </button>
                <button
                  onClick={() => setActiveSection('ai_changes')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_changes' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Diff Viewer
                </button>
                <button
                  onClick={() => setActiveSection('ai_scheduled')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_scheduled' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • 24/7 Monitors
                </button>
                <button
                  onClick={() => setActiveSection('ai_approvals')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_approvals' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Human Approvals
                </button>
                <button
                  onClick={() => setActiveSection('ai_policies')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'ai_policies' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Safety & Policies
                </button>
              </div>
            )}
          </div>

          {/* SITES & PROJECT BUILDER */}
          <div className="pt-1 pb-1">
            <button
              onClick={() => {
                setActiveSection('sites');
                setSitesMenuOpen(!sitesMenuOpen);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                activeSection.startsWith('sites') ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" />
                <span>Sites & Projects</span>
              </div>
              <span className="text-[10px] font-mono opacity-70 bg-black/30 px-1.5 py-0.5 rounded">{sites.length}</span>
            </button>

            {sitesMenuOpen && (
              <div className="pl-6 pt-1.5 pb-1 space-y-1">
                <button
                  onClick={() => setActiveSection('sites')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • All Sites ({sites.length})
                </button>
                <button
                  onClick={() => setActiveSection('sites_new')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites_new' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • + New Site
                </button>
                <button
                  onClick={() => setActiveSection('sites_templates')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites_templates' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Templates
                </button>
                <button
                  onClick={() => setActiveSection('sites_builds')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites_builds' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Builds
                </button>
                <button
                  onClick={() => setActiveSection('sites_deployments')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites_deployments' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Deployments
                </button>
                <button
                  onClick={() => setActiveSection('sites_domains')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeSection === 'sites_domains' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  • Domains
                </button>
                <button
                  onClick={() => {
                    if (sites.length > 0) {
                      handleOpenSiteConsole(selectedSiteId || sites[0].id);
                    } else {
                      setActiveSection('sites');
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                    activeSection === 'sites_console' ? 'text-rose-400 font-bold bg-white/5' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>• Site Console (IDE)</span>
                  <span className="text-[9px] px-1 bg-rose-950 text-rose-300 rounded font-mono font-bold">IDE</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveSection('website')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'website' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Website & Theme Studio</span>
          </button>

          <button
            onClick={() => setActiveSection('releases')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'releases' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Disc className="w-4 h-4" />
              <span>Music Releases</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allReleases.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('platforms');
              onNavigate?.('/admin/platforms');
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'platforms' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-rose-400" />
              <span>Platform Manager</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
              150+
            </span>
          </button>

          <button
            onClick={() => setActiveSection('videos')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'videos' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4" />
              <span>Videos & Visuals</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allVideos.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('posts')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'posts' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Posts / Articles</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allPosts.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('press')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'press' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4" />
              <span>Press & Media</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allPress.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('events')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'events' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Tour Dates & Live</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allEvents.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('gallery')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'gallery' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4" />
              <span>Photo Gallery</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{gallery.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('epk')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'epk' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>EPK Press Kit</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{epkFiles.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('promotions')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'promotions' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4" />
              <span>Banners & Promotions</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{promotions.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'users' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>User & Role Studio</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allUsers.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('bookings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'bookings' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Booking Inquiries</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
              {bookings.filter((b) => b.status === 'PENDING').length} new
            </span>
          </button>

          <button
            onClick={() => setActiveSection('messages')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'messages' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Contact & Messages</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{messages.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('contacts');
              onNavigate?.('/admin/contacts');
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'contacts' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Contact Information</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">{allContactDepartments.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'notifications' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>System Dispatcher</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('label_pricing');
              onNavigate?.('/admin/label/pricing');
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'label_pricing' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Label Pricing & Plans</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-bold">FEES</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('payments');
              onNavigate?.('/admin/payments');
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'payments' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payment Gateways</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
              UPI/GATEWAYS
            </span>
          </button>

          <button
            onClick={() => setActiveSection('seo')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'seo' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & Sitemap Studio</span>
          </button>

          <button
            onClick={() => setActiveSection('database')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'database' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Backups</span>
          </button>

          <button
            onClick={() => setActiveSection('developer')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'developer' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Developer & API Studio</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'security' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Center</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'settings' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Website Settings</span>
          </button>

          <button
            onClick={() => setActiveSection('audit')}
            className={`w-full text-left px-3.5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'audit' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </aside>

        {/* Main Workspace Canvas */}
        <main className="lg:col-span-9 bg-[#0b0b10] border border-white/10 rounded-xl p-6 sm:p-8 min-h-[700px] shadow-2xl">
          {/* SECTION: PRANTIK CHAT */}
          {activeSection === 'chat' && currentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    PRANTIK CHAT — Executive Communications
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Label Support channels, Artist lines, internal team channels, and user inquiries.
                  </p>
                </div>
              </div>
              <PrantikChatWorkspace currentUser={currentUser} fullHeight={false} />
            </div>
          )}

          {/* SECTION: AI ENGINEERING & 24/7 AGENT CONTROL CENTER */}
          {activeSection.startsWith('ai') && (
            <AiControlCenter
              initialTab={
                activeSection === 'ai_agents'
                  ? 'agents'
                  : activeSection === 'ai_agent'
                  ? 'agent'
                  : activeSection === 'ai_features'
                  ? 'features'
                  : activeSection === 'ai_tasks'
                  ? 'tasks'
                  : activeSection === 'ai_suggestions'
                  ? 'suggestions'
                  : activeSection === 'ai_changes'
                  ? 'changes'
                  : activeSection === 'ai_scheduled'
                  ? 'scheduled'
                  : activeSection === 'ai_approvals'
                  ? 'approvals'
                  : activeSection === 'ai_policies'
                  ? 'policies'
                  : 'overview'
              }
              onNavigateToSiteWorkspace={handleOpenSiteWorkspace}
            />
          )}

          {/* SECTION: MULTI-SITE ALL SITES */}
          {activeSection === 'sites' && (
            <SitesList
              sites={sites}
              onOpenSite={handleOpenSiteWorkspace}
              onNewSite={() => setActiveSection('sites_new')}
              onBrowseTemplates={() => setActiveSection('sites_templates')}
            />
          )}

          {/* SECTION: NEW SITE WIZARD */}
          {activeSection === 'sites_new' && (
            <NewSiteWizard
              onCancel={() => setActiveSection('sites')}
              onSuccess={(siteId) => handleOpenSiteWorkspace(siteId, 'overview')}
            />
          )}

          {/* SECTION: TEMPLATES DIRECTORY */}
          {activeSection === 'sites_templates' && (
            <TemplatesCatalog
              onUseTemplate={(tmpl) => {
                setActiveSection('sites_new');
              }}
              onBack={() => setActiveSection('sites')}
            />
          )}

          {/* SECTION: GLOBAL BUILDS */}
          {activeSection === 'sites_builds' && (
            <GlobalBuilds onOpenSite={handleOpenSiteWorkspace} />
          )}

          {/* SECTION: GLOBAL DEPLOYMENTS */}
          {activeSection === 'sites_deployments' && (
            <GlobalDeployments onOpenSite={handleOpenSiteWorkspace} />
          )}

          {/* SECTION: GLOBAL DOMAINS */}
          {activeSection === 'sites_domains' && (
            <GlobalDomains onOpenSite={handleOpenSiteWorkspace} />
          )}

          {/* SECTION: SITE WORKSPACE COCKPIT */}
          {activeSection === 'sites_workspace' && selectedSiteId && (
            <SiteWorkspace
              siteId={selectedSiteId}
              initialTab={workspaceInitialTab}
              onBack={() => setActiveSection('sites')}
            />
          )}

          {/* SECTION: SITE CONSOLE (FULL IDE & DIRECT PROJECT CONTROL) */}
          {activeSection === 'sites_console' && selectedSiteId && (
            <SiteConsole
              siteId={selectedSiteId}
              onBack={() => setActiveSection('sites')}
            />
          )}

          {/* SECTION 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">
                  Master Operations Cockpit
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Centralized command console for releases, tour bookings, media assets, and server operations.
                </p>
              </div>

              {/* Stat Metric Cards (NO FAKE DATA) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Published Releases</p>
                  <p className="text-3xl font-display font-black text-white">{allReleases.filter(r => r.status === 'PUBLISHED').length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Published Videos</p>
                  <p className="text-3xl font-display font-black text-white">{allVideos.filter(v => v.status === 'PUBLISHED').length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Upcoming Events</p>
                  <p className="text-3xl font-display font-black text-white">{allEvents.filter(e => !e.is_past).length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Subscribers</p>
                  <p className="text-3xl font-display font-black text-rose-500">{subscribers.length}</p>
                </div>
              </div>

              {/* System Health Status */}
              <div className="p-5 bg-zinc-950 border border-white/10 rounded-lg space-y-3">
                <h3 className="font-display font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Production Infrastructure Health</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">Database</span>
                    <span className="text-emerald-400 font-bold">ONLINE (PostgreSQL)</span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">Cache & Events</span>
                    <span className="text-emerald-400 font-bold">ONLINE (Redis PubSub)</span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">Socket Realtime</span>
                    <span className="text-emerald-400 font-bold">CONNECTED</span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">Storage Bucket</span>
                    <span className="text-emerald-400 font-bold">S3 READY</span>
                  </div>
                </div>
              </div>

              {/* Quick Catalogue Baseline & Seeder */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-bold text-base text-white uppercase">
                    Catalogue Baseline & Demonstration Tools
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  All dynamic sections query live PostgreSQL database records. You can populate the official verified baseline catalog in one click, or reset everything to verify empty states.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      db.seedSampleContent();
                      showToast('Starter catalogue populated.');
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Populate Official Catalog Baseline</span>
                  </button>

                  <button
                    onClick={() => {
                      db.clearAllContent();
                      showToast('Catalog reset to clean slate.');
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset to Clean Slate</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: RECORD LABEL PRICING & SERVICES CONSOLE */}
          {activeSection === 'label_pricing' && (
            <AdminLabelPricing />
          )}

          {/* SECTION 2: WEBSITE & THEME STUDIO */}
          {activeSection === 'website' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Visual Website & Section Studio
                </h2>
                <p className="text-xs text-zinc-400">Configure homepage sections, theme accents, and custom styling.</p>
              </div>

              {/* Homepage Section Visibility Controller */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-white uppercase">
                  Homepage Section Builder & Order
                </h3>
                <div className="space-y-2 text-xs">
                  {settings.sections?.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3.5 bg-zinc-950 border border-white/10 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-zinc-500 font-mono text-[11px]">#{sec.display_order}</span>
                        <span className="font-bold text-white uppercase">{sec.name}</span>
                      </div>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <span className={sec.is_enabled ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                          {sec.is_enabled ? 'Visible' : 'Hidden'}
                        </span>
                        <input
                          type="checkbox"
                          checked={sec.is_enabled}
                          onChange={(e) => {
                            db.updateSectionConfig(sec.id, { is_enabled: e.target.checked });
                            showToast(`Section "${sec.name}" visibility updated.`);
                          }}
                          className="accent-rose-600 w-4 h-4"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme Customizer */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <h3 className="font-display font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Dark Luxury Color Accents</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase font-mono">Primary Crimson Accent</label>
                    <input
                      type="text"
                      value={settingsForm.theme?.primary_accent || '#e11d48'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          theme: { ...settingsForm.theme!, primary_accent: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase font-mono">Metallic Gold Accent</label>
                    <input
                      type="text"
                      value={settingsForm.theme?.gold_accent || '#f59e0b'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          theme: { ...settingsForm.theme!, gold_accent: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase font-mono">Matte Black Canvas</label>
                    <input
                      type="text"
                      value={settingsForm.theme?.canvas_bg || '#070709'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          theme: { ...settingsForm.theme!, canvas_bg: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-zinc-400 text-[10px] uppercase font-mono">Custom CSS Overrides</label>
                  <textarea
                    rows={4}
                    value={settingsForm.theme?.custom_css || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        theme: { ...settingsForm.theme!, custom_css: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white font-mono text-xs"
                  />
                </div>

                <button
                  onClick={() => {
                    db.updateSettings(settingsForm);
                    showToast('Theme preferences published.');
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded text-xs cursor-pointer"
                >
                  Save Theme Settings
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: RELEASES */}
          {activeSection === 'releases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    Discography Releases
                  </h2>
                  <p className="text-xs text-zinc-400">Manage albums, EPs, audio preview files, and streaming links.</p>
                </div>
                <button
                  onClick={() =>
                    setEditingRelease({
                      type: 'Single',
                      artist: settings.artist_name,
                      status: 'PUBLISHED',
                      featured: false,
                      featured_order: 1,
                      release_date: new Date().toISOString().split('T')[0],
                    })
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Release</span>
                </button>
              </div>

              {editingRelease && (
                <form onSubmit={handleSaveRelease} className="p-6 bg-zinc-950 border border-white/15 rounded-xl space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-white uppercase">
                    {editingRelease.id ? 'Edit Release' : 'New Music Release'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-300 font-semibold uppercase text-[10px]">Title *</label>
                      <input
                        type="text"
                        required
                        value={editingRelease.title || ''}
                        onChange={(e) => setEditingRelease({ ...editingRelease, title: e.target.value })}
                        placeholder="e.g. NIGHT CYPHER"
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold uppercase text-[10px]">Type</label>
                      <select
                        value={editingRelease.type || 'Single'}
                        onChange={(e) => setEditingRelease({ ...editingRelease, type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                      >
                        <option value="Single">Single</option>
                        <option value="EP">EP</option>
                        <option value="Album">Album</option>
                        <option value="Mixtape">Mixtape</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-zinc-300 font-semibold uppercase text-[10px]">Release Date</label>
                      <input
                        type="date"
                        value={editingRelease.release_date || ''}
                        onChange={(e) => setEditingRelease({ ...editingRelease, release_date: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-300 font-semibold uppercase text-[10px]">Genre</label>
                      <input
                        type="text"
                        value={editingRelease.genre || ''}
                        onChange={(e) => setEditingRelease({ ...editingRelease, genre: e.target.value })}
                        placeholder="e.g. Hip Hop / Rap"
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Cover Artwork URL</label>
                    <input
                      type="url"
                      value={editingRelease.artwork_url || ''}
                      onChange={(e) => setEditingRelease({ ...editingRelease, artwork_url: e.target.value })}
                      placeholder="https://... (or leave empty for dark luxury fallback)"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Audio Preview URL (.mp3)</label>
                    <input
                      type="url"
                      value={editingRelease.audio_preview_url || ''}
                      onChange={(e) => setEditingRelease({ ...editingRelease, audio_preview_url: e.target.value })}
                      placeholder="https://cdn.example.com/preview.mp3"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold uppercase text-[10px]">Description</label>
                    <textarea
                      rows={2}
                      value={editingRelease.description || ''}
                      onChange={(e) => setEditingRelease({ ...editingRelease, description: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRelease.featured || false}
                        onChange={(e) => setEditingRelease({ ...editingRelease, featured: e.target.checked })}
                        className="accent-rose-600"
                      />
                      <span>Mark as Featured Release</span>
                    </label>

                    <label className="flex items-center gap-2 text-zinc-300">
                      <span>Status:</span>
                      <select
                        value={editingRelease.status || 'PUBLISHED'}
                        onChange={(e) => setEditingRelease({ ...editingRelease, status: e.target.value as any })}
                        className="px-2 py-1 bg-zinc-900 border border-white/10 rounded text-white text-xs"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded cursor-pointer"
                    >
                      Save Release
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRelease(null)}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {allReleases.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-zinc-950 border border-white/5 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Disc className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white uppercase text-xs">{r.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">({r.type})</span>
                          {r.featured && (
                            <span className="text-[9px] uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                              Featured
                            </span>
                          )}
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                              r.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{r.release_date} · {r.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRelease(r)}
                        className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete release "${r.title}"?`)) {
                            db.deleteRelease(r.id);
                            showToast(`Deleted "${r.title}"`);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 bg-zinc-900 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: PLATFORM MANAGER (LISTEN EVERYWHERE) */}
          {activeSection === 'platforms' && (
            <AdminPlatformManager platforms={allMusicPlatforms} />
          )}

          {/* SECTION: CONTACT INFORMATION */}
          {activeSection === 'contacts' && (
            <AdminContactManager departments={allContactDepartments} />
          )}

          {/* SECTION: AI WEBSITE BUILDER */}
          {activeSection === 'ai_builder' && (
            <AdminWebsiteBuilder />
          )}

          {/* SECTION: AI PROVIDER MANAGER */}
          {activeSection === 'ai_providers' && (
            <AdminAiProviderManager />
          )}

          {/* SECTION: PAYMENT GATEWAY & MANUAL UPI MANAGER */}
          {activeSection === 'payments' && (
            <AdminPaymentGatewayManager />
          )}

          {/* SECTION 4: USER & ROLE STUDIO */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  User & Role Governance Studio
                </h2>
                <p className="text-xs text-zinc-400">Manage registered accounts, assign administrative roles, and enforce security suspensions.</p>
              </div>

              <div className="space-y-3">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-zinc-950 border border-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase text-sm">{u.name}</span>
                        <span className="text-zinc-500 font-mono">({u.email})</span>
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-500/30 rounded font-bold font-mono text-[10px]">
                          {u.role}
                        </span>
                        {!u.is_active && (
                          <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-500/50 rounded font-bold text-[10px]">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-1">
                        Registered: {new Date(u.created_at).toLocaleDateString()} · 2FA: {u.two_factor_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            db.updateUserRole(u.id, e.target.value as UserRole);
                            showToast(`Updated role for ${u.name} to ${e.target.value}`);
                          }}
                          className="px-2.5 py-1.5 bg-zinc-900 border border-white/15 rounded text-white text-xs font-mono"
                        >
                          <option value="USER">USER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="OWNER">OWNER</option>
                        </select>

                        <button
                          onClick={() => {
                            const state = db.toggleUserSuspension(u.id);
                            showToast(state ? `Un-suspended ${u.name}` : `Suspended ${u.name}`);
                          }}
                          className={`px-3 py-1.5 rounded font-semibold text-[11px] uppercase cursor-pointer ${
                            u.is_active
                              ? 'bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Unsuspend'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: DEVELOPER & API STUDIO */}
          {activeSection === 'developer' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Developer & API Infrastructure Studio
                </h2>
                <p className="text-xs text-zinc-400">Manage feature flags, integration API keys, and background workers.</p>
              </div>

              {/* Feature Flags */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <h3 className="font-display font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Flag className="w-4 h-4 text-rose-500" />
                  <span>Production Feature Flags</span>
                </h3>
                <div className="space-y-2">
                  {featureFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="p-3 bg-zinc-900/60 border border-white/5 rounded flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{flag.key}</span>
                          <span className="text-zinc-500">({flag.name})</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{flag.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          const state = db.toggleFeatureFlag(flag.id);
                          showToast(`Flag "${flag.key}" is now ${state ? 'ENABLED' : 'DISABLED'}`);
                        }}
                        className={`px-3 py-1 rounded font-bold uppercase font-mono text-[10px] cursor-pointer ${
                          flag.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {flag.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Keys Generator */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <h3 className="font-display font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Integration API Keys</span>
                </h3>

                <form onSubmit={handleCreateApiKey} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="API Key Name (e.g. Spotify Sync Webhook)"
                    className="flex-1 px-3.5 py-2 bg-zinc-900 border border-white/10 rounded text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded text-xs cursor-pointer shrink-0"
                  >
                    Generate Key
                  </button>
                </form>

                {generatedKey && (
                  <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded space-y-1">
                    <p className="text-amber-300 font-bold">New Secret Key (Copy now — will never be shown again):</p>
                    <code className="text-white bg-black/60 p-2 rounded block font-mono text-xs select-all">
                      {generatedKey}
                    </code>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="p-3 bg-zinc-900/60 border border-white/5 rounded flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{key.name}</span>
                        <span className="text-zinc-500 font-mono ml-2">[{key.prefix}]</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={key.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                          {key.status}
                        </span>
                        {key.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              db.revokeApiKey(key.id);
                              showToast(`Revoked "${key.name}"`);
                            }}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: DATABASE & BACKUPS */}
          {activeSection === 'database' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Database & Storage Administration
                </h2>
                <p className="text-xs text-zinc-400">PostgreSQL schema inspection, automated backups, and data export.</p>
              </div>

              {/* Table stats */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded-lg space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white uppercase">
                    PostgreSQL Relational Tables
                  </h3>
                  <button
                    onClick={handleRunBackup}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Run PostgreSQL Backup</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">users</span>
                    <span className="text-white font-bold">{allUsers.length} records</span>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">releases</span>
                    <span className="text-white font-bold">{allReleases.length} records</span>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">videos</span>
                    <span className="text-white font-bold">{allVideos.length} records</span>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">articles</span>
                    <span className="text-white font-bold">{allPosts.length} records</span>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">bookings</span>
                    <span className="text-white font-bold">{bookings.length} records</span>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-white/5 rounded">
                    <span className="text-zinc-500 block text-[10px]">audit_logs</span>
                    <span className="text-white font-bold">{auditLogs.length} records</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: AUDIT LOGS */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                  Security Audit Trail ({auditLogs.length})
                </h2>
                <p className="text-xs text-zinc-400">Append-only chronological record of administrative and security events.</p>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-zinc-950 border border-white/5 rounded text-xs flex items-center justify-between gap-4 font-mono"
                  >
                    <div>
                      <span className="text-rose-400 font-bold">[{log.action}]</span>{' '}
                      <span className="text-zinc-300">{log.details}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px] shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
