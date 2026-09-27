import { db } from './db';
import {
  ChatConversation,
  ChatMessage,
  ChatAttachment,
  ChatReaction,
  ChatParticipant,
  ChatReport,
  ChatBlockedUser,
  UserOnlineStatus,
  UserPresence,
  LabelTopicType,
  ChatType,
  ChatConversationUserState,
  User,
} from '../types';

class PrantikChatService {
  /**
   * Get all conversations accessible to the given user
   */
  public getConversations(userId: string): ChatConversation[] {
    if (!userId) return [];
    const user = db.getUserById(userId);
    const isAdminOrOwner = user && ['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role);

    const list = db.state.chat_conversations || [];
    const accessible = list.filter((conv) => {
      // 1. Participant check
      const isParticipant = conv.participant_ids.includes(userId);
      if (isParticipant) {
        // Exclude if locally deleted by user
        if (conv.user_states?.[userId]?.is_deleted_locally) {
          return false;
        }
        return true;
      }

      // 2. Official Label/Team/Support channel check for authorized admin/owner
      // "Admin cannot automatically access unrelated private user-to-user conversations."
      if (isAdminOrOwner && ['TEAM', 'LABEL_SUPPORT', 'USER_SUPPORT'].includes(conv.type)) {
        if (conv.user_states?.[userId]?.is_deleted_locally) {
          return false;
        }
        return true;
      }

      return false;
    });

    // Sort: Pinned first, then by updated_at descending
    return accessible.sort((a, b) => {
      const aPinned = a.user_states?.[userId]?.is_pinned ? 1 : 0;
      const bPinned = b.user_states?.[userId]?.is_pinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      const aTime = new Date(a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }

  /**
   * Get a single conversation with strict security checks
   */
  public getConversation(conversationId: string, userId: string): ChatConversation | null {
    if (!conversationId || !userId) return null;
    const conv = (db.state.chat_conversations || []).find((c) => c.id === conversationId);
    if (!conv) return null;

    // Security check: User must be a participant or authorized admin on official team/support channels
    const isParticipant = conv.participant_ids.includes(userId);
    if (isParticipant) return conv;

    const user = db.getUserById(userId);
    const isAdminOrOwner = user && ['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role);
    if (isAdminOrOwner && ['TEAM', 'LABEL_SUPPORT', 'USER_SUPPORT'].includes(conv.type)) {
      return conv;
    }

    // Access Denied: User is not authorized to view this private thread
    return null;
  }

  /**
   * Get messages for a conversation
   */
  public getMessages(conversationId: string, userId: string): ChatMessage[] {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) return [];

    const messages = (db.state.chat_messages || []).filter((m) => m.conversation_id === conversationId);
    return messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /**
   * Send a chat message
   */
  public sendMessage(params: {
    conversationId: string;
    senderId: string;
    text: string;
    attachments?: ChatAttachment[];
    replyToMessageId?: string;
  }): ChatMessage {
    const { conversationId, senderId, text, attachments, replyToMessageId } = params;
    const conv = this.getConversation(conversationId, senderId);
    if (!conv) {
      throw new Error('Access denied or conversation not found.');
    }

    const sender = db.getUserById(senderId);
    if (!sender) {
      throw new Error('Sender not found.');
    }

    // Check block list in direct conversation
    if (conv.type === 'DIRECT') {
      const recipientId = conv.participant_ids.find((id) => id !== senderId);
      if (recipientId) {
        if (this.isBlocked(senderId, recipientId) || this.isBlocked(recipientId, senderId)) {
          throw new Error('Unable to send message: You or the recipient have blocked communication.');
        }
      }
    }

    // Resolve reply snippet if replying
    let replySnippet: { id: string; sender_name: string; text: string } | undefined;
    if (replyToMessageId) {
      const targetMsg = (db.state.chat_messages || []).find((m) => m.id === replyToMessageId);
      if (targetMsg) {
        replySnippet = {
          id: targetMsg.id,
          sender_name: targetMsg.sender_name,
          text: targetMsg.text.slice(0, 100),
        };
      }
    }

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: sender.name,
      sender_role: sender.role,
      sender_avatar: sender.avatar_url,
      text: text.trim(),
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      reply_to_message_id: replyToMessageId,
      reply_snippet: replySnippet,
      reactions: [],
      status: 'delivered', // Delivered to central storage
      created_at: now,
    };

    if (!db.state.chat_messages) {
      db.state.chat_messages = [];
    }
    db.state.chat_messages.push(newMsg);

    // Update conversation metadata and unread counts
    conv.last_message = {
      id: newMsg.id,
      sender_id: senderId,
      sender_name: sender.name,
      text: newMsg.text || (newMsg.attachments?.length ? `[Attachment: ${newMsg.attachments[0].name}]` : 'Message'),
      status: newMsg.status,
      created_at: now,
    };
    conv.updated_at = now;

    // Increment unread count for other participants & un-delete locally if deleted
    conv.participant_ids.forEach((pId) => {
      if (!conv.user_states) conv.user_states = {};
      if (!conv.user_states[pId]) {
        conv.user_states[pId] = { unread_count: 0 };
      }
      conv.user_states[pId].is_deleted_locally = false; // message restores conversation
      if (pId !== senderId) {
        conv.user_states[pId].unread_count = (conv.user_states[pId].unread_count || 0) + 1;
      }
    });

    db.saveState();
    db.broadcast('message.created', newMsg);
    db.broadcast('conversation.updated', conv);

    return newMsg;
  }

  /**
   * Mark messages as read in conversation
   */
  public markAsRead(conversationId: string, userId: string): void {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) return;

    const user = db.getUserById(userId);
    const allowReadReceipts = user?.privacy_settings?.show_read_receipts !== false;

    // Reset unread count for this user
    if (!conv.user_states) conv.user_states = {};
    if (!conv.user_states[userId]) {
      conv.user_states[userId] = { unread_count: 0 };
    } else {
      conv.user_states[userId].unread_count = 0;
    }

    // Update participant last read
    const participant = conv.participants.find((p) => p.user_id === userId);
    if (participant) {
      participant.last_read_at = new Date().toISOString();
    }

    // If user's privacy permits read receipts, update incoming messages to 'read'
    if (allowReadReceipts) {
      const messages = (db.state.chat_messages || []).filter(
        (m) => m.conversation_id === conversationId && m.sender_id !== userId && m.status !== 'read'
      );
      if (messages.length > 0) {
        messages.forEach((m) => {
          m.status = 'read';
        });
        if (conv.last_message && conv.last_message.sender_id !== userId) {
          conv.last_message.status = 'read';
        }
      }
    }

    db.saveState();
    db.broadcast('message.read', { conversationId, userId });
    db.broadcast('conversation.updated', conv);
  }

  /**
   * Add or toggle emoji reaction on a message
   */
  public addReaction(messageId: string, userId: string, emoji: string): ChatMessage | null {
    const msg = (db.state.chat_messages || []).find((m) => m.id === messageId);
    if (!msg) return null;

    const user = db.getUserById(userId);
    if (!user) return null;

    if (!msg.reactions) msg.reactions = [];

    // Check if user already reacted with this emoji
    const existingIndex = msg.reactions.findIndex((r) => r.user_id === userId && r.emoji === emoji);
    if (existingIndex >= 0) {
      // Toggle off
      msg.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      msg.reactions.push({
        emoji,
        user_id: userId,
        user_name: user.name,
        created_at: new Date().toISOString(),
      });
    }

    db.saveState();
    db.broadcast('message.reaction', { messageId, userId, emoji });
    return msg;
  }

  /**
   * Delete message
   */
  public deleteMessage(messageId: string, userId: string, forEveryone: boolean): boolean {
    const msg = (db.state.chat_messages || []).find((m) => m.id === messageId);
    if (!msg) return false;

    const user = db.getUserById(userId);
    const isAuthor = msg.sender_id === userId;
    const isAdmin = user && ['OWNER', 'SUPER_ADMIN', 'ADMIN'].includes(user.role);

    if (forEveryone) {
      if (!isAuthor && !isAdmin) {
        throw new Error('You do not have permission to delete this message for everyone.');
      }
      msg.is_deleted = true;
      msg.text = 'This message was deleted';
      msg.attachments = undefined;
      msg.reactions = [];
    }

    db.saveState();
    db.broadcast('message.deleted', { messageId, forEveryone });
    return true;
  }

  /**
   * Edit message
   */
  public editMessage(messageId: string, userId: string, newText: string): ChatMessage {
    const msg = (db.state.chat_messages || []).find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found.');

    if (msg.sender_id !== userId) {
      throw new Error('You can only edit your own messages.');
    }

    msg.text = newText.trim();
    msg.is_edited = true;
    msg.edited_at = new Date().toISOString();

    db.saveState();
    db.broadcast('message.updated', msg);
    return msg;
  }

  /**
   * Create or retrieve direct conversation between two users
   */
  public createDirectConversation(userId: string, targetUserId: string, initialMessage?: string): ChatConversation {
    if (userId === targetUserId) {
      throw new Error('Cannot start a direct conversation with yourself.');
    }

    const userA = db.getUserById(userId);
    const userB = db.getUserById(targetUserId);
    if (!userA || !userB) {
      throw new Error('One or both users not found.');
    }

    // Check if target user allows direct messages
    if (userB.privacy_settings?.allow_direct_messages === 'nobody') {
      throw new Error(`${userB.name} does not accept direct message requests.`);
    }

    // Check if existing 1-on-1 direct chat exists
    const existing = (db.state.chat_conversations || []).find(
      (c) =>
        c.type === 'DIRECT' &&
        c.participant_ids.length === 2 &&
        c.participant_ids.includes(userId) &&
        c.participant_ids.includes(targetUserId)
    );

    if (existing) {
      // Un-delete locally if deleted
      if (!existing.user_states) existing.user_states = {};
      if (existing.user_states[userId]) {
        existing.user_states[userId].is_deleted_locally = false;
        existing.user_states[userId].is_archived = false;
      }
      if (initialMessage && initialMessage.trim()) {
        this.sendMessage({
          conversationId: existing.id,
          senderId: userId,
          text: initialMessage,
        });
      }
      db.saveState();
      return existing;
    }

    // Create new direct conversation
    const now = new Date().toISOString();
    const convId = `conv_dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newConv: ChatConversation = {
      id: convId,
      type: 'DIRECT',
      title: userB.name,
      avatar_url: userB.avatar_url,
      description: `Direct encrypted thread with ${userB.name} (${userB.role})`,
      created_by: userId,
      participants: [
        {
          user_id: userA.id,
          user_name: userA.name,
          user_role: userA.role,
          user_avatar: userA.avatar_url,
          joined_at: now,
          is_group_admin: false,
        },
        {
          user_id: userB.id,
          user_name: userB.name,
          user_role: userB.role,
          user_avatar: userB.avatar_url,
          joined_at: now,
          is_group_admin: false,
        },
      ],
      participant_ids: [userA.id, userB.id],
      topic: 'GENERAL',
      status: 'ACTIVE',
      user_states: {
        [userA.id]: { unread_count: 0, is_pinned: false, is_archived: false, is_muted: false },
        [userB.id]: { unread_count: 0, is_pinned: false, is_archived: false, is_muted: false },
      },
      created_at: now,
      updated_at: now,
    };

    if (!db.state.chat_conversations) db.state.chat_conversations = [];
    db.state.chat_conversations.unshift(newConv);

    if (initialMessage && initialMessage.trim()) {
      const msg = this.sendMessage({
        conversationId: newConv.id,
        senderId: userId,
        text: initialMessage,
      });
      newConv.last_message = {
        id: msg.id,
        sender_id: userId,
        sender_name: userA.name,
        text: msg.text,
        status: msg.status,
        created_at: now,
      };
    }

    db.saveState();
    db.broadcast('conversation.created', newConv);
    return newConv;
  }

  /**
   * Create group conversation
   */
  public createGroupConversation(
    creatorId: string,
    title: string,
    description: string,
    memberIds: string[],
    initialMessage?: string
  ): ChatConversation {
    const creator = db.getUserById(creatorId);
    if (!creator) throw new Error('Creator not found.');

    const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const now = new Date().toISOString();
    const convId = `conv_grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const participants: ChatParticipant[] = allMemberIds.map((mId) => {
      const u = db.getUserById(mId);
      return {
        user_id: mId,
        user_name: u?.name || 'Member',
        user_role: u?.role || 'USER',
        user_avatar: u?.avatar_url,
        joined_at: now,
        is_group_admin: mId === creatorId,
      };
    });

    const userStates: Record<string, ChatConversationUserState> = {};
    allMemberIds.forEach((mId) => {
      userStates[mId] = { unread_count: 0, is_pinned: false, is_archived: false, is_muted: false };
    });

    const newConv: ChatConversation = {
      id: convId,
      type: 'GROUP',
      title: title.trim(),
      description: description.trim(),
      created_by: creatorId,
      participants,
      participant_ids: allMemberIds,
      topic: 'GENERAL',
      status: 'ACTIVE',
      user_states: userStates,
      created_at: now,
      updated_at: now,
    };

    if (!db.state.chat_conversations) db.state.chat_conversations = [];
    db.state.chat_conversations.unshift(newConv);

    if (initialMessage && initialMessage.trim()) {
      const msg = this.sendMessage({
        conversationId: newConv.id,
        senderId: creatorId,
        text: initialMessage,
      });
      newConv.last_message = {
        id: msg.id,
        sender_id: creatorId,
        sender_name: creator.name,
        text: msg.text,
        status: msg.status,
        created_at: now,
      };
    }

    db.saveState();
    db.broadcast('conversation.created', newConv);
    return newConv;
  }

  /**
   * Create dedicated Artist-to-Label Communication Line
   */
  public createLabelConversation(
    artistId: string,
    topic: LabelTopicType,
    title: string,
    initialMessage: string,
    relatedRecordId?: string
  ): ChatConversation {
    const artist = db.getUserById(artistId);
    if (!artist) throw new Error('Artist not found.');

    const now = new Date().toISOString();
    const convId = `conv_lbl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Add artist and label executive staff (Owner & Management Super Admin)
    const adminUser = db.state.users.find((u) => u.role === 'SUPER_ADMIN' || u.role === 'OWNER') || {
      id: 'user_admin_01',
      name: 'Management Operations',
      role: 'SUPER_ADMIN',
    };

    const participantIds = Array.from(new Set([artistId, 'user_owner_01', adminUser.id]));
    const participants: ChatParticipant[] = participantIds.map((pId) => {
      const u = db.getUserById(pId);
      return {
        user_id: pId,
        user_name: u?.name || 'Label Staff',
        user_role: u?.role || 'ADMIN',
        user_avatar: u?.avatar_url,
        joined_at: now,
        is_group_admin: pId !== artistId,
      };
    });

    const userStates: Record<string, ChatConversationUserState> = {};
    participantIds.forEach((pId) => {
      userStates[pId] = { unread_count: 0, is_pinned: false, is_archived: false, is_muted: false };
    });

    const newConv: ChatConversation = {
      id: convId,
      type: 'LABEL_SUPPORT',
      title: title.trim() || `Label Desk: ${topic}`,
      description: `Official PRANTIK SARKAR ARTIST RECORD channel for ${artist.name} regarding ${topic}.`,
      created_by: artistId,
      participants,
      participant_ids: participantIds,
      topic,
      related_record_id: relatedRecordId,
      status: 'PENDING_ADMIN',
      user_states: userStates,
      created_at: now,
      updated_at: now,
    };

    if (!db.state.chat_conversations) db.state.chat_conversations = [];
    db.state.chat_conversations.unshift(newConv);

    if (initialMessage && initialMessage.trim()) {
      const msg = this.sendMessage({
        conversationId: newConv.id,
        senderId: artistId,
        text: initialMessage,
      });
      newConv.last_message = {
        id: msg.id,
        sender_id: artistId,
        sender_name: artist.name,
        text: msg.text,
        status: msg.status,
        created_at: now,
      };
    }

    db.saveState();
    db.broadcast('conversation.created', newConv);
    return newConv;
  }

  /**
   * Update conversation user state (pin, archive, mute, delete locally)
   */
  public updateConversationUserState(
    conversationId: string,
    userId: string,
    updates: Partial<ChatConversationUserState>
  ): void {
    const conv = this.getConversation(conversationId, userId);
    if (!conv) return;

    if (!conv.user_states) conv.user_states = {};
    if (!conv.user_states[userId]) {
      conv.user_states[userId] = { unread_count: 0 };
    }

    Object.assign(conv.user_states[userId], updates);
    db.saveState();
    db.broadcast('conversation.updated', conv);
  }

  /**
   * Manage group participants
   */
  public manageGroupParticipant(
    conversationId: string,
    currentUserId: string,
    action: 'add' | 'remove' | 'promote_admin' | 'leave',
    targetUserId: string
  ): void {
    const conv = this.getConversation(conversationId, currentUserId);
    if (!conv || conv.type !== 'GROUP') {
      throw new Error('Conversation is not a group or access denied.');
    }

    const currentParticipant = conv.participants.find((p) => p.user_id === currentUserId);
    const isGroupAdmin = currentParticipant?.is_group_admin || conv.created_by === currentUserId;

    if (action === 'leave') {
      conv.participants = conv.participants.filter((p) => p.user_id !== currentUserId);
      conv.participant_ids = conv.participant_ids.filter((id) => id !== currentUserId);
      if (conv.user_states?.[currentUserId]) {
        conv.user_states[currentUserId].is_deleted_locally = true;
      }
    } else if (action === 'add') {
      if (!isGroupAdmin) throw new Error('Only group admins can add members.');
      if (!conv.participant_ids.includes(targetUserId)) {
        const u = db.getUserById(targetUserId);
        conv.participant_ids.push(targetUserId);
        conv.participants.push({
          user_id: targetUserId,
          user_name: u?.name || 'Member',
          user_role: u?.role || 'USER',
          user_avatar: u?.avatar_url,
          joined_at: new Date().toISOString(),
          is_group_admin: false,
        });
        if (!conv.user_states[targetUserId]) {
          conv.user_states[targetUserId] = { unread_count: 0 };
        }
      }
    } else if (action === 'remove') {
      if (!isGroupAdmin) throw new Error('Only group admins can remove members.');
      conv.participants = conv.participants.filter((p) => p.user_id !== targetUserId);
      conv.participant_ids = conv.participant_ids.filter((id) => id !== targetUserId);
    } else if (action === 'promote_admin') {
      if (!isGroupAdmin) throw new Error('Only group admins can promote members.');
      const p = conv.participants.find((part) => part.user_id === targetUserId);
      if (p) p.is_group_admin = true;
    }

    conv.updated_at = new Date().toISOString();
    db.saveState();
    db.broadcast('conversation.updated', conv);
  }

  /**
   * Block / Unblock user
   */
  public blockUser(userId: string, blockedUserId: string): void {
    if (userId === blockedUserId) return;
    const targetUser = db.getUserById(blockedUserId);
    if (!targetUser) return;

    if (!db.state.chat_blocked_users) db.state.chat_blocked_users = [];
    const exists = db.state.chat_blocked_users.some(
      (b) => b.user_id === userId && b.blocked_user_id === blockedUserId
    );
    if (!exists) {
      db.state.chat_blocked_users.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        user_id: userId,
        blocked_user_id: blockedUserId,
        blocked_user_name: targetUser.name,
        created_at: new Date().toISOString(),
      });
      db.saveState();
      db.broadcast('user.blocked', { userId, blockedUserId });
    }
  }

  public unblockUser(userId: string, blockedUserId: string): void {
    if (!db.state.chat_blocked_users) return;
    db.state.chat_blocked_users = db.state.chat_blocked_users.filter(
      (b) => !(b.user_id === userId && b.blocked_user_id === blockedUserId)
    );
    db.saveState();
    db.broadcast('user.unblocked', { userId, blockedUserId });
  }

  public isBlocked(userId: string, targetUserId: string): boolean {
    const list = db.state.chat_blocked_users || [];
    return list.some((b) => b.user_id === userId && b.blocked_user_id === targetUserId);
  }

  /**
   * Report conversation or user
   */
  public reportConversation(params: {
    reporterId: string;
    conversationId: string;
    reason: ChatReport['reason'];
    details: string;
    reportedUserId?: string;
    reportedMessageId?: string;
  }): ChatReport {
    const { reporterId, conversationId, reason, details, reportedUserId, reportedMessageId } = params;
    const reporter = db.getUserById(reporterId);

    const report: ChatReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reporter_id: reporterId,
      reporter_name: reporter?.name || 'User',
      reported_user_id: reportedUserId,
      reported_message_id: reportedMessageId,
      conversation_id: conversationId,
      reason,
      details: details.trim(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    if (!db.state.chat_reports) db.state.chat_reports = [];
    db.state.chat_reports.unshift(report);

    // Add alert notification for Admin & Owner
    db.sendAdminNotification(
      'New Chat Report Submitted',
      `User ${report.reporter_name} reported conversation (${reason}): "${details.slice(0, 100)}"`,
      'SECURITY_ALERT',
      'all'
    );

    db.saveState();
    return report;
  }

  /**
   * Online presence and typing indicators
   */
  public setUserPresence(userId: string, status: UserOnlineStatus, typingInConversationId?: string | null): void {
    if (!userId) return;
    if (!db.state.user_presences) db.state.user_presences = {};

    db.state.user_presences[userId] = {
      user_id: userId,
      status,
      last_seen: new Date().toISOString(),
      is_typing_in_conversation_id: typingInConversationId,
    };

    db.saveState();
    if (typingInConversationId) {
      db.broadcast('typing.started', { userId, conversationId: typingInConversationId });
    } else {
      db.broadcast('user.online', { userId, status });
    }
  }

  public getUserPresence(targetUserId: string, viewerUserId?: string): { status: UserOnlineStatus; last_seen?: string } {
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) return { status: 'OFFLINE' };

    // Respect user privacy settings:
    // "Never expose presence data when the user's privacy settings disable it."
    if (targetUser.privacy_settings?.show_online_status === false) {
      return { status: 'OFFLINE' };
    }

    const presence = db.state.user_presences?.[targetUserId];
    const status = presence?.status || 'ONLINE'; // Default online for active demo users
    const showLastSeen = targetUser.privacy_settings?.show_last_seen !== false;

    return {
      status,
      last_seen: showLastSeen ? presence?.last_seen || targetUser.last_login_at : undefined,
    };
  }

  /**
   * Search messages within a conversation
   */
  public searchMessages(conversationId: string, query: string, userId: string): ChatMessage[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = this.getMessages(conversationId, userId);
    return all.filter((m) => !m.is_deleted && m.text.toLowerCase().includes(q));
  }
}

export const prantikChat = new PrantikChatService();
