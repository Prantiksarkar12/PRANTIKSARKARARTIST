import React, { useState } from 'react';
import { Release, Video, Post, PressArticle, EventItem, GalleryItem, SiteSettings, ContactDepartment } from '../types';
import { Artwork } from '../components/common/ArtworkPlaceholder';
import { useAudio } from '../context/AudioContext';
import { Play, Disc, Film, BookOpen, Calendar, Newspaper, MapPin, ExternalLink, Mail, Send, Camera, Clock, Ticket, Copy, Check } from 'lucide-react';
import { db } from '../services/db';

// --- MUSIC DISCOGRAPHY PAGE ---
export const MusicPage: React.FC<{
  releases: Release[];
  onSelectRelease: (r: Release) => void;
}> = ({ releases, onSelectRelease }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL' ? releases : releases.filter((r) => r.type === filter);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">Official Catalog</p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            Music Discography
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-light">
            Stream singles, conceptual EPs, studio albums, and official collaborative releases.
          </p>
        </div>

        {/* Filter controls */}
        {releases.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-1 p-1 bg-zinc-900 border border-white/10 rounded-lg">
              {['ALL', 'Single', 'EP', 'Album', 'Mixtape'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    filter === t ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950/60 border border-white/10 rounded-xl max-w-md mx-auto space-y-3">
            <Disc className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="font-display font-bold text-white uppercase">No releases found</p>
            <p className="text-xs text-zinc-400">No releases match the selected filter category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((release) => (
              <div
                key={release.id}
                onClick={() => onSelectRelease(release)}
                className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-square">
                  <Artwork
                    src={release.artwork_url}
                    alt={release.title}
                    aspect="square"
                    title={release.title}
                    type="release"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[10px] uppercase font-bold text-zinc-300 rounded border border-white/10">
                    {release.type}
                  </div>
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-zinc-500">{release.release_date}</span>
                    <h3 className="font-display font-bold text-base text-white uppercase group-hover:text-rose-400 transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-xs text-zinc-400">{release.artist}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-rose-400 font-semibold uppercase text-[11px] flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Stream</span>
                    </span>
                    <span className="text-zinc-500">Details ↗</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- VIDEOS PAGE ---
export const VideosPage: React.FC<{
  videos: Video[];
  onPlayVideo: (v: Video) => void;
}> = ({ videos, onPlayVideo }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">Visuals & Cinema</p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            Official Videos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-light">
            Cinematic music videos, cypher clips, and documentary visualizers.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950/60 border border-white/10 rounded-xl max-w-md mx-auto space-y-3">
            <Film className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="font-display font-bold text-white uppercase">No videos published yet</p>
            <p className="text-xs text-zinc-400">Official visuals will premier here upon release.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => onPlayVideo(video)}
                className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-video">
                  <Artwork
                    src={video.thumbnail_url}
                    alt={video.title}
                    aspect="video"
                    title={video.title}
                    type="video"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-mono text-zinc-500">{video.published_date}</span>
                  <h3 className="font-display font-bold text-base text-white uppercase group-hover:text-rose-400 transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- POSTS PAGE ---
export const PostsPage: React.FC<{
  posts: Post[];
  onReadPost: (p: Post) => void;
}> = ({ posts, onReadPost }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">Journal & Essays</p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            Posts & Articles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-light">
            Creative notes, production breakdowns, and official announcements.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950/60 border border-white/10 rounded-xl max-w-md mx-auto space-y-3">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="font-display font-bold text-white uppercase">No articles published yet</p>
            <p className="text-xs text-zinc-400">Written notes and updates will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => onReadPost(post)}
                className="group bg-[#0d0d12] border border-white/10 hover:border-white/25 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[16/10]">
                  <Artwork
                    src={post.cover_image}
                    alt={post.title}
                    aspect="video"
                    title={post.title}
                    type="post"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-0.5 text-[10px] uppercase font-bold text-rose-400 rounded border border-white/10">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-zinc-500">{post.published_date}</span>
                    <h3 className="font-display font-bold text-lg text-white uppercase group-hover:text-rose-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 font-light leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-xs text-rose-400 font-semibold uppercase">
                    Read Article →
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- ABOUT THE ARTIST PAGE ---
export const AboutPage: React.FC<{
  settings: SiteSettings;
  onOpenContact: () => void;
}> = ({ settings, onOpenContact }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold">Artist Profile</p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            About {settings.artist_name}
          </h1>
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            {settings.artist_title}
          </p>
        </div>

        <div className="p-8 sm:p-12 bg-[#0c0c11] border border-white/10 rounded-xl space-y-6 text-sm sm:text-base leading-relaxed text-zinc-300 font-light">
          <p className="text-lg sm:text-xl text-white font-medium leading-relaxed">
            {settings.bio}
          </p>
          <p>{settings.extended_bio}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Based in</span>
            <p className="font-display font-bold text-lg text-white uppercase">{settings.based_in}</p>
          </div>
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Genres</span>
            <p className="font-display font-bold text-lg text-white uppercase">{settings.genres.join(', ')}</p>
          </div>
          <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Representation</span>
            <p className="font-display font-bold text-lg text-white uppercase">{settings.record_label || 'Independent Artist'}</p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={onOpenContact}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors shadow-lg"
          >
            Get In Touch With Management
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CONTACT & BOOKING PAGE ---
export const ContactPage: React.FC<{
  settings: SiteSettings;
  onOpenBooking: () => void;
  contactDepartments?: ContactDepartment[];
}> = ({ settings, onOpenBooking, contactDepartments }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', department: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const departments = contactDepartments && contactDepartments.length > 0
    ? contactDepartments
    : [
        {
          id: 'dept_booking',
          department_key: 'booking_licensing',
          title: 'Booking & Licensing',
          email: 'prantiksarkarartist@hotmail.com',
          description: 'Live performance bookings, festivals, concert headline appearances, master synchronization and commercial licensing.',
          display_order: 1,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'dept_collab',
          department_key: 'collaborations',
          title: 'Collaborations',
          email: 'prantiksarkarartist@outlook.in',
          description: 'Artist collaborations, featured verses, vocal recordings, production partnerships, and songwriting inquiries.',
          display_order: 2,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'dept_sponsor',
          department_key: 'sponsorships',
          title: 'Sponsorships',
          email: 'prantiksarkarartist@outlook.com',
          description: 'Brand endorsements, corporate partnerships, commercial endorsements, event sponsorships, and brand integrations.',
          display_order: 3,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'dept_promo',
          department_key: 'promotion',
          title: 'Promotion',
          email: 'prantiksarkarartist@hotmail.com',
          description: 'Media publicity, radio pluggers, playlist pitching, interview requests, and press coverage opportunities.',
          display_order: 4,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'dept_copyright',
          department_key: 'copyright_reports',
          title: 'Copyright / Re-upload Reports',
          email: 'prantiksarkar825@gmail.com',
          description: 'Official copyright administration, unauthorized re-upload infringement reports, DMCA notices, and content claims.',
          display_order: 5,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ];

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus('submitting');
    try {
      db.sendMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.department ? `[${formData.department}] ${formData.subject}` : formData.subject,
        message: formData.message,
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', department: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold font-mono">
            Direct Management & Inquiries
          </p>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight">
            Contact Prantik Sarkar Artist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-light">
            Direct correspondence routes for Booking & Licensing, Collaborations, Sponsorships, Promotion, and Copyright Administration.
          </p>
        </div>

        {/* Categorized Contact Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
              Departmental Contact Inboxes
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Select department to email directly or copy address
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-5 rounded-xl bg-zinc-950/80 border border-white/10 hover:border-rose-500/40 transition-all space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                      Department
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white uppercase tracking-tight">
                    {dept.title}
                  </h3>
                  {dept.description && (
                    <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="text-xs font-mono font-medium text-rose-300 truncate bg-zinc-900/80 px-2.5 py-1.5 rounded border border-white/5">
                    {dept.email}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`mailto:${dept.email}`}
                      className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                    <button
                      onClick={() => handleCopy(dept.email, dept.id)}
                      className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === dept.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Form & Live Tour Booking Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          {/* Info Side */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 bg-gradient-to-br from-rose-950/30 to-zinc-950 border border-rose-500/30 rounded-xl space-y-3">
              <h4 className="font-display font-bold text-lg text-white uppercase">Live Tour & Festival Booking</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Planning a live concert, music festival, university fest, or private club appearance? Submit performance dates and rider inquiries directly to management.
              </p>
              <button
                onClick={onOpenBooking}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors shadow-lg cursor-pointer"
              >
                Submit Performance Booking Form
              </button>
            </div>

            <div className="p-6 bg-zinc-950 border border-white/10 rounded-xl space-y-3 text-xs text-zinc-400">
              <h4 className="font-display font-bold text-sm text-white uppercase">Official Artist Representation</h4>
              <p className="leading-relaxed">
                Prantik Sarkar operates with direct administrative management. Inquiries received through official addresses are reviewed within 24–48 business hours.
              </p>
              <div className="pt-2 text-[11px] font-mono text-zinc-500">
                Primary Desk: {settings.booking_email || 'prantiksarkarartist@hotmail.com'}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7 bg-[#0c0c11] border border-white/10 rounded-xl p-6 sm:p-8">
            <h3 className="font-display font-bold text-xl text-white uppercase mb-2">Send an Instant Message</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Fill in your details below and our team will route it directly to the designated department.
            </p>

            {status === 'success' ? (
              <div className="p-6 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                <p className="text-emerald-400 font-bold text-base">Transmission Sent Successfully</p>
                <p className="text-xs text-zinc-300">
                  Management has received your correspondence and will respond shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold uppercase rounded text-white cursor-pointer mt-2"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">
                    Select Target Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">General Management Inquiry</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.title}>
                        {d.title} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full Name / Company"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Proposal, booking date, or license inquiry"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold uppercase text-[10px] block mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant details, budget, dates, or media links..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded text-white resize-none focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{status === 'submitting' ? 'Transmitting Message...' : 'Send Direct Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
