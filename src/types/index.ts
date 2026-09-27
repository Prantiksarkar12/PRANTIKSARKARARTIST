export type UserRole =
  | 'OWNER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'MODERATOR'
  | 'ANALYST'
  | 'ARTIST'
  | 'USER';

export interface NotificationPreferences {
  new_releases: boolean;
  new_videos: boolean;
  new_articles: boolean;
  press_updates: boolean;
  events: boolean;
  booking_updates: boolean;
  messages: boolean;
  marketing_updates: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'PUBLIC' | 'PRIVATE';
  allow_activity_logging: boolean;
  newsletter_opt_in: boolean;
  show_online_status?: boolean;
  show_last_seen?: boolean;
  show_read_receipts?: boolean;
  show_typing_status?: boolean;
  allow_direct_messages?: 'everyone' | 'verified_only' | 'nobody';
}

export interface UserSession {
  id: string;
  user_id: string;
  device: string;
  browser: string;
  ip_address: string;
  location?: string;
  created_at: string;
  last_active: string;
  expires_at: string;
  is_current: boolean;
}

export interface LoginEvent {
  id: string;
  user_id: string;
  event_type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGED' | 'SESSION_REVOKED';
  ip_address: string;
  device_info: string;
  success: boolean;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  category: 'Security' | 'Profile' | 'Saved Content' | 'Bookings' | 'Messages';
  details?: string;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'admin';
  sender_name: string;
  text: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  messages: ConversationMessage[];
  unread_user_count: number;
  unread_admin_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PRANTIK CHAT — INTERNAL MESSAGING TYPES
// ==========================================

export type ChatType =
  | 'DIRECT'            // User <-> User, User <-> Admin, Artist <-> Admin, Owner <-> User
  | 'GROUP'             // User/Artist/Fan group chats
  | 'TEAM'              // Label team internal operations
  | 'LABEL_SUPPORT'     // Artist -> Record Label Team / Support
  | 'USER_SUPPORT'      // User -> Support Desk
  | 'AI';               // User/Artist -> PRANTIK AI

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size_bytes?: number;
  mime_type?: string;
  duration_seconds?: number;
}

export interface ChatReaction {
  emoji: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export type ConversationMode =
  | 'WAITING_FOR_HUMAN'
  | 'HUMAN_ACTIVE'
  | 'AI_ACTIVE'
  | 'HUMAN_AND_AI_HANDOFF'
  | 'CLOSED';

export type SenderType =
  | 'USER'
  | 'AI'
  | 'ADMIN'
  | 'PRESS'
  | 'SUPPORT'
  | 'CREATOR'
  | 'MODERATOR'
  | 'SYSTEM';

export type HumanOperatorRole = 'ADMIN' | 'PRESS' | 'SUPPORT' | 'CREATOR';

export type HumanAvailability = 'ONLINE' | 'AWAY' | 'OFFLINE' | 'BUSY';

export interface OperatorPresence {
  operator_id: string;
  operator_name: string;
  role: HumanOperatorRole;
  availability: HumanAvailability;
  last_active: string;
}

export interface PrantikChatSystemSettings {
  human_response_timeout_seconds: number; // default 120
  ai_auto_response_enabled: boolean; // default true
  escalation_enabled: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type?: SenderType;
  sender_role: UserRole | 'AI' | 'SYSTEM' | 'PRESS' | 'SUPPORT' | 'CREATOR';
  sender_avatar?: string;
  text: string;
  attachments?: ChatAttachment[];
  reply_to_message_id?: string;
  reply_snippet?: {
    id: string;
    sender_name: string;
    text: string;
  };
  reactions: ChatReaction[];
  status: MessageDeliveryStatus;
  ai_generated?: boolean;
  human_generated?: boolean;
  delivered_at?: string;
  read_at?: string;
  is_deleted?: boolean;
  is_edited?: boolean;
  edited_at?: string;
  created_at: string;
}

export interface ChatParticipant {
  user_id: string;
  user_name: string;
  user_role: UserRole | 'AI';
  user_avatar?: string;
  joined_at: string;
  is_group_admin?: boolean;
  last_read_message_id?: string;
  last_read_at?: string;
}

export type LabelTopicType =
  | 'GENERAL'
  | 'RELEASE'
  | 'DISTRIBUTION'
  | 'METADATA'
  | 'ISRC'
  | 'UPC_EAN'
  | 'DITTO'
  | 'PAYMENT'
  | 'AGREEMENT'
  | 'DOCUMENTS'
  | 'SUPPORT'
  | 'COLLABORATION';

export interface ChatConversationUserState {
  is_pinned?: boolean;
  is_archived?: boolean;
  is_muted?: boolean;
  is_deleted_locally?: boolean;
  unread_count: number;
}

export interface ChatConversation {
  id: string;
  type: ChatType;
  title: string;
  avatar_url?: string;
  description?: string;
  created_by: string; // user_id
  participants: ChatParticipant[];
  participant_ids: string[];
  
  // Real-time Human + AI Hybrid States
  mode?: ConversationMode;
  ai_enabled?: boolean;
  human_operator_id?: string | null;
  human_operator_name?: string | null;
  human_operator_role?: HumanOperatorRole | null;
  human_response_deadline?: string | null;
  human_response_timeout_seconds?: number;
  target_queue?: 'ALL' | 'SUPPORT' | 'PRESS' | 'ADMIN' | 'CREATOR' | 'USER';
  waiting_notice?: string | null;
  closed_at?: string | null;

  // Specific metadata for Label & Support channels
  topic?: LabelTopicType;
  related_record_id?: string; // e.g. release id, agreement id, ticket id
  status: 'ACTIVE' | 'PENDING_ADMIN' | 'RESOLVED' | 'ARCHIVED';

  // Per-user configuration stored map
  user_states: Record<string, ChatConversationUserState>;

  last_message?: {
    id: string;
    sender_id: string;
    sender_name: string;
    text: string;
    status: MessageDeliveryStatus;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ChatReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_user_id?: string;
  reported_message_id?: string;
  conversation_id: string;
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'INTELLECTUAL_PROPERTY' | 'FRAUD' | 'OTHER';
  details: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
  created_at: string;
}

export interface ChatBlockedUser {
  id: string;
  user_id: string; // The user who initiated the block
  blocked_user_id: string;
  blocked_user_name: string;
  created_at: string;
}

export type UserOnlineStatus = 'ONLINE' | 'AWAY' | 'OFFLINE';

export interface UserPresence {
  user_id: string;
  status: UserOnlineStatus;
  last_seen: string;
  is_typing_in_conversation_id?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  country?: string;
  phone?: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  notification_preferences: NotificationPreferences;
  privacy_settings: PrivacySettings;
  created_at: string;
  last_login_at?: string;
}

export interface WebsiteSectionConfig {
  id: string;
  name: string;
  is_enabled: boolean;
  display_order: number;
  custom_title?: string;
  custom_subtitle?: string;
}

export interface ThemeConfig {
  primary_accent: string; // default: #e11d48 (crimson)
  gold_accent: string; // default: #f59e0b (gold)
  canvas_bg: string; // default: #070709 (matte black)
  surface_dark: string; // default: #0c0c11
  font_display: string;
  font_body: string;
  custom_css?: string;
}

export interface MaintenanceConfig {
  is_enabled: boolean;
  message: string;
  estimated_return?: string;
}

export interface SiteSettings {
  artist_name: string;
  artist_title: string;
  tagline: string;
  bio: string;
  extended_bio: string;
  genres: string[];
  based_in: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url?: string;
  social_links: {
    spotify?: string;
    youtube?: string;
    apple_music?: string;
    jiosaavn?: string;
    instagram?: string;
    x?: string;
    facebook?: string;
    soundcloud?: string;
  };
  contact_email: string;
  booking_email: string;
  press_email: string;
  management_info?: string;
  record_label?: string;
  sections?: WebsiteSectionConfig[];
  theme?: ThemeConfig;
  maintenance?: MaintenanceConfig;
}

export type ContentStatus = 'PUBLISHED' | 'DRAFT' | 'SCHEDULED' | 'ARCHIVED';

export interface TrackItem {
  id: string;
  number: number;
  title: string;
  duration: string;
  audio_url?: string;
  featured_artists?: string[];
}

export interface Release {
  id: string;
  title: string;
  slug: string;
  type: 'Single' | 'EP' | 'Album' | 'Mixtape';
  release_date: string;
  artist: string;
  artwork_url: string;
  description: string;
  genre?: string;
  audio_preview_url?: string;
  tracks?: TrackItem[];
  spotify_url?: string;
  apple_music_url?: string;
  youtube_music_url?: string;
  jiosaavn_url?: string;
  other_urls?: { name: string; url: string }[];
  status: ContentStatus;
  featured: boolean;
  featured_order: number;
  featured_start_at?: string;
  featured_end_at?: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  platform: 'YouTube' | 'Vimeo' | 'Direct';
  thumbnail_url: string;
  published_date: string;
  duration?: string;
  director?: string;
  status: ContentStatus;
  featured: boolean;
  featured_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: 'News' | 'Behind The Scenes' | 'Announcement' | 'Creative Note' | 'Release Story';
  published_date: string;
  read_time: string;
  author: string;
  tags: string[];
  status: ContentStatus;
  featured: boolean;
  featured_order: number;
  created_at: string;
}

export interface PressArticle {
  id: string;
  publication: string;
  title: string;
  slug: string;
  coverage_type: 'Interview' | 'Review' | 'Feature' | 'Cover Story' | 'News';
  publication_date: string;
  excerpt: string;
  external_url: string;
  author_name?: string;
  status: ContentStatus;
  featured: boolean;
  featured_order: number;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  description: string;
  ticket_url?: string;
  ticket_status?: 'Available' | 'Sold Out' | 'Free Entry' | 'VIP Only';
  is_past: boolean;
  status: ContentStatus;
  featured: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Music' | 'Studio' | 'Performance' | 'Events' | 'Behind The Scenes' | 'Press';
  image_url: string;
  caption?: string;
  photographer_credit?: string;
  display_order: number;
  featured: boolean;
  created_at: string;
}

export interface EPKFile {
  id: string;
  title: string;
  category: 'Bio & One-Sheet' | 'High-Res Photos' | 'Logos & Brand Kit' | 'Stage Plot & Tech Rider' | 'Press Clippings';
  description: string;
  file_url: string;
  file_type: string;
  file_size: string;
  is_public: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface BookingInquiry {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  event_type: 'Concert' | 'Festival' | 'College Fest' | 'Club Show' | 'Corporate' | 'Collaboration' | 'Other';
  event_date: string;
  location: string;
  budget?: string;
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'ARCHIVED';
  created_at: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'RESPONDED';
  created_at: string;
}

export type NotificationType =
  | 'NEW_RELEASE'
  | 'NEW_VIDEO'
  | 'NEW_ARTICLE'
  | 'NEW_PRESS'
  | 'NEW_EVENT'
  | 'BOOKING_UPDATE'
  | 'MESSAGE'
  | 'SECURITY_ALERT'
  | 'ACCOUNT_UPDATE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read_at?: string;
  is_read: boolean;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  environment: 'production' | 'staging' | 'all';
  updated_at: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED';
  created_at: string;
  last_used_at?: string;
}

export interface WebhookItem {
  id: string;
  endpoint: string;
  events: string[];
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  secret_preview: string;
  last_delivery?: string;
  created_at: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  category: 'PUBLISHING' | 'EMAIL' | 'MEDIA' | 'BACKUP' | 'CLEANUP';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: string;
  mime_type: string;
  created_at: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  type: 'BANNER' | 'ANNOUNCEMENT' | 'RELEASE_HERO' | 'TOUR_SPOTLIGHT';
  description: string;
  cta_label: string;
  cta_url: string;
  is_active: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}

export interface SEOMetadata {
  page_route: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image?: string;
  json_ld?: string;
}

export interface CurrentlyPlayingTrack {
  release_id: string;
  release_title: string;
  track_title: string;
  artist: string;
  artwork_url: string;
  audio_url: string;
  duration?: string;
  spotify_url?: string;
  apple_music_url?: string;
  youtube_music_url?: string;
  jiosaavn_url?: string;
}

// ==========================================
// MULTI-SITE / PROJECT BUILDER TYPES
// ==========================================

export type SiteCategory =
  | 'Artist'
  | 'Music'
  | 'Record Label'
  | 'Portfolio'
  | 'Business'
  | 'Blog'
  | 'Landing Page'
  | 'E-Commerce'
  | 'Custom';

export type SiteEnvironment = 'Development' | 'Staging' | 'Production';

export type SiteStatus = 'draft' | 'building' | 'deployed' | 'error' | 'suspended';

export type SiteSourceType =
  | 'blank'
  | 'zip_import'
  | 'html_import'
  | 'project_import'
  | 'template'
  | 'git_repo';

export interface SiteProject {
  id: string; // e.g. site_01k892abx...
  name: string;
  slug: string;
  description: string;
  category: SiteCategory;
  language: string;
  timezone: string;
  currency: string;
  environment: SiteEnvironment;
  status: SiteStatus;
  source_type: SiteSourceType;
  template_id?: string;
  custom_domain?: string;
  preview_url: string;
  production_url?: string;
  active_deployment_id?: string;
  active_version_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_files_count: number;
  total_size_bytes: number;
  tags?: string[];
}

export interface ProjectFile {
  id: string;
  site_id: string;
  path: string; // e.g. 'src/App.tsx' or 'index.html'
  name: string;
  extension: string;
  content: string;
  is_binary?: boolean;
  size_bytes: number;
  mime_type: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: SiteCategory;
  description: string;
  badge?: string;
  icon: string;
  tags: string[];
  default_files: { path: string; content: string }[];
}

export type BuildStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export type BuildTrigger = 'manual' | 'commit' | 'deploy' | 'api' | 'import';

export interface ProjectBuild {
  id: string;
  site_id: string;
  version_id?: string;
  status: BuildStatus;
  trigger: BuildTrigger;
  triggered_by: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  commit_message?: string;
  logs: string[];
  artifact_url?: string;
  error_message?: string;
}

export type DeploymentStatus =
  | 'building'
  | 'ready'
  | 'promoting'
  | 'active'
  | 'superseded'
  | 'failed'
  | 'rolled_back';

export interface ProjectDeployment {
  id: string;
  site_id: string;
  build_id: string;
  environment: SiteEnvironment;
  status: DeploymentStatus;
  url: string;
  domain: string;
  ssl_status: 'active' | 'provisioning' | 'failed' | 'none';
  deployed_by: string;
  created_at: string;
  rolled_back_from?: string;
}

export interface ProjectVersion {
  id: string;
  site_id: string;
  version_number: number;
  name: string;
  commit_message: string;
  snapshot_file_count: number;
  created_by: string;
  created_at: string;
  files_snapshot: { path: string; content: string }[];
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  host: string;
  value: string;
  status: 'valid' | 'pending';
}

export interface ProjectDomain {
  id: string;
  site_id: string;
  domain_name: string;
  status: 'verified' | 'pending' | 'failed';
  ssl_status: 'active' | 'pending' | 'expired';
  dns_records: DnsRecord[];
  is_primary: boolean;
  created_at: string;
}

export interface ProjectEnvVar {
  id: string;
  site_id: string;
  key: string;
  value: string;
  target_env: 'All' | 'Production' | 'Staging' | 'Development';
  is_secret: boolean;
  updated_at: string;
}

export interface ProjectDatabaseConfig {
  id: string;
  site_id: string;
  provider: 'sqlite_in_memory' | 'postgres' | 'indexeddb' | 'custom';
  tables_count: number;
  records_count: number;
  status: 'online' | 'syncing' | 'offline';
  last_backup_at?: string;
}

export type ConsoleServiceType =
  | 'frontend'
  | 'backend'
  | 'api'
  | 'database'
  | 'build'
  | 'deployment'
  | 'jobs'
  | 'storage'
  | 'websocket'
  | 'security';

export interface ProjectErrorLog {
  id: string; // e.g. err_928192
  site_id: string;
  timestamp: string;
  environment: SiteEnvironment;
  service: ConsoleServiceType;
  file?: string;
  line?: number;
  endpoint?: string;
  http_status?: number;
  request_id?: string;
  message: string;
  stack_trace?: string;
  severity: 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ProjectRuntimeLog {
  id: string;
  site_id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR' | 'CRITICAL';
  service: 'app' | 'api' | 'worker' | 'database' | 'websocket' | 'security';
  message: string;
  request_id?: string;
  metadata?: Record<string, any>;
}

export interface ProjectSearchMatch {
  file_path: string;
  line_number: number;
  line_content: string;
  match_preview: string;
  match_type: 'symbol' | 'import' | 'route' | 'component' | 'config' | 'text';
}

export interface ProjectCommandResult {
  command: string;
  exit_code: number;
  timestamp: string;
  duration_ms: number;
  output_lines: { text: string; stream: 'stdout' | 'stderr' | 'info' | 'success' | 'error' }[];
}


// ==========================================
// ADMIN AI CONTROL CENTER & AGENT TYPES
// ==========================================

export type AiAgentModeId = string;

export type AiAgentCategory =
  | 'Core AI / Orchestration'
  | 'Website / Product'
  | 'Code / Development'
  | 'Testing / Quality'
  | 'Security'
  | 'Build / Deployment / Infrastructure'
  | 'Music / Artist'
  | 'Record Label'
  | 'Video / Media'
  | 'User Support'
  | 'AI / Coins / Wallet'
  | 'Referral / Rewards'
  | 'Communication'
  | 'Analytics'
  | 'Admin / Operations'
  | 'Legal / Policy'
  | 'Data'
  | 'Operations / Reliability'
  | 'Advanced Agents'
  | 'Core Engineering'
  | 'Quality & Security'
  | 'DevOps & Infrastructure'
  | 'Content & Media'
  | 'Intelligence & Support'
  | string;

export interface AiAgentVersion {
  version: string;
  released_at: string;
  changelog: string;
  author: string;
}

export interface AiAgentLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  message: string;
  task_id?: string;
  details?: string;
}

export type AiAgentApprovalPolicy =
  | 'ALWAYS_REQUIRE_APPROVAL'
  | 'CRITICAL_ONLY'
  | 'AUTO_PUBLISH_LOW_RISK'
  | 'READ_ONLY_SUGGEST';

export interface AiAgentTaskQueueItem {
  id: string;
  title: string;
  priority: AiTaskPriority;
  created_at: string;
  estimated_seconds: number;
}

export interface AiAgentCurrentTask {
  id: string;
  title: string;
  started_at: string;
  current_workflow_step: string;
  progress_percent: number;
}

export interface AiAgentTaskHistoryItem {
  id: string;
  title: string;
  status: AiTaskStatus;
  duration_seconds: number;
  tokens: number;
  completed_at: string;
}

export interface AiAgentErrorLog {
  id: string;
  timestamp: string;
  message: string;
  code?: string;
  resolved: boolean;
}

export interface AiAgentPerformanceMetrics {
  average_response_ms: number;
  success_rate_percent: number;
  throughput_per_min: number;
  uptime_percent: number;
}

export interface AiAgentMode {
  id: AiAgentModeId;
  name: string;
  role_title: string;
  category: AiAgentCategory;
  agent_number?: number;
  purpose: string;
  description: string;
  is_enabled?: boolean;
  is_paused?: boolean;
  emergency_stopped?: boolean;
  schedule_cron?: string;
  allowed_tools: string[];
  allowed_data_sources?: string[];
  scope_restrictions?: string[];
  permission_scope: string;
  current_status: AiAgentStatus;
  active_tasks_count: number;
  completed_tasks_count: number;
  failed_tasks_count?: number;
  tokens_used_today: number;
  daily_token_limit: number;
  budget_limit_usd?: number;
  cost_today_usd?: number;
  max_runtime_seconds: number;
  max_concurrency: number;
  retry_limit?: number;
  approval_policy: AiAgentApprovalPolicy;
  current_task?: AiAgentCurrentTask | null;
  task_queue?: AiAgentTaskQueueItem[];
  task_history?: AiAgentTaskHistoryItem[];
  execution_logs?: AiAgentLogEntry[];
  errors_count?: number;
  error_logs?: AiAgentErrorLog[];
  performance_metrics?: AiAgentPerformanceMetrics;
  version_history: AiAgentVersion[];
  logs: AiAgentLogEntry[];
  icon_name: string;
  key_responsibilities: string[];
  workflow_steps?: string[];
}

export type AiAgentStatus =
  | 'IDLE'
  | 'ANALYZING'
  | 'WORKING'
  | 'TESTING'
  | 'WAITING_APPROVAL'
  | 'DEPLOYING'
  | 'PAUSED'
  | 'ERROR';

export type AiTaskStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type AiTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AiApprovalLevel =
  | 'READ_ONLY'
  | 'SUGGEST'
  | 'DEVELOPMENT'
  | 'PREVIEW'
  | 'AUTO_PUBLISH';

export interface AiTask {
  id: string;
  title: string;
  description: string;
  agent: string;
  project_id: string;
  scope: string;
  priority: AiTaskPriority;
  status: AiTaskStatus;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  logs: string[];
  files_changed: string[];
  diff_content?: string;
  token_usage: number;
  test_results?: string;
  build_result?: string;
  preview_url?: string;
  rollback_version_id?: string;
  error_message?: string;
  max_runtime_seconds?: number;
  retry_count?: number;
}

export interface AiDiffSummary {
  files_count: number;
  additions: number;
  deletions: number;
  components_added: string[];
  components_modified: string[];
  dependencies_added: string[];
}

export interface AiApproval {
  id: string;
  task_id: string;
  title: string;
  description: string;
  type: 'CODE_CHANGE' | 'FEATURE_DEPLOY' | 'DATABASE_MIGRATION' | 'SEO_UPDATE' | 'PERFORMANCE_FIX';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  diff_summary: AiDiffSummary;
  diff_raw?: string;
  preview_available: boolean;
  preview_version_id?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback_notes?: string;
}

export interface AiFeatureRequest {
  id: string;
  name: string;
  description: string;
  user_problem: string;
  priority: AiTaskPriority;
  target_site_id: string;
  target_environment: 'Development' | 'Staging' | 'Production';
  design_requirements: string;
  technical_requirements: string;
  acceptance_criteria: string;
  status: 'DRAFT' | 'SPECIFYING' | 'IMPLEMENTING' | 'TESTING' | 'PREVIEW_READY' | 'APPROVED' | 'DEPLOYED';
  specification?: string;
  ui_proposal?: string;
  database_requirements?: string;
  api_requirements?: string;
  created_at: string;
  version_id?: string;
  files_changed_count?: number;
}

export interface AiScheduledJob {
  id: string;
  name: string;
  interval_cron: string;
  interval_label: string;
  description: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at: string;
  last_status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'SKIPPED';
  target_site_id: string;
  last_finding?: string;
}

export interface AiAuditProposal {
  id: string;
  category: 'UI_UX' | 'PERFORMANCE' | 'ACCESSIBILITY' | 'SEO' | 'SECURITY' | 'RESPONSIVENESS' | 'CODE_QUALITY';
  title: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string;
  suggested_fix: string;
  affected_files: string[];
  status: 'PROPOSED' | 'APPLIED' | 'DISMISSED';
  created_at: string;
  auto_fixable: boolean;
}

export interface AiModelConfig {
  id: string;
  provider: string;
  model_name: string;
  purpose: string;
  context_limit: number;
  temperature: number;
  is_active: boolean;
  is_fallback: boolean;
  daily_token_budget: number;
  tokens_used_today: number;
}

export interface AiToolPermission {
  id: string;
  tool_key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  requires_approval: boolean;
  category: 'PROJECT' | 'FILE' | 'DATABASE' | 'BUILD' | 'DEPLOY' | 'OBSERVABILITY';
}

export interface AiPolicyConfig {
  approval_level: AiApprovalLevel;
  critical_changes_require_owner: boolean;
  isolate_env_secrets: boolean;
  read_only_database_default: boolean;
  prevent_destructive_shell: boolean;
  prevent_self_permission_grant: boolean;
  max_concurrent_tasks: number;
  max_task_duration_seconds: number;
  daily_budget_tokens: number;
  monthly_budget_tokens: number;
  is_paused: boolean;
  stop_all_active: boolean;
  auto_deploy_disabled?: boolean;
  autonomous_changes_disabled?: boolean;
  emergency_shutdown?: boolean;
  last_updated_by: string;
  last_updated_at: string;
}

export interface AiActivityEvent {
  id: string;
  event: string;
  details: string;
  type: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  timestamp: string;
  task_id?: string;
}

export interface AiAgentMemoryContext {
  architecture_notes: string;
  design_system_rules: string;
  coding_conventions: string;
  routes_map: string[];
  components_count: number;
  active_rules: string[];
  last_indexed_at: string;
}

// ==========================================
// USER AI SUPPORT & CHAT TYPES
// ==========================================

export interface AiUserConversation {
  id: string;
  user_id: string;
  title: string;
  messages_count: number;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiUserMessageNavigationAction {
  label: string;
  target_tab: string;
  url_route?: string;
  icon?: string;
}

export interface AiUserMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source_type: 'label_authorized' | 'website_data' | 'general_ai' | 'clarification' | 'policy' | 'account' | 'help_docs' | 'ai_generated';
  navigation_action?: AiUserMessageNavigationAction;
  rating?: 'helpful' | 'not_helpful';
  star_rating?: number;
  feedback_note?: string;
  is_reported?: boolean;
  report_reason?: string;
  created_at: string;
}

export interface AiFreeAllowance {
  user_id: string;
  free_allowance_started_at: string;
  free_allowance_expires_at: string;
  free_seconds_used: number;
  free_seconds_remaining: number;
  next_reset_at: string;
  last_used_at?: string;
}

export interface AiUsageSession {
  id: string;
  user_id: string;
  conversation_id: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  type: 'free' | 'coin';
  coins_consumed: number;
  model: string;
  status: 'active' | 'completed' | 'stopped_time_limit' | 'interrupted';
}

export interface AiReport {
  id: string;
  user_id: string;
  user_email: string;
  message_id: string;
  conversation_id: string;
  reason: 'Incorrect' | 'Unclear' | 'Not relevant' | 'Technical issue' | 'Other';
  details: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  created_at: string;
}

export interface AiPolicyVersion {
  id: string;
  policy_key: 'terms' | 'privacy' | 'cookies' | 'community' | 'booking' | 'refund' | 'ai_usage' | 'coins' | 'referrals';
  title: string;
  version: string;
  content: string;
  effective_date: string;
  changed_by: string;
  change_summary: string;
  is_published: boolean;
  updated_at: string;
}

// ==========================================
// USER WALLET, COINS & LEDGER TYPES
// ==========================================

export interface UserWallet {
  user_id: string;
  coin_balance: number; // 1 Coin = 5 min AI usage
  free_ai_seconds_remaining: number; // Daily 60 seconds (1 minute)
  next_free_reset_at: string;
  total_coins_purchased: number;
  total_coins_used: number;
  total_rewards_earned: number;
  updated_at: string;
}

export type WalletTransactionType =
  | 'COIN_PURCHASE'
  | 'AI_USAGE'
  | 'FREE_AI_USAGE'
  | 'REWARD'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT'
  | 'REFERRAL_REWARD'
  | 'DAILY_CHECKIN';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: WalletTransactionType;
  amount_inr?: number; // Real purchase amount if financial (e.g. ₹100 = 10 coins)
  coins_delta: number; // +/- coin balance
  seconds_delta?: number; // +/- free seconds
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  payment_ref?: string;
  description: string;
  created_at: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  inr_price: number;
  coins_count: number;
  minutes_provided: number; // 1 coin = 5 mins
  badge?: string;
  popular?: boolean;
}

// ==========================================
// REWARDS, DAILY CHECK-IN & LUCKY ROLL TYPES
// ==========================================

export interface DailyCheckIn {
  id: string;
  user_id: string;
  date_str: string; // YYYY-MM-DD
  reward_type: 'free_ai_minute' | 'bonus_coin' | 'badge';
  reward_value: number;
  claimed_at: string;
}

export interface DailyRoll {
  id: string;
  user_id: string;
  date_str: string; // YYYY-MM-DD
  roll_result: {
    title: string;
    reward_type: 'bonus_ai_minute' | 'bonus_coin' | 'badge' | 'cosmetic' | 'no_reward';
    reward_value: number;
    icon: string;
    badge_name?: string;
    description: string;
  };
  created_at: string;
}

export interface PlatformRewardItem {
  id: string;
  name: string;
  category: 'AI_CREDIT' | 'BADGE' | 'FEATURE_UNLOCK' | 'DISCOUNT_VOUCHER';
  cost_credits: number;
  description: string;
  icon: string;
  is_available: boolean;
}

export interface RewardClaim {
  id: string;
  user_id: string;
  reward_id: string;
  reward_name: string;
  cost_credits: number;
  claimed_at: string;
}

// ==========================================
// SUPPORT TICKET ESCALATION TYPES
// ==========================================

export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  ai_conversation_id?: string;
  category: 'ACCOUNT' | 'BILLING' | 'AI_CHAT' | 'BOOKINGS' | 'TECHNICAL' | 'GENERAL';
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin' | 'ai';
  sender_name: string;
  message: string;
  created_at: string;
}

// ==========================================
// REFERRAL SYSTEM TYPES
// ==========================================

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string; // e.g. "PRANTIK-7K4X9"
  created_at: string;
  is_active: boolean;
}

export type ReferralStatus = 'PENDING' | 'QUALIFIED' | 'REWARDED' | 'REJECTED';

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  referred_user_name: string;
  referred_user_email_masked: string; // e.g. "j***@gmail.com"
  referral_code: string;
  status: ReferralStatus;
  reward_type: 'bonus_ai_minutes' | 'bonus_coins' | 'badge';
  reward_value: number; // e.g. 1 minute or 1 coin
  created_at: string;
  qualified_at?: string;
  rewarded_at?: string;
}

export interface ReferralCampaign {
  id: string;
  name: string;
  code_prefix: string;
  reward_description: string;
  reward_type: 'bonus_ai_minutes' | 'bonus_coins';
  reward_value: number;
  max_rewards_per_user: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  created_at: string;
}

// ==========================================
// RECORD LABEL — PRICING, PLANS & SERVICES
// ==========================================

export interface ArtistJoinPlanConfig {
  plan_name: string;
  join_fee_inr: number; // ₹999 one-time
  annual_fee_inr: number; // ₹1,999/year
  description: string;
  included_features: string[];
}

export interface MusicDistributionConfig {
  price_per_song_inr: number; // ₹3,000 per song
  description: string;
  distribution_provider: string; // e.g. "DITTO"
}

export interface VideoDistributionConfig {
  price_per_video_song_inr: number; // ₹3,000 per video song
  description: string;
}

export interface VideoChannelConfig {
  price_inr: number; // ₹5,000 one-time
  title: string;
  description: string;
  disclaimer: string;
}

export interface VevoServicesConfig {
  vevo_channel_setup_inr: number; // ₹5,000 per channel
  vevo_channel_title: string;
  vevo_channel_description: string;
  vevo_music_video_inr: number; // ₹3,000 per video/song
  vevo_music_video_title: string;
  vevo_music_video_description: string;
  disclaimer: string;
}

export interface CustomWebsiteServiceConfig {
  price_inr: number; // ₹9,999 one-time
  title: string;
  description: string;
  features: string[];
}

export interface RevenueShareConfig {
  label_share_percent: number; // 15%
  artist_share_percent: number; // 85%
  agreement_terms: string;
}

export interface LabelPricingConfig {
  id: string;
  artist_join_plan: ArtistJoinPlanConfig;
  music_distribution: MusicDistributionConfig;
  video_distribution: VideoDistributionConfig;
  video_channel: VideoChannelConfig;
  vevo_services: VevoServicesConfig;
  custom_artist_website: CustomWebsiteServiceConfig;
  revenue_share: RevenueShareConfig;
  tax_rate_percent: number;
  is_tax_enabled: boolean;
  currency: string;
  currency_symbol: string;
  refund_policy_notice: string;
  updated_at: string;
  updated_by: string;
}

export interface LabelCheckoutItem {
  id: string;
  title: string;
  service_type:
    | 'JOIN_FEE'
    | 'ANNUAL_FEE'
    | 'MUSIC_DISTRIBUTION'
    | 'VIDEO_DISTRIBUTION'
    | 'VIDEO_CHANNEL'
    | 'VEVO_CHANNEL'
    | 'VEVO_VIDEO'
    | 'CUSTOM_WEBSITE';
  quantity: number;
  unit_price: number;
  subtotal: number;
  details?: string;
}

export interface LabelServiceOrder {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  artist_name: string;
  items: LabelCheckoutItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  currency_symbol: string;
  payment_method: 'UPI' | 'CREDIT_DEBIT_CARD' | 'NET_BANKING' | 'BANK_TRANSFER' | 'RAZORPAY_DEMO';
  payment_status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  terms_accepted: boolean;
  refund_policy_acknowledged: boolean;
  distribution_provider?: string;
  release_id?: string;
  release_title?: string;
  notes?: string;
  created_at: string;
  paid_at?: string;
}

export interface LabelArtistMembership {
  id: string;
  user_id: string;
  user_email: string;
  artist_name: string;
  stage_name?: string;
  plan_name: string;
  join_fee_paid: boolean;
  join_fee_paid_at?: string;
  annual_fee_status: 'ACTIVE' | 'PENDING_PAYMENT' | 'GRACE_PERIOD' | 'EXPIRED';
  annual_fee_amount: number;
  membership_start_date: string;
  membership_renewal_date: string;
  distribution_provider: string;
  revenue_share_label_percent: number;
  revenue_share_artist_percent: number;
  status: 'ACTIVE' | 'PENDING_ONBOARDING' | 'SUSPENDED' | 'EXPIRED';
  releases_distributed_count: number;
  total_paid_inr: number;
  created_at: string;
  updated_at: string;
}

export interface LabelDistributionSubmission {
  id: string;
  artist_id: string;
  artist_name: string;
  user_id: string;
  user_email: string;
  release_title: string;
  release_type: 'Single' | 'EP' | 'Album' | 'Music Video';
  tracks_count: number;
  track_list: { number: number; title: string; duration?: string; audio_file_name?: string; isrc?: string }[];
  video_file_name?: string;
  genre: string;
  target_release_date: string;
  upc_code?: string;
  distribution_provider: string; // e.g. "DITTO"
  services_requested: {
    music_distribution: boolean;
    video_distribution: boolean;
    vevo_video: boolean;
    vevo_channel_setup: boolean;
    video_channel_setup: boolean;
  };
  total_calculated_fee: number;
  payment_order_id?: string;
  payment_status: 'PAID' | 'UNPAID' | 'PENDING';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IN_DELIVERY' | 'LIVE' | 'REJECTED';
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistInvoice {
  id: string; // e.g. "INV-LBL-2026-8492"
  order_id: string;
  artist_id: string;
  artist_name: string;
  artist_email: string;
  service_name: string;
  items: LabelCheckoutItem[];
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  currency_symbol: string;
  payment_reference: string; // e.g. "PAY-LBL-DITTO-..."
  payment_method: string;
  payment_date: string;
  status: 'PAID' | 'REFUNDED' | 'CANCELLED' | 'PENDING';
  distribution_provider: string; // e.g. "DITTO"
  pdf_download_url?: string;
  created_at: string;
}

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface ArtistPayment {
  id: string;
  payment_reference: string;
  order_id: string;
  invoice_id?: string;
  artist_id: string;
  artist_name: string;
  artist_email: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: PaymentTransactionStatus;
  idempotency_key: string;
  signature_verified: boolean;
  webhook_received_at?: string;
  provider_transaction_id: string;
  failure_reason?: string;
  created_at: string;
}

export interface ArtistAgreementClause {
  id: string;
  title: string;
  content: string;
  is_mandatory: boolean;
}

export interface ArtistAgreement {
  id: string;
  version: string; // e.g. "v2026.1"
  title: string;
  effective_date: string;
  agreement_hash: string;
  joining_fee_inr: number;
  annual_fee_inr: number;
  distribution_per_song_inr: number;
  video_distribution_inr: number;
  channel_setup_inr: number;
  vevo_channel_inr: number;
  vevo_video_inr: number;
  revenue_share_label_percent: number; // 15%
  revenue_share_artist_percent: number; // 85%
  clauses: ArtistAgreementClause[];
  refund_policy: string;
  takedown_rules: string;
  termination_rules: string;
}

export interface ArtistAgreementAcceptance {
  id: string;
  agreement_id: string;
  agreement_version: string;
  agreement_hash: string;
  artist_id: string;
  artist_name: string;
  artist_email: string;
  accepted_timestamp: string;
  ip_address: string;
  session_id: string;
  user_agent: string;
  signature_text: string;
  is_verified: boolean;
}

export interface PricingHistoryEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  previous_pricing: Partial<LabelPricingConfig>;
  reason?: string;
}

export interface RoyaltyConfiguration {
  id: string;
  agreement_id: string;
  label_share_percent: number; // 15%
  artist_share_percent: number; // 85%
  reporting_frequency: 'MONTHLY' | 'QUARTERLY';
  distribution_provider: string; // "DITTO"
  applicable_deductions_description: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PRANTIK SARKAR ARTIST RECORD — INVITE-ONLY RECORD LABEL
// ==========================================

export interface LabelCapacity {
  id: string;
  maximum_active_artists: number; // 40
  current_active_artists: number;
  updated_at: string;
  updated_by: string;
}

// Independent State Machine Statuses
export type LabelApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'WAITLISTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type LabelInvitationStatus =
  | 'NOT_INVITED'
  | 'INVITED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'REVOKED';

export type LabelArtistStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED';

export type LabelPaymentStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type EmailDeliveryStatus =
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'FAILED'
  | 'REJECTED';

export interface LabelInvitation {
  id: string;
  token: string;
  token_hash?: string;
  artist_name: string;
  email: string;
  phone?: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  status: LabelInvitationStatus;
  allowed_services: string[];
  notes?: string;
  accepted_at?: string;
  accepted_application_id?: string;
}

export interface LabelApplicationServicesInterest {
  music_distribution: boolean;
  music_distribution_details?: string;
  video_distribution: boolean;
  video_distribution_details?: string;
  vevo_services: boolean;
  vevo_services_details?: string;
  video_channel_services: boolean;
  video_channel_details?: string;
  release_management: boolean;
  release_management_details?: string;
  artist_support: boolean;
  artist_support_details?: string;
  other_services: boolean;
  other_services_details?: string;
}

export interface LabelApplication {
  id: string; // PSAR-XXXXXXXX
  invitation_id?: string;
  invitation_token?: string;

  // Statuses (Separated)
  application_status: LabelApplicationStatus;
  invitation_status: LabelInvitationStatus;
  artist_status: LabelArtistStatus;
  payment_status: LabelPaymentStatus;

  // Section A — Contact Information
  full_name: string;
  artist_name: string;
  email: string;
  confirm_email: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  state_province?: string;
  city: string;
  preferred_contact_method: 'Email' | 'WhatsApp' | 'Phone';
  best_time_to_contact?: string;
  preferred_language?: string;

  // Section 3 — Artist Information
  artist_type: 'Solo Artist' | 'Duo' | 'Group' | 'Band' | 'Producer' | 'DJ' | 'Composer' | 'Songwriter' | 'Other';
  primary_genre: string;
  genre?: string;
  secondary_genre?: string;
  subgenre?: string;
  artist_bio: string;
  started_making_music_year: string;
  current_artist_status: 'Independent' | 'Currently Signed' | 'Previously Signed' | 'Label/Team' | 'Other';
  official_releases_count?: number;
  unreleased_tracks_count?: number;
  main_music_languages?: string;
  target_regions?: string;

  // Section 4 — Music Profile
  spotify_url?: string;
  apple_music_url?: string;
  youtube_url?: string;
  amazon_music_url?: string;
  jiosaavn_url?: string;
  other_streaming_links?: string;
  official_website?: string;
  instagram_url?: string;
  facebook_url?: string;
  x_twitter_url?: string;
  tiktok_url?: string;
  other_social_profiles?: string;

  // Section 5 — Music Experience
  music_type_description: string;
  artistic_influences?: string;
  music_differentiation?: string;
  most_important_release?: string;
  currently_promoting_release?: string;
  planning_next_release?: string;
  unreleased_music_ready: 'Yes' | 'No';
  expected_releases_12m?: number;
  professional_quality_masters: 'Yes' | 'No' | 'Some';
  original_artwork?: boolean | string;
  rights_ownership: 'Yes' | 'No' | 'Shared/Other';

  // Section 6 — Distribution Information
  previously_distributed: 'Yes' | 'No';
  current_distributor?: string;
  previous_distribution_provider?: string;
  has_existing_isrcs?: boolean;
  has_existing_upc_ean?: boolean;
  has_existing_catalog?: boolean;
  distribute_new_releases?: boolean;
  distribute_existing_catalog?: boolean;
  approx_tracks_count?: number;
  approx_videos_count?: number;
  desired_release_frequency?: string;

  // Section 7 — Label Services Interest
  services_interest: LabelApplicationServicesInterest;

  // Section 8 — Artist Goals
  goals_joining_label?: string;
  expectations_from_label?: string;
  support_needed?: string;
  goals_next_12m?: string;
  long_term_goals?: string;
  working_with_manager?: boolean;
  working_with_producer_team?: boolean;
  who_else_involved?: string;

  // Section 9 — Team / Business Information
  is_self_managed: boolean;
  management_name?: string;
  manager_email?: string;
  manager_phone?: string;
  record_label_name?: string;
  publisher_name?: string;
  distributor_name?: string;
  production_team?: string;
  other_representative?: string;

  // Section 10 — Documents / Links
  epk_url?: string;
  portfolio_url?: string;
  press_url?: string;
  live_performance_url?: string;
  music_video_url?: string;
  materials_folder_url?: string;
  additional_documents_url?: string;
  uploaded_documents?: LabelApplicationDocument[];

  // Section 11 — Invitation Information
  was_invited: 'Yes' | 'No' | 'Not sure';
  inviter_name?: string;
  inviter_email?: string;
  invitation_code?: string;
  invitation_link?: string;
  invitation_verified: boolean;

  // Section 12 — Why are you contacting us?
  why_work_with_psar: string;
  how_discovered: 'Official Website' | 'Instagram' | 'YouTube' | 'Friend/Artist' | 'Direct Invitation' | 'Search Engine' | 'Other';
  anything_else?: string;

  // Section 13 — Payment / Application Review Fee
  application_fee_required: boolean;
  application_fee_amount_inr?: number;
  fee_acknowledged_no_guarantee: boolean;
  fee_acknowledged_review_only: boolean;
  fee_acknowledged_accurate: boolean;
  fee_acknowledged_refund_policy: boolean;
  payment_transaction_id?: string;
  payment_verified_at?: string;

  // Section 14 — Final Declarations (96-103)
  declaration_accurate: boolean;
  declaration_authority: boolean;
  declaration_no_agreement: boolean;
  declaration_additional_info: boolean;
  declaration_admin_review: boolean;
  declaration_terms: boolean;
  declaration_privacy: boolean;
  declaration_contact_consent: boolean;

  // Admin Review / Workflow
  internal_notes?: string;
  review_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LabelApplicationDocument {
  id: string;
  application_id: string;
  document_type: 'photo' | 'epk' | 'music_sample' | 'press' | 'rights' | 'other';
  file_name: string;
  file_size?: number;
  file_url: string;
  access_level: 'PRIVATE' | 'RESTRICTED';
  uploaded_at: string;
}

export interface LabelApplicationNote {
  id: string;
  application_id: string;
  author_name: string;
  author_email: string;
  note_text: string;
  is_internal_only: boolean;
  created_at: string;
}

export interface LabelApplicationContact {
  id: string;
  application_id: string;
  direction: 'OUTBOUND' | 'INBOUND';
  sender_email: string;
  recipient_email: string;
  subject: string;
  message_body: string;
  delivery_status: EmailDeliveryStatus;
  sent_at: string;
}

export interface LabelApplicationStatusHistory {
  id: string;
  application_id: string;
  previous_status: LabelApplicationStatus;
  new_status: LabelApplicationStatus;
  changed_by: string;
  reason?: string;
  timestamp: string;
}

export interface LabelApplicationPayment {
  id: string;
  application_id: string;
  amount_inr: number;
  currency: string;
  payment_provider: 'RAZORPAY' | 'STRIPE' | 'UPI_DEMO';
  provider_payment_id?: string;
  provider_order_id?: string;
  provider_signature?: string;
  webhook_verified: boolean;
  webhook_verified_at?: string;
  payment_status: LabelPaymentStatus;
  refunded: boolean;
  refund_reason?: string;
  created_at: string;
}

export interface LabelApplicationEmail {
  id: string;
  application_id: string;
  to_email: string;
  recipient_name: string;
  from_email: string;
  reply_to: string;
  subject: string;
  template_type: string;
  html_preview?: string;
  delivery_status: EmailDeliveryStatus;
  provider_message_id?: string;
  sent_at: string;
  delivered_at?: string;
  failure_reason?: string;
}

export interface LabelApplicationReview {
  id: string;
  application_id: string;
  reviewer_name: string;
  reviewer_email: string;
  score?: number;
  recommendation: 'APPROVE' | 'REJECT' | 'WAITLIST' | 'REQUEST_MORE_INFO';
  comments: string;
  reviewed_at: string;
}

export interface LabelApplicationAuditLog {
  id: string;
  application_id: string;
  action: string;
  performed_by: string;
  details: string;
  ip_address?: string;
  timestamp: string;
}

export interface LabelArtistProfile {
  id: string;
  user_id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  phone?: string;
  status: LabelArtistStatus;
  is_public: boolean;
  bio: string;
  genre: string;
  profile_image: string;
  social_links: Record<string, string>;
  public_releases_count: number;
  capacity_slot_number?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// DITTO DISTRIBUTION & RELEASE ID SYNC TYPES
// ==========================================

export type DistributionProviderName = 'DITTO';

export type ReleaseWorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUIRED'
  | 'APPROVED'
  | 'DISTRIBUTION_QUEUED'
  | 'DISTRIBUTING'
  | 'LIVE'
  | 'REJECTED'
  | 'TAKEDOWN_REQUESTED'
  | 'TAKEDOWN_COMPLETED';

export type DittoSyncStatus =
  | 'NOT_SUBMITTED'
  | 'SENT_TO_DITTO'
  | 'DITTO_ACCEPTED'
  | 'DITTO_PROCESSING'
  | 'DITTO_DELIVERING'
  | 'PARTIALLY_LIVE'
  | 'LIVE'
  | 'DITTO_REJECTED'
  | 'FAILED'
  | 'TAKEDOWN_PROCESSING'
  | 'TAKEDOWN_COMPLETED';

export interface PlatformDeliveryStatus {
  platform: 'Spotify' | 'Apple Music' | 'YouTube Music' | 'Amazon Music' | 'JioSaavn' | string;
  status: 'PENDING' | 'DELIVERING' | 'LIVE' | 'REJECTED' | 'FAILED' | 'TAKEDOWN';
  platform_release_id?: string;
  live_url?: string;
  last_updated: string;
  error?: string;
}

export interface DistributionProviderEvent {
  id: string;
  provider: DistributionProviderName;
  release_id: string;
  external_release_id?: string;
  external_submission_id?: string;
  external_distribution_id?: string;
  event_type: string;
  event_status: string;
  event_timestamp: string;
  request_reference?: string;
  response_reference?: string;
  raw_response_redacted?: string;
  created_at: string;
}

export interface DistributionRelease {
  id: string; // e.g. "PR-2026-000123"
  artist_id: string;
  artist_name: string;
  title: string;
  version?: string;
  featured_artists?: string[];
  remixer?: string;
  genre: string;
  subgenre?: string;
  language: string;
  is_explicit: boolean;
  release_date: string;
  original_release_date?: string;
  copyright: string;
  phonographic_copyright: string;
  label_name: string;
  territories: string[];
  platforms: string[];
  cover_artwork_url?: string;
  audio_files_count: number;
  
  // Real Identifiers (Source of Truth)
  isrc?: string | null;
  isrc_source?: 'ADMIN' | 'ARTIST' | 'DITTO' | 'IMPORTED';
  isrc_status?: string;
  upc?: string | null;
  upc_source?: 'ADMIN' | 'DITTO' | 'IMPORTED';
  ean?: string | null;
  catalog_number?: string | null;
  
  // Ditto Specific Identifiers
  distribution_provider: DistributionProviderName;
  ditto_release_id?: string | null;
  ditto_submission_id?: string | null;
  ditto_distribution_id?: string | null;
  
  // Workflow & Delivery
  workflow_status: ReleaseWorkflowStatus;
  ditto_status: DittoSyncStatus;
  platform_deliveries: PlatformDeliveryStatus[];
  provider_events: DistributionProviderEvent[];
  live_urls: Record<string, string>;
  
  is_public: boolean;
  last_synced_at?: string;
  sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabelEmailLog {
  id: string;
  to_email: string;
  recipient_name: string;
  template: string;
  subject: string;
  status: 'SENT' | 'FAILED';
  sent_at: string;
  error?: string;
}

// --- Music Platform & Listen Everywhere ---
export type PlatformCategory =
  | 'Major streaming'
  | 'India / South Asia'
  | 'Asia'
  | 'Africa'
  | 'Latin America'
  | 'Europe'
  | 'Classical / specialist'
  | 'DJ / electronic'
  | 'Independent / creator platforms'
  | 'Radio / discovery';

export type PlatformRegion =
  | 'Global'
  | 'India / South Asia'
  | 'Asia'
  | 'Africa'
  | 'Latin America'
  | 'Europe'
  | 'North America'
  | 'Worldwide';

export interface MusicPlatform {
  id: string;
  platform_name: string;
  category: PlatformCategory;
  region: PlatformRegion;
  artist_name: string;
  artist_profile_url: string;
  logo_url?: string;
  description?: string;
  display_order: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Contact Departments & Manager ---
export interface ContactDepartment {
  id: string;
  department_key: string;
  title: string;
  email: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- AI Provider Manager ---
export interface AiProviderConfig {
  id: string;
  name: string;
  provider_type: 'gemini' | 'custom' | 'claude' | 'openai';
  api_key: string;
  api_endpoint?: string;
  model: string;
  plan: 'Free' | 'Paid';
  is_enabled: boolean;
  is_primary: boolean;
  status: 'Connected' | 'Disconnected' | 'Error';
  last_tested_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AiDefaultAssignments {
  user_chat_provider_id: string;
  website_builder_provider_id: string;
  coding_provider_id: string;
  research_provider_id: string;
  image_provider_id: string;
  video_provider_id: string;
  voice_provider_id: string;
  failover_backup_provider_id?: string;
  auto_fallback_enabled: boolean;
  health_check_enabled: boolean;
  rate_limit_detection: boolean;
}

// --- AI Website Builder ---
export interface WebsiteBuilderProposal {
  id: string;
  prompt: string;
  speech_transcript?: string;
  title: string;
  summary: string;
  files_changed: string[];
  changes: {
    section_id?: string;
    action: 'UPDATE_SECTION' | 'ADD_RELEASE' | 'UPDATE_HERO' | 'ADD_PLATFORM' | 'UPDATE_THEME' | 'CUSTOM_CODE';
    details: string;
    patch_data?: Record<string, unknown>;
  }[];
  status: 'DRAFT_PREVIEW' | 'APPROVED_PUBLISHED' | 'REJECTED' | 'ROLLED_BACK';
  created_at: string;
  published_at?: string;
  version_number: number;
}

// --- Public User AI Chat ---
export interface UserChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: { name: string; type: string; size: number; url?: string }[];
  category?: 'maths' | 'coding' | 'research' | 'writing' | 'music' | 'creative' | 'general';
}

export interface UserChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

// --- Payment Gateway Manager & Manual UPI / QR Fallback ---
export interface PaymentGatewayConfig {
  id: string;
  name: string;
  provider: 'razorpay' | 'cashfree' | 'stripe' | 'payu' | 'phonepe' | 'paytm' | 'custom';
  merchant_id: string;
  secret_key: string;
  webhook_url: string;
  environment: 'Test' | 'Live';
  currency: string;
  is_enabled: boolean;
  is_default: boolean;
  status: 'Active' | 'Inactive' | 'Testing';
  created_at: string;
  updated_at: string;
  last_tested_at?: string;
}

export interface PaymentSystemSettings {
  default_gateway_id: string;
  backup_gateway_id?: string;
  automatic_failover: boolean;
  webhook_verification: boolean;
  realtime_status: boolean;
  refunds_enabled: boolean;
  currency: string;
  currency_symbol: string;
  tax_percentage: number;
  receipt_invoice_enabled: boolean;

  // Manual UPI / QR Fallback
  manual_upi_enabled: boolean;
  upi_id: string;
  qr_code_url: string;
  payment_instructions: string;
  verification_mode: 'manual' | 'admin_approval';

  // Verification Timing SLA & Non-Refundable Policy
  verification_target_minutes: number; // e.g. 30
  automatic_escalation: boolean;
  escalate_after_minutes: number;
  escalation_action: string;
  auto_refund: boolean;
  non_refundable_after_verification: boolean;
  refund_exceptions: string[];
}

export interface PendingManualPayment {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  payment_method: 'UPI' | 'QR' | 'GATEWAY';
  gateway_name?: string;
  utr_number: string;
  proof_image_url?: string;
  item_description: string;
  submitted_at: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'MORE_INFO_REQUESTED';
  verified_at?: string;
  verified_by?: string;
  admin_notes?: string;
  receipt_id?: string;
}


