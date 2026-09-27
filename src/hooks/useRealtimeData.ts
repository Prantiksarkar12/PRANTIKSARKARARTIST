import { useState, useEffect, useCallback } from 'react';
import { db, dbEventBus } from '../services/db';
import { labelService } from '../services/labelInviteService';
import {
  SiteSettings,
  User,
  Release,
  Video,
  Post,
  PressArticle,
  EventItem,
  GalleryItem,
  EPKFile,
  Notification,
  BookingInquiry,
  ContactMessage,
  SiteProject,
  AiAgentStatus,
  AiTask,
  AiApproval,
  AiFeatureRequest,
  AiScheduledJob,
  AiAuditProposal,
  AiModelConfig,
  AiToolPermission,
  AiPolicyConfig,
  AiActivityEvent,
  AiAgentMemoryContext,
  AiAgentMode,
  LabelPricingConfig,
  LabelServiceOrder,
  LabelArtistMembership,
  LabelDistributionSubmission,
  ArtistInvoice,
  ArtistPayment,
  ArtistAgreement,
  PricingHistoryEntry,
  LabelCapacity,
  LabelInvitation,
  LabelApplication,
  LabelArtistProfile,
  DistributionRelease,
  MusicPlatform,
  ContactDepartment,
} from '../types';

export function useRealtimeData() {
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());
  const [currentUser, setCurrentUser] = useState<User | null>(db.getCurrentUser());
  const [releases, setReleases] = useState<Release[]>(db.getReleases('PUBLISHED'));
  const [allReleases, setAllReleases] = useState<Release[]>(db.getReleases('ALL'));
  const [featuredRelease, setFeaturedRelease] = useState<Release | null>(db.getFeaturedRelease());
  const [videos, setVideos] = useState<Video[]>(db.getVideos('PUBLISHED'));
  const [allVideos, setAllVideos] = useState<Video[]>(db.getVideos('ALL'));
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(db.getFeaturedVideo());
  const [posts, setPosts] = useState<Post[]>(db.getPosts('PUBLISHED'));
  const [allPosts, setAllPosts] = useState<Post[]>(db.getPosts('ALL'));
  const [featuredPost, setFeaturedPost] = useState<Post | null>(db.getFeaturedPost());
  const [press, setPress] = useState<PressArticle[]>(db.getPress('PUBLISHED'));
  const [allPress, setAllPress] = useState<PressArticle[]>(db.getPress('ALL'));
  const [events, setEvents] = useState<EventItem[]>(db.getEvents('PUBLISHED'));
  const [allEvents, setAllEvents] = useState<EventItem[]>(db.getEvents('ALL'));
  const [gallery, setGallery] = useState<GalleryItem[]>(db.getGallery());
  const [epkFiles, setEpkFiles] = useState<EPKFile[]>(db.getEPKFiles());
  const [notifications, setNotifications] = useState<Notification[]>(db.getNotifications());
  const [bookings, setBookings] = useState<BookingInquiry[]>(db.getBookings());
  const [messages, setMessages] = useState<ContactMessage[]>(db.getMessages());
  const [sites, setSites] = useState<SiteProject[]>(db.getSites());
  const [musicPlatforms, setMusicPlatforms] = useState<MusicPlatform[]>(db.getMusicPlatforms('ACTIVE_VERIFIED'));
  const [allMusicPlatforms, setAllMusicPlatforms] = useState<MusicPlatform[]>(db.getMusicPlatforms('ALL'));
  const [contactDepartments, setContactDepartments] = useState<ContactDepartment[]>(db.getContactDepartments(true));
  const [allContactDepartments, setAllContactDepartments] = useState<ContactDepartment[]>(db.getContactDepartments(false));

  // Record Label
  const [labelPricing, setLabelPricing] = useState<LabelPricingConfig>(db.getLabelPricing());
  const [labelOrders, setLabelOrders] = useState<LabelServiceOrder[]>(db.getLabelOrders());
  const [labelMemberships, setLabelMemberships] = useState<LabelArtistMembership[]>(db.getLabelMemberships());
  const [labelSubmissions, setLabelSubmissions] = useState<LabelDistributionSubmission[]>(db.getLabelSubmissions());
  const [artistInvoices, setArtistInvoices] = useState<ArtistInvoice[]>(db.getArtistInvoices());
  const [artistPayments, setArtistPayments] = useState<ArtistPayment[]>(db.getArtistPayments());
  const [artistAgreement, setArtistAgreement] = useState<ArtistAgreement>(db.getArtistAgreement());
  const [pricingHistory, setPricingHistory] = useState<PricingHistoryEntry[]>(db.getPricingHistory());

  // Invite-Only Record Label State
  const [labelCapacity, setLabelCapacity] = useState<LabelCapacity>(labelService.getCapacity());
  const [labelInvitations, setLabelInvitations] = useState<LabelInvitation[]>(labelService.getInvitations());
  const [labelApplications, setLabelApplications] = useState<LabelApplication[]>(labelService.getApplications());
  const [labelArtists, setLabelArtists] = useState<LabelArtistProfile[]>(labelService.getArtists());
  const [publicLabelArtists, setPublicLabelArtists] = useState(labelService.getPublicArtists());
  const [distributionReleases, setDistributionReleases] = useState<DistributionRelease[]>(labelService.getReleases());
  const [publicDistributionReleases, setPublicDistributionReleases] = useState<DistributionRelease[]>(labelService.getPublicReleases());

  // AI
  const [aiAgentStatus, setAiAgentStatus] = useState<AiAgentStatus>(db.getAiAgentStatus());
  const [aiTasks, setAiTasks] = useState<AiTask[]>(db.getAiTasks());
  const [aiApprovals, setAiApprovals] = useState<AiApproval[]>(db.getAiApprovals());
  const [aiFeatures, setAiFeatures] = useState<AiFeatureRequest[]>(db.getAiFeatures());
  const [aiScheduledJobs, setAiScheduledJobs] = useState<AiScheduledJob[]>(db.getAiScheduledJobs());
  const [aiAuditProposals, setAiAuditProposals] = useState<AiAuditProposal[]>(db.getAiAuditProposals());
  const [aiModelConfigs, setAiModelConfigs] = useState<AiModelConfig[]>(db.getAiModelConfigs());
  const [aiToolPermissions, setAiToolPermissions] = useState<AiToolPermission[]>(db.getAiToolPermissions());
  const [aiPolicyConfig, setAiPolicyConfig] = useState<AiPolicyConfig>(db.getAiPolicyConfig());
  const [aiActivityEvents, setAiActivityEvents] = useState<AiActivityEvent[]>(db.getAiActivityEvents());
  const [aiMemoryContext, setAiMemoryContext] = useState<AiAgentMemoryContext>(db.getAiMemoryContext());
  const [aiAgentModes, setAiAgentModes] = useState<AiAgentMode[]>(db.getAiAgentModes());

  const refreshAll = useCallback(() => {
    setSettings(db.getSettings());
    setCurrentUser(db.getCurrentUser());
    setReleases(db.getReleases('PUBLISHED'));
    setAllReleases(db.getReleases('ALL'));
    setFeaturedRelease(db.getFeaturedRelease());
    setVideos(db.getVideos('PUBLISHED'));
    setAllVideos(db.getVideos('ALL'));
    setFeaturedVideo(db.getFeaturedVideo());
    setPosts(db.getPosts('PUBLISHED'));
    setAllPosts(db.getPosts('ALL'));
    setFeaturedPost(db.getFeaturedPost());
    setPress(db.getPress('PUBLISHED'));
    setAllPress(db.getPress('ALL'));
    setEvents(db.getEvents('PUBLISHED'));
    setAllEvents(db.getEvents('ALL'));
    setGallery(db.getGallery());
    setEpkFiles(db.getEPKFiles());
    setNotifications(db.getNotifications());
    setBookings(db.getBookings());
    setMessages(db.getMessages());
    setSites(db.getSites());
    setMusicPlatforms(db.getMusicPlatforms('ACTIVE_VERIFIED'));
    setAllMusicPlatforms(db.getMusicPlatforms('ALL'));
    setContactDepartments(db.getContactDepartments(true));
    setAllContactDepartments(db.getContactDepartments(false));

    // Refresh Label State
    setLabelPricing(db.getLabelPricing());
    setLabelOrders(db.getLabelOrders());
    setLabelMemberships(db.getLabelMemberships());
    setLabelSubmissions(db.getLabelSubmissions());
    setArtistInvoices(db.getArtistInvoices());
    setArtistPayments(db.getArtistPayments());
    setArtistAgreement(db.getArtistAgreement());
    setPricingHistory(db.getPricingHistory());

    // Refresh Invite-Only & Ditto State
    setLabelCapacity(labelService.getCapacity());
    setLabelInvitations(labelService.getInvitations());
    setLabelApplications(labelService.getApplications());
    setLabelArtists(labelService.getArtists());
    setPublicLabelArtists(labelService.getPublicArtists());
    setDistributionReleases(labelService.getReleases());
    setPublicDistributionReleases(labelService.getPublicReleases());

    // Refresh AI State
    setAiAgentStatus(db.getAiAgentStatus());
    setAiTasks(db.getAiTasks());
    setAiApprovals(db.getAiApprovals());
    setAiFeatures(db.getAiFeatures());
    setAiScheduledJobs(db.getAiScheduledJobs());
    setAiAuditProposals(db.getAiAuditProposals());
    setAiModelConfigs(db.getAiModelConfigs());
    setAiToolPermissions(db.getAiToolPermissions());
    setAiPolicyConfig(db.getAiPolicyConfig());
    setAiActivityEvents(db.getAiActivityEvents());
    setAiMemoryContext(db.getAiMemoryContext());
    setAiAgentModes(db.getAiAgentModes());
  }, []);

  useEffect(() => {
    const handleDbChange = () => {
      refreshAll();
    };

    dbEventBus.addEventListener('db_changed', handleDbChange);
    window.addEventListener('label_data_changed', handleDbChange);
    return () => {
      dbEventBus.removeEventListener('db_changed', handleDbChange);
      window.removeEventListener('label_data_changed', handleDbChange);
    };
  }, [refreshAll]);

  return {
    settings,
    currentUser,
    releases,
    allReleases,
    featuredRelease,
    videos,
    allVideos,
    featuredVideo,
    posts,
    allPosts,
    featuredPost,
    press,
    allPress,
    events,
    allEvents,
    gallery,
    epkFiles,
    notifications,
    bookings,
    messages,
    sites,
    musicPlatforms,
    allMusicPlatforms,
    contactDepartments,
    allContactDepartments,
    // Record Label
    labelPricing,
    labelOrders,
    labelMemberships,
    labelSubmissions,
    artistInvoices,
    artistPayments,
    artistAgreement,
    pricingHistory,
    // Invite-Only Record Label & Ditto Distribution
    labelCapacity,
    labelInvitations,
    labelApplications,
    labelArtists,
    publicLabelArtists,
    distributionReleases,
    publicDistributionReleases,
    // AI
    aiAgentStatus,
    aiTasks,
    aiApprovals,
    aiFeatures,
    aiScheduledJobs,
    aiAuditProposals,
    aiModelConfigs,
    aiToolPermissions,
    aiPolicyConfig,
    aiActivityEvents,
    aiMemoryContext,
    aiAgentModes,
    refreshAll,
  };
}
