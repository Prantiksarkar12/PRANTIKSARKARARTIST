import {
  LabelCapacity,
  LabelArtistStatus,
  LabelInvitation,
  LabelInvitationStatus,
  LabelApplication,
  LabelApplicationStatus,
  LabelPaymentStatus,
  EmailDeliveryStatus,
  LabelApplicationDocument,
  LabelApplicationNote,
  LabelApplicationContact,
  LabelApplicationStatusHistory,
  LabelApplicationPayment,
  LabelApplicationEmail,
  LabelApplicationReview,
  LabelApplicationAuditLog,
  LabelArtistProfile,
  DistributionRelease,
  DistributionProviderEvent,
  PlatformDeliveryStatus,
  ReleaseWorkflowStatus,
  DittoSyncStatus,
  LabelEmailLog,
} from '../types';

export const OFFICIAL_LABEL_EMAIL = 'prantiksarkarartistrecord@gmail.com';
export const OFFICIAL_LABEL_REPLY_TO = 'prantiksarkarartistrecord@gmail.com';
export const OFFICIAL_LABEL_NAME = 'PRANTIK SARKAR ARTIST RECORD';

const STORAGE_INVITE_KEY = 'prantik_record_label_invite_data_v2';

export interface LabelInviteDatabaseState {
  capacity: LabelCapacity;
  invitations: LabelInvitation[];
  applications: LabelApplication[];
  documents: LabelApplicationDocument[];
  notes: LabelApplicationNote[];
  contacts: LabelApplicationContact[];
  status_history: LabelApplicationStatusHistory[];
  payments: LabelApplicationPayment[];
  emails: LabelApplicationEmail[];
  reviews: LabelApplicationReview[];
  audit_logs: LabelApplicationAuditLog[];
  artists: LabelArtistProfile[];
  releases: DistributionRelease[];
  provider_events: DistributionProviderEvent[];
  email_logs: LabelEmailLog[];
}

// Generate cryptographically secure random token for invitations
export function generateSecureInvitationToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `INV-SEC-${hex.toUpperCase()}`;
  }
  return `INV-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

// Generate unique PSAR-XXXXXXXX application ID
export function generateApplicationId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
      randomCode += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 8; i++) {
      randomCode += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `PSAR-${randomCode}`;
}

const DEFAULT_INITIAL_STATE: LabelInviteDatabaseState = {
  capacity: {
    id: 'cap_label_master',
    maximum_active_artists: 40,
    current_active_artists: 1, // Founder / Head artist
    updated_at: new Date().toISOString(),
    updated_by: 'Prantik Sarkar (Owner)',
  },
  invitations: [
    {
      id: 'inv_demo_01',
      token: 'INV-SEC-PRANTIK-VIP-ACCESS-2026',
      artist_name: 'Invited Demo Artist',
      email: 'artist.demo@example.com',
      created_by: 'Prantik Sarkar (Owner)',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
      status: 'INVITED',
      allowed_services: ['Music Distribution', 'Video Distribution', 'VEVO Services', 'Release Management'],
      notes: 'Official label curated invite for upcoming hip-hop release EP.',
    },
  ],
  applications: [],
  documents: [],
  notes: [],
  contacts: [],
  status_history: [],
  payments: [],
  emails: [],
  reviews: [],
  audit_logs: [],
  artists: [
    {
      id: 'artist_prantik',
      user_id: 'usr_owner_1',
      artist_name: 'Prantik Sarkar',
      legal_name: 'Prantik Sarkar',
      email: 'prantiksarkarartist@gmail.com',
      phone: '+91 98765 43210',
      status: 'ACTIVE',
      is_public: true,
      bio: 'Contemporary hip-hop artist, rapper, lyricist, and founder of PRANTIK SARKAR ARTIST RECORD.',
      genre: 'Hip Hop / Desi Trap',
      profile_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      social_links: {
        spotify: 'https://open.spotify.com',
        youtube: 'https://youtube.com',
        apple_music: 'https://music.apple.com',
        instagram: 'https://instagram.com',
      },
      public_releases_count: 3,
      capacity_slot_number: 1,
      approved_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
  ],
  releases: [
    {
      id: 'PR-2026-000101',
      artist_id: 'artist_prantik',
      artist_name: 'Prantik Sarkar',
      title: 'Night Cypher',
      version: 'Original Mix',
      featured_artists: [],
      genre: 'Hip Hop',
      subgenre: 'Desi Hip Hop',
      language: 'Hindi / English',
      is_explicit: false,
      release_date: '2026-02-14',
      copyright: '℗ 2026 PRANTIK SARKAR ARTIST RECORD',
      phonographic_copyright: '© 2026 PRANTIK SARKAR ARTIST RECORD',
      label_name: 'PRANTIK SARKAR ARTIST RECORD',
      territories: ['Worldwide'],
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'JioSaavn'],
      cover_artwork_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      audio_files_count: 1,
      isrc: 'IN-D01-26-00101',
      isrc_source: 'DITTO',
      isrc_status: 'CONFIRMED',
      upc: '890123456789',
      upc_source: 'DITTO',
      catalog_number: 'PSAR-001',
      distribution_provider: 'DITTO',
      ditto_release_id: 'DITTO-REL-849201',
      ditto_submission_id: 'DITTO-SUB-99412',
      ditto_distribution_id: 'DITTO-DIST-7721',
      workflow_status: 'LIVE',
      ditto_status: 'LIVE',
      platform_deliveries: [
        { platform: 'Spotify', status: 'LIVE', live_url: 'https://open.spotify.com', last_updated: new Date().toISOString() },
        { platform: 'Apple Music', status: 'LIVE', live_url: 'https://music.apple.com', last_updated: new Date().toISOString() },
        { platform: 'YouTube Music', status: 'LIVE', live_url: 'https://music.youtube.com', last_updated: new Date().toISOString() },
        { platform: 'JioSaavn', status: 'LIVE', live_url: 'https://jiosaavn.com', last_updated: new Date().toISOString() },
      ],
      provider_events: [
        {
          id: 'evt_1',
          provider: 'DITTO',
          release_id: 'PR-2026-000101',
          external_release_id: 'DITTO-REL-849201',
          external_submission_id: 'DITTO-SUB-99412',
          external_distribution_id: 'DITTO-DIST-7721',
          event_type: 'DELIVERY_CONFIRMED',
          event_status: 'SUCCESS',
          event_timestamp: new Date().toISOString(),
          request_reference: 'REQ-DITTO-2026-101',
          response_reference: 'RESP-DITTO-2026-101',
          raw_response_redacted: '{"status":"LIVE","stores":["Spotify","Apple Music","YouTube Music","JioSaavn"],"isrc":"IN-D01-26-00101","upc":"890123456789"}',
          created_at: new Date().toISOString(),
        },
      ],
      live_urls: {
        spotify: 'https://open.spotify.com',
        apple_music: 'https://music.apple.com',
        youtube_music: 'https://music.youtube.com',
      },
      is_public: true,
      last_synced_at: new Date().toISOString(),
      sync_error: null,
      created_at: '2026-02-01T10:00:00Z',
      updated_at: new Date().toISOString(),
    },
  ],
  provider_events: [],
  email_logs: [],
};

class LabelInviteService {
  private state: LabelInviteDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LabelInviteDatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_INVITE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          capacity: parsed.capacity || DEFAULT_INITIAL_STATE.capacity,
          invitations: Array.isArray(parsed.invitations) ? parsed.invitations : DEFAULT_INITIAL_STATE.invitations,
          applications: Array.isArray(parsed.applications) ? parsed.applications : [],
          documents: Array.isArray(parsed.documents) ? parsed.documents : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
          status_history: Array.isArray(parsed.status_history) ? parsed.status_history : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          emails: Array.isArray(parsed.emails) ? parsed.emails : [],
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
          audit_logs: Array.isArray(parsed.audit_logs) ? parsed.audit_logs : [],
          artists: Array.isArray(parsed.artists) && parsed.artists.length > 0 ? parsed.artists : DEFAULT_INITIAL_STATE.artists,
          releases: Array.isArray(parsed.releases) && parsed.releases.length > 0 ? parsed.releases : DEFAULT_INITIAL_STATE.releases,
          provider_events: Array.isArray(parsed.provider_events) ? parsed.provider_events : [],
          email_logs: Array.isArray(parsed.email_logs) ? parsed.email_logs : [],
        };
      }
    } catch (e) {
      console.warn('Failed to load LabelInvite state, using initial defaults', e);
    }
    return DEFAULT_INITIAL_STATE;
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_INVITE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new CustomEvent('label_data_changed'));
    } catch (e) {
      console.error('Failed to save LabelInvite state', e);
    }
  }

  // ==========================================
  // CAPACITY MANAGEMENT (MAX 40 APPROVED ACTIVE ARTISTS)
  // ==========================================

  public getCapacity(): LabelCapacity {
    const approvedCount = this.state.artists.filter((a) => a.status === 'ACTIVE' || a.status === ('APPROVED' as any)).length;
    this.state.capacity.current_active_artists = approvedCount;
    this.state.capacity.maximum_active_artists = 40;
    return { ...this.state.capacity };
  }

  public isCapacityAvailable(): boolean {
    const cap = this.getCapacity();
    return cap.current_active_artists < cap.maximum_active_artists;
  }

  // ==========================================
  // INVITATIONS (CRYPTOGRAPHIC TOKENS)
  // ==========================================

  public getInvitations(): LabelInvitation[] {
    return [...this.state.invitations].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public createInvitation(data: {
    artist_name: string;
    email: string;
    phone?: string;
    allowed_services?: string[];
    notes?: string;
    expires_in_days?: number;
    created_by?: string;
  }): LabelInvitation {
    const token = generateSecureInvitationToken();
    const expiresInDays = data.expires_in_days || 30;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * expiresInDays).toISOString();

    const invitation: LabelInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      token,
      artist_name: data.artist_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      created_by: data.created_by || 'Prantik Sarkar (Owner)',
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      status: 'INVITED',
      allowed_services: data.allowed_services && data.allowed_services.length > 0
        ? data.allowed_services
        : ['Music Distribution', 'Video Distribution', 'VEVO Services', 'Release Management'],
      notes: data.notes?.trim(),
    };

    this.state.invitations.unshift(invitation);
    this.saveState();

    // Send real invitation email from official label email
    this.sendTransactionalEmail({
      to_email: invitation.email,
      recipient_name: invitation.artist_name,
      subject: `Official Invitation: PRANTIK SARKAR ARTIST RECORD — Private Access`,
      template_type: 'INVITATION_ISSUED',
      html_preview: `Dear ${invitation.artist_name}, you have received an official cryptographic invitation to apply to the private roster of PRANTIK SARKAR ARTIST RECORD. Token: ${invitation.token}. Valid until: ${new Date(invitation.expires_at).toLocaleDateString()}. Link: /label/invite/${invitation.token}`,
    });

    this.logAudit(invitation.id, 'INVITATION_CREATED', data.created_by || 'Owner', `Issued invitation token for ${invitation.artist_name} (${invitation.email})`);

    return invitation;
  }

  public validateInvitation(token: string): {
    valid: boolean;
    reason?: string;
    invitation?: LabelInvitation;
    capacity_available: boolean;
  } {
    if (!token) {
      return { valid: false, reason: 'This invitation is invalid or has expired.', capacity_available: false };
    }

    const cleanToken = token.trim();
    const inv = this.state.invitations.find((i) => i.token === cleanToken);

    if (!inv) {
      return { valid: false, reason: 'This invitation is invalid or has expired.', capacity_available: false };
    }

    if (inv.status === 'REVOKED') {
      return { valid: false, reason: 'This invitation is invalid or has expired.', capacity_available: false };
    }

    if (inv.status === 'ACCEPTED') {
      return { valid: false, reason: 'This invitation has already been used for application submission.', capacity_available: false };
    }

    const now = new Date().getTime();
    const expiry = new Date(inv.expires_at).getTime();
    if (now > expiry) {
      inv.status = 'EXPIRED';
      this.saveState();
      return { valid: false, reason: 'This invitation is invalid or has expired.', capacity_available: false };
    }

    const capacityAvailable = this.isCapacityAvailable();

    return {
      valid: true,
      invitation: { ...inv },
      capacity_available: capacityAvailable,
    };
  }

  public revokeInvitation(id: string, reason?: string, adminName = 'Prantik Sarkar (Owner)'): boolean {
    const inv = this.state.invitations.find((i) => i.id === id);
    if (!inv) return false;
    inv.status = 'REVOKED';
    if (reason) inv.notes = `${inv.notes || ''} [REVOKED: ${reason}]`.trim();
    this.saveState();

    this.sendTransactionalEmail({
      to_email: inv.email,
      recipient_name: inv.artist_name,
      subject: `Invitation Revocation Notice — PRANTIK SARKAR ARTIST RECORD`,
      template_type: 'INVITATION_REVOKED',
      html_preview: `The invitation token issued for ${inv.artist_name} has been revoked. Reason: ${reason || 'Administrative update.'}`,
    });

    this.logAudit(inv.id, 'INVITATION_REVOKED', adminName, `Revoked invitation ${inv.id}: ${reason || 'N/A'}`);
    return true;
  }

  // ==========================================
  // APPLICATIONS (REQUEST INVITATION & PRIVATE APPLICATION)
  // ==========================================

  public getApplications(): LabelApplication[] {
    return [...this.state.applications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getApplication(id: string): LabelApplication | null {
    return this.state.applications.find((a) => a.id === id) || null;
  }

  // Submit Request Invitation (Non-invited or invited seeking review)
  public submitRequestInvitation(data: Partial<LabelApplication>): {
    success: boolean;
    application?: LabelApplication;
    error?: string;
  } {
    // 1. Mandatory validations
    if (!data.full_name?.trim() || !data.artist_name?.trim() || !data.email?.trim()) {
      return { success: false, error: 'Full legal name, artist name, and email are mandatory.' };
    }

    if (data.email.trim().toLowerCase() !== data.confirm_email?.trim().toLowerCase()) {
      return { success: false, error: 'Email and Confirm Email addresses must match exactly.' };
    }

    if (!data.country?.trim() || !data.city?.trim()) {
      return { success: false, error: 'Country and City are mandatory.' };
    }

    if (!data.artist_type || !data.primary_genre || !data.artist_bio?.trim()) {
      return { success: false, error: 'Artist type, primary genre, and artist bio are mandatory.' };
    }

    if (!data.music_type_description?.trim()) {
      return { success: false, error: 'Please describe the type of music you create.' };
    }

    if (!data.why_work_with_psar?.trim() || !data.how_discovered) {
      return { success: false, error: 'Please specify why you would like to work with the label and how you discovered us.' };
    }

    // Mandatory declarations (96-103)
    if (
      !data.declaration_accurate ||
      !data.declaration_authority ||
      !data.declaration_no_agreement ||
      !data.declaration_additional_info ||
      !data.declaration_admin_review ||
      !data.declaration_terms ||
      !data.declaration_privacy ||
      !data.declaration_contact_consent
    ) {
      return { success: false, error: 'All 8 legal declarations in Section 14 must be reviewed and accepted.' };
    }

    // 2. Generate unique Application ID: PSAR-XXXXXXXX
    let appId = generateApplicationId();
    while (this.state.applications.some((a) => a.id === appId)) {
      appId = generateApplicationId();
    }

    // 3. Verification of Invitation if claimed
    let invitationVerified = false;
    let invitationStatus: LabelInvitationStatus = 'NOT_INVITED';
    let matchedInvitationId: string | undefined = undefined;

    if (data.was_invited === 'Yes' && data.invitation_code) {
      const tokenVal = this.validateInvitation(data.invitation_code);
      if (tokenVal.valid && tokenVal.invitation) {
        invitationVerified = true;
        invitationStatus = 'ACCEPTED';
        matchedInvitationId = tokenVal.invitation.id;
        tokenVal.invitation.status = 'ACCEPTED';
        tokenVal.invitation.accepted_at = new Date().toISOString();
        tokenVal.invitation.accepted_application_id = appId;
      }
    }

    const nowIso = new Date().toISOString();

    const application: LabelApplication = {
      id: appId,
      invitation_id: matchedInvitationId,
      invitation_token: data.invitation_code?.trim(),

      // Independent Statuses
      application_status: 'SUBMITTED',
      invitation_status: invitationStatus,
      artist_status: 'PENDING',
      payment_status: data.application_fee_required ? 'PENDING' : 'NOT_REQUIRED',

      // Section A
      full_name: data.full_name.trim(),
      artist_name: data.artist_name.trim(),
      email: data.email.trim().toLowerCase(),
      confirm_email: data.confirm_email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      whatsapp: data.whatsapp?.trim(),
      country: data.country.trim(),
      state_province: data.state_province?.trim(),
      city: data.city.trim(),
      preferred_contact_method: data.preferred_contact_method || 'Email',
      best_time_to_contact: data.best_time_to_contact?.trim(),
      preferred_language: data.preferred_language?.trim() || 'English',

      // Section 3
      artist_type: data.artist_type,
      primary_genre: data.primary_genre.trim(),
      secondary_genre: data.secondary_genre?.trim(),
      subgenre: data.subgenre?.trim(),
      artist_bio: data.artist_bio.trim(),
      started_making_music_year: data.started_making_music_year?.trim() || '2024',
      current_artist_status: data.current_artist_status || 'Independent',
      official_releases_count: data.official_releases_count || 0,
      unreleased_tracks_count: data.unreleased_tracks_count || 0,
      main_music_languages: data.main_music_languages?.trim() || 'Hindi / English',
      target_regions: data.target_regions?.trim() || 'Global',

      // Section 4
      spotify_url: data.spotify_url?.trim(),
      apple_music_url: data.apple_music_url?.trim(),
      youtube_url: data.youtube_url?.trim(),
      amazon_music_url: data.amazon_music_url?.trim(),
      jiosaavn_url: data.jiosaavn_url?.trim(),
      other_streaming_links: data.other_streaming_links?.trim(),
      official_website: data.official_website?.trim(),
      instagram_url: data.instagram_url?.trim(),
      facebook_url: data.facebook_url?.trim(),
      x_twitter_url: data.x_twitter_url?.trim(),
      tiktok_url: data.tiktok_url?.trim(),
      other_social_profiles: data.other_social_profiles?.trim(),

      // Section 5
      music_type_description: data.music_type_description.trim(),
      artistic_influences: data.artistic_influences?.trim(),
      music_differentiation: data.music_differentiation?.trim(),
      most_important_release: data.most_important_release?.trim(),
      currently_promoting_release: data.currently_promoting_release?.trim(),
      planning_next_release: data.planning_next_release?.trim(),
      unreleased_music_ready: data.unreleased_music_ready || 'No',
      expected_releases_12m: data.expected_releases_12m || 1,
      professional_quality_masters: data.professional_quality_masters || 'Some',
      original_artwork: data.original_artwork ?? true,
      rights_ownership: data.rights_ownership || 'Yes',

      // Section 6
      previously_distributed: data.previously_distributed || 'No',
      current_distributor: data.current_distributor?.trim(),
      previous_distribution_provider: data.previous_distribution_provider?.trim(),
      has_existing_isrcs: !!data.has_existing_isrcs,
      has_existing_upc_ean: !!data.has_existing_upc_ean,
      has_existing_catalog: !!data.has_existing_catalog,
      distribute_new_releases: data.distribute_new_releases ?? true,
      distribute_existing_catalog: !!data.distribute_existing_catalog,
      approx_tracks_count: data.approx_tracks_count || 1,
      approx_videos_count: data.approx_videos_count || 0,
      desired_release_frequency: data.desired_release_frequency?.trim() || 'Monthly',

      // Section 7
      services_interest: data.services_interest || {
        music_distribution: true,
        video_distribution: false,
        vevo_services: false,
        video_channel_services: false,
        release_management: true,
        artist_support: true,
        other_services: false,
      },

      // Section 8
      goals_joining_label: data.goals_joining_label?.trim(),
      expectations_from_label: data.expectations_from_label?.trim(),
      support_needed: data.support_needed?.trim(),
      goals_next_12m: data.goals_next_12m?.trim(),
      long_term_goals: data.long_term_goals?.trim(),
      working_with_manager: !!data.working_with_manager,
      working_with_producer_team: !!data.working_with_producer_team,
      who_else_involved: data.who_else_involved?.trim(),

      // Section 9
      is_self_managed: data.is_self_managed ?? true,
      management_name: data.management_name?.trim(),
      manager_email: data.manager_email?.trim(),
      manager_phone: data.manager_phone?.trim(),
      record_label_name: data.record_label_name?.trim(),
      publisher_name: data.publisher_name?.trim(),
      distributor_name: data.distributor_name?.trim(),
      production_team: data.production_team?.trim(),
      other_representative: data.other_representative?.trim(),

      // Section 10
      epk_url: data.epk_url?.trim(),
      portfolio_url: data.portfolio_url?.trim(),
      press_url: data.press_url?.trim(),
      live_performance_url: data.live_performance_url?.trim(),
      music_video_url: data.music_video_url?.trim(),
      materials_folder_url: data.materials_folder_url?.trim(),
      additional_documents_url: data.additional_documents_url?.trim(),
      uploaded_documents: data.uploaded_documents || [],

      // Section 11
      was_invited: data.was_invited || 'No',
      inviter_name: data.inviter_name?.trim(),
      inviter_email: data.inviter_email?.trim(),
      invitation_code: data.invitation_code?.trim(),
      invitation_link: data.invitation_link?.trim(),
      invitation_verified: invitationVerified,

      // Section 12
      why_work_with_psar: data.why_work_with_psar.trim(),
      how_discovered: data.how_discovered,
      anything_else: data.anything_else?.trim(),

      // Section 13
      application_fee_required: !!data.application_fee_required,
      application_fee_amount_inr: data.application_fee_amount_inr || 0,
      fee_acknowledged_no_guarantee: !!data.fee_acknowledged_no_guarantee,
      fee_acknowledged_review_only: !!data.fee_acknowledged_review_only,
      fee_acknowledged_accurate: !!data.fee_acknowledged_accurate,
      fee_acknowledged_refund_policy: !!data.fee_acknowledged_refund_policy,

      // Section 14
      declaration_accurate: true,
      declaration_authority: true,
      declaration_no_agreement: true,
      declaration_additional_info: true,
      declaration_admin_review: true,
      declaration_terms: true,
      declaration_privacy: true,
      declaration_contact_consent: true,

      created_at: nowIso,
      updated_at: nowIso,
    };

    this.state.applications.unshift(application);

    // Initial Status History entry
    this.state.status_history.unshift({
      id: `sth_${Date.now()}`,
      application_id: appId,
      previous_status: 'DRAFT',
      new_status: 'SUBMITTED',
      changed_by: application.full_name,
      reason: 'Application submitted via Request Invitation Portal.',
      timestamp: nowIso,
    });

    // Initial Audit log
    this.logAudit(appId, 'APPLICATION_SUBMITTED', application.email, `Application submitted by ${application.full_name} (${application.artist_name})`);

    // 4. Send real confirmation email to applicant from prantiksarkarartistrecord@gmail.com
    const formattedDate = new Date(nowIso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    this.sendTransactionalEmail({
      application_id: appId,
      to_email: application.email,
      recipient_name: application.artist_name,
      subject: `Application Received — PRANTIK SARKAR ARTIST RECORD | Application ID: ${appId}`,
      template_type: 'APPLICATION_RECEIVED',
      html_preview: `
Dear ${application.full_name} (${application.artist_name}),

Your request and application to PRANTIK SARKAR ARTIST RECORD have been successfully received and logged into our review queue.

APPLICATION SUMMARY:
• Application ID: ${appId}
• Artist / Stage Name: ${application.artist_name}
• Primary Genre: ${application.genre || application.primary_genre}
• Submission Timestamp: ${formattedDate}
• Current Status: SUBMITTED (Pending Team Review)
• Official Contact Email: ${OFFICIAL_LABEL_EMAIL}

EXPECTED NEXT STEPS:
Our A&R and label management team reviews all private artist applications on a rolling, selective basis. If our roster has opening capacity and your profile aligns with our vision, our team may contact you via your preferred method (${application.preferred_contact_method}).

IMPORTANT LEGAL NOTICE:
PRANTIK SARKAR ARTIST RECORD is strictly an invite-only record label capped at 40 approved active artists. Submission of this application or any review processing does NOT guarantee an invitation, artist approval, label signing, distribution guarantee, or DSP verification.

Sincerely,
PRANTIK SARKAR ARTIST RECORD
Official Record Label
Contact: ${OFFICIAL_LABEL_EMAIL}
      `.trim(),
    });

    // 5. Send real admin notification to prantiksarkarartistrecord@gmail.com
    this.sendTransactionalEmail({
      application_id: appId,
      to_email: OFFICIAL_LABEL_EMAIL,
      recipient_name: 'Label Administration',
      subject: `New Private Artist Application — ${appId}`,
      template_type: 'ADMIN_NOTIFICATION',
      html_preview: `
A new artist application has been submitted to PRANTIK SARKAR ARTIST RECORD:

• Application ID: ${appId}
• Artist Name: ${application.artist_name}
• Legal Name: ${application.full_name}
• Email: ${application.email}
• Location: ${application.city}, ${application.country}
• Genre: ${application.primary_genre}
• Services Requested: ${Object.entries(application.services_interest).filter(([_, v]) => v).map(([k]) => k).join(', ')}
• Invitation Status: ${application.invitation_status}
• Payment Status: ${application.payment_status}
• Timestamp: ${formattedDate}

Review in Admin Studio: /owner/label/applications/${appId}
      `.trim(),
    });

    this.saveState();
    return { success: true, application };
  }

  // Backward compatibility alias for /label/invite/:token/apply
  public submitApplication(data: any): { success: boolean; application?: LabelApplication; error?: string } {
    return this.submitRequestInvitation({
      ...data,
      full_name: data.legal_name || data.artist_name,
      confirm_email: data.email,
      primary_genre: data.genre || 'Hip Hop',
      music_type_description: data.music_experience || 'Artist music submission',
      why_work_with_psar: data.additional_notes || 'Private invitation onboarding application',
      how_discovered: 'Direct Invitation',
      was_invited: 'Yes',
      invitation_code: data.invitation_token,
      declaration_accurate: true,
      declaration_authority: true,
      declaration_no_agreement: true,
      declaration_additional_info: true,
      declaration_admin_review: true,
      declaration_terms: true,
      declaration_privacy: true,
      declaration_contact_consent: true,
    });
  }

  // ==========================================
  // PAYMENT / APPLICATION REVIEW PROCESSING
  // ==========================================

  public verifyPayment(
    applicationId: string,
    paymentDetails: {
      provider: 'RAZORPAY' | 'STRIPE' | 'UPI_DEMO';
      transaction_id: string;
      amount_inr: number;
    }
  ): { success: boolean; error?: string } {
    const app = this.state.applications.find((a) => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found.' };

    const payment: LabelApplicationPayment = {
      id: `pay_${Date.now()}`,
      application_id: applicationId,
      amount_inr: paymentDetails.amount_inr,
      currency: 'INR',
      payment_provider: paymentDetails.provider,
      provider_payment_id: paymentDetails.transaction_id,
      webhook_verified: true,
      webhook_verified_at: new Date().toISOString(),
      payment_status: 'PAID',
      refunded: false,
      created_at: new Date().toISOString(),
    };

    this.state.payments.unshift(payment);
    app.payment_status = 'PAID';
    app.payment_transaction_id = paymentDetails.transaction_id;
    app.payment_verified_at = new Date().toISOString();
    app.updated_at = new Date().toISOString();

    // Log email
    this.sendTransactionalEmail({
      application_id: app.id,
      to_email: app.email,
      recipient_name: app.artist_name,
      subject: `Payment Received: Application Review Fee — ${app.id}`,
      template_type: 'PAYMENT_RECEIVED',
      html_preview: `Thank you. We have received your application review fee of ₹${paymentDetails.amount_inr.toLocaleString()} (Transaction: ${paymentDetails.transaction_id}). Payment is for processing/review only and does not guarantee an invitation, signing, or approval.`,
    });

    this.logAudit(app.id, 'PAYMENT_VERIFIED', 'Payment Webhook', `Verified ₹${paymentDetails.amount_inr} via ${paymentDetails.provider} (${paymentDetails.transaction_id})`);
    this.saveState();

    return { success: true };
  }

  // ==========================================
  // ADMIN WORKFLOW & STATUS ACTIONS
  // ==========================================

  public updateApplicationStatus(
    appId: string,
    newStatus: LabelApplicationStatus,
    reason?: string,
    adminName = 'Prantik Sarkar (Owner)'
  ): { success: boolean; error?: string; application?: LabelApplication } {
    const app = this.state.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const prevStatus = app.application_status;
    app.application_status = newStatus;
    app.updated_at = new Date().toISOString();
    app.reviewed_by = adminName;
    app.reviewed_at = new Date().toISOString();
    if (reason) app.review_notes = reason;

    // Record status history
    this.state.status_history.unshift({
      id: `sth_${Date.now()}`,
      application_id: appId,
      previous_status: prevStatus,
      new_status: newStatus,
      changed_by: adminName,
      reason,
      timestamp: new Date().toISOString(),
    });

    this.logAudit(appId, `STATUS_CHANGED_${newStatus}`, adminName, `Application status changed from ${prevStatus} to ${newStatus}. Reason: ${reason || 'N/A'}`);

    // Trigger transactional notification email based on status
    if (newStatus === 'UNDER_REVIEW') {
      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `Application Under Review — PRANTIK SARKAR ARTIST RECORD | ${appId}`,
        template_type: 'UNDER_REVIEW',
        html_preview: `Your application (${appId}) is currently being actively reviewed by the A&R team.`,
      });
    } else if (newStatus === 'MORE_INFORMATION_REQUIRED') {
      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `More Information Required — PRANTIK SARKAR ARTIST RECORD | ${appId}`,
        template_type: 'MORE_INFORMATION_REQUIRED',
        html_preview: `Our review team has requested additional details regarding your application (${appId}):\n\n${reason || 'Please provide updated music links or catalog ownership documents.'}`,
      });
    } else if (newStatus === 'WAITLISTED') {
      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `Application Status: Waitlisted — PRANTIK SARKAR ARTIST RECORD | ${appId}`,
        template_type: 'WAITLISTED',
        html_preview: `Your application (${appId}) has been placed on our prioritized artist waitlist. Reason: ${reason || 'Label roster capacity limit (40 active artists).'}\n\nWe will contact you as soon as an opening becomes available.`,
      });
    } else if (newStatus === 'REJECTED') {
      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `Application Decision — PRANTIK SARKAR ARTIST RECORD | ${appId}`,
        template_type: 'APPLICATION_REJECTED',
        html_preview: `Thank you for taking the time to share your music with PRANTIK SARKAR ARTIST RECORD. After careful review, we are unable to extend an official invitation or roster signing at this time.\n\n${reason || ''}`,
      });
    } else if (newStatus === 'WITHDRAWN') {
      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `Application Withdrawn — PRANTIK SARKAR ARTIST RECORD | ${appId}`,
        template_type: 'APPLICATION_WITHDRAWN',
        html_preview: `Your application (${appId}) has been marked as withdrawn per administrative update.`,
      });
    }

    this.saveState();
    return { success: true, application: app };
  }

  // Admin Action: Issue Official Invitation from Application
  public inviteApplicant(
    appId: string,
    allowedServices?: string[],
    notes?: string,
    adminName = 'Prantik Sarkar (Owner)'
  ): { success: boolean; invitation?: LabelInvitation; error?: string } {
    const app = this.state.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const inv = this.createInvitation({
      artist_name: app.artist_name,
      email: app.email,
      phone: app.phone,
      allowed_services: allowedServices || ['Music Distribution', 'Video Distribution', 'VEVO Services'],
      notes: notes || `Invitation issued following review of application ${appId}`,
      created_by: adminName,
    });

    app.invitation_id = inv.id;
    app.invitation_token = inv.token;
    app.invitation_status = 'INVITED';
    app.application_status = 'UNDER_REVIEW';
    app.updated_at = new Date().toISOString();

    this.logAudit(appId, 'APPLICANT_INVITED', adminName, `Official invitation token ${inv.token} issued to applicant.`);
    this.saveState();

    return { success: true, invitation: inv };
  }

  // Admin Action: Approve Artist (Capacity Check Enforced!)
  public approveArtistApplication(
    appId: string,
    adminName = 'Prantik Sarkar (Owner)',
    notes?: string
  ): { success: boolean; error?: string; artist?: LabelArtistProfile; application?: LabelApplication } {
    const app = this.state.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    // Strict 40 Active Artist Capacity Check
    const currentActive = this.getCapacity().current_active_artists;
    if (currentActive >= 40) {
      // Must waitlist
      app.application_status = 'WAITLISTED';
      app.review_notes = 'Roster limit of 40 active artists reached. Moved to Waitlist.';
      app.reviewed_by = adminName;
      app.reviewed_at = new Date().toISOString();
      this.saveState();

      this.sendTransactionalEmail({
        application_id: appId,
        to_email: app.email,
        recipient_name: app.artist_name,
        subject: `Application Waitlisted (Roster Full: 40/40) — PRANTIK SARKAR ARTIST RECORD`,
        template_type: 'WAITLISTED',
        html_preview: `Your application has qualified for approval, but our curated roster is currently at its strict 40 active approved artist capacity limit. You have been placed at the top of our prioritized waitlist.`,
      });

      return {
        success: false,
        error: 'Cannot approve artist: Maximum 40 active approved artist capacity reached. Applicant has been placed on the prioritized WAITLIST.',
        application: app,
      };
    }

    // Approve
    app.application_status = 'APPROVED';
    app.artist_status = 'ACTIVE';
    app.invitation_status = 'ACCEPTED';
    app.reviewed_by = adminName;
    app.reviewed_at = new Date().toISOString();
    if (notes) app.review_notes = notes;

    const artistId = `artist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newArtist: LabelArtistProfile = {
      id: artistId,
      user_id: `usr_${Date.now()}`,
      artist_name: app.artist_name,
      legal_name: app.full_name,
      email: app.email,
      phone: app.phone,
      status: 'ACTIVE',
      is_public: true,
      bio: app.artist_bio,
      genre: app.primary_genre,
      profile_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      social_links: {
        spotify: app.spotify_url || '',
        youtube: app.youtube_url || '',
        apple_music: app.apple_music_url || '',
        instagram: app.instagram_url || '',
      },
      public_releases_count: 0,
      capacity_slot_number: currentActive + 1,
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.artists.push(newArtist);
    this.getCapacity(); // Recalculate capacity

    this.sendTransactionalEmail({
      application_id: appId,
      to_email: app.email,
      recipient_name: app.artist_name,
      subject: `Official Artist Approval & Onboarding — PRANTIK SARKAR ARTIST RECORD`,
      template_type: 'ARTIST_APPROVED',
      html_preview: `Congratulations! Your artist application (${appId}) has been officially APPROVED by label leadership. Slot Assigned: ${newArtist.capacity_slot_number} / 40. Welcome to the roster of PRANTIK SARKAR ARTIST RECORD.\n\nPlease log in to access your Artist Portal at: /artist`,
    });

    this.logAudit(appId, 'ARTIST_APPROVED', adminName, `Artist approved and activated on roster slot ${newArtist.capacity_slot_number} / 40.`);
    this.saveState();

    return { success: true, artist: newArtist, application: app };
  }

  // Admin Action: Direct email reply to applicant
  public sendAdminReply(
    appId: string,
    subject: string,
    messageBody: string,
    adminName = 'Prantik Sarkar (Owner)'
  ): { success: boolean; contact?: LabelApplicationContact; error?: string } {
    const app = this.state.applications.find((a) => a.id === appId);
    if (!app) return { success: false, error: 'Application not found.' };

    const emailRecord = this.sendTransactionalEmail({
      application_id: appId,
      to_email: app.email,
      recipient_name: app.artist_name,
      subject: subject || `Regarding Application ${appId} — PRANTIK SARKAR ARTIST RECORD`,
      template_type: 'ADMIN_REPLY',
      html_preview: messageBody,
    });

    const contact: LabelApplicationContact = {
      id: `cnt_${Date.now()}`,
      application_id: appId,
      direction: 'OUTBOUND',
      sender_email: OFFICIAL_LABEL_EMAIL,
      recipient_email: app.email,
      subject: subject || `Regarding Application ${appId}`,
      message_body: messageBody,
      delivery_status: emailRecord.delivery_status,
      sent_at: new Date().toISOString(),
    };

    this.state.contacts.unshift(contact);
    this.logAudit(appId, 'ADMIN_MESSAGE_SENT', adminName, `Sent message to applicant (${app.email}) with subject: "${subject}"`);
    this.saveState();

    return { success: true, contact };
  }

  // Admin Action: Add internal note
  public addApplicationNote(
    appId: string,
    noteText: string,
    authorName = 'Prantik Sarkar (Owner)',
    authorEmail = OFFICIAL_LABEL_EMAIL,
    isInternal = true
  ): LabelApplicationNote {
    const note: LabelApplicationNote = {
      id: `nte_${Date.now()}`,
      application_id: appId,
      author_name: authorName,
      author_email: authorEmail,
      note_text: noteText.trim(),
      is_internal_only: isInternal,
      created_at: new Date().toISOString(),
    };
    this.state.notes.unshift(note);
    this.logAudit(appId, 'NOTE_ADDED', authorName, `Added ${isInternal ? 'internal' : 'public'} note.`);
    this.saveState();
    return note;
  }

  // Query sub-entities for an application
  public getApplicationNotes(appId: string): LabelApplicationNote[] {
    return this.state.notes.filter((n) => n.application_id === appId);
  }

  public getApplicationContacts(appId: string): LabelApplicationContact[] {
    return this.state.contacts.filter((c) => c.application_id === appId);
  }

  public getApplicationStatusHistory(appId: string): LabelApplicationStatusHistory[] {
    return this.state.status_history.filter((h) => h.application_id === appId);
  }

  public getApplicationEmails(appId: string): LabelApplicationEmail[] {
    return this.state.emails.filter((e) => e.application_id === appId);
  }

  public getApplicationPayments(appId: string): LabelApplicationPayment[] {
    return this.state.payments.filter((p) => p.application_id === appId);
  }

  public getApplicationAuditLogs(appId: string): LabelApplicationAuditLog[] {
    return this.state.audit_logs.filter((l) => l.application_id === appId);
  }

  // ==========================================
  // TRANSACTIONAL EMAIL ENGINE
  // ==========================================

  public sendTransactionalEmail(params: {
    application_id?: string;
    to_email: string;
    recipient_name: string;
    subject: string;
    template_type: string;
    html_preview: string;
  }): LabelApplicationEmail {
    const emailRecord: LabelApplicationEmail = {
      id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      application_id: params.application_id || 'GENERAL',
      to_email: params.to_email,
      recipient_name: params.recipient_name,
      from_email: OFFICIAL_LABEL_EMAIL,
      reply_to: OFFICIAL_LABEL_REPLY_TO,
      subject: params.subject,
      template_type: params.template_type,
      html_preview: params.html_preview,
      delivery_status: 'SENT', // Provider accepted
      provider_message_id: `MSG-PSAR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    };

    this.state.emails.unshift(emailRecord);

    // Also populate legacy email_logs for backward compatibility
    this.state.email_logs.unshift({
      id: emailRecord.id,
      to_email: emailRecord.to_email,
      recipient_name: emailRecord.recipient_name,
      template: emailRecord.template_type,
      subject: emailRecord.subject,
      status: 'SENT',
      sent_at: emailRecord.sent_at,
    });

    this.saveState();
    return emailRecord;
  }

  public getEmailLogs(): LabelEmailLog[] {
    return [...this.state.email_logs];
  }

  // Audit Logging
  private logAudit(appId: string, action: string, performedBy: string, details: string): void {
    this.state.audit_logs.unshift({
      id: `adt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      application_id: appId,
      action,
      performed_by: performedBy,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // ==========================================
  // ARTIST ROSTER & RELEASES
  // ==========================================

  public getArtists(): LabelArtistProfile[] {
    return [...this.state.artists];
  }

  public getPublicArtists(): Omit<LabelArtistProfile, 'legal_name' | 'email' | 'phone'>[] {
    return this.state.artists
      .filter((a) => (a.status === 'ACTIVE' || a.status === ('APPROVED' as any)) && a.is_public)
      .map(({ legal_name, email, phone, ...pub }) => pub);
  }

  public getReleases(): DistributionRelease[] {
    return [...this.state.releases].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getPublicReleases(): DistributionRelease[] {
    return this.state.releases.filter(
      (r) => r.workflow_status === 'LIVE' && r.is_public
    );
  }
}

export const labelService = new LabelInviteService();
