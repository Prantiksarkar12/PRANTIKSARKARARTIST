import React, { useState, useEffect } from 'react';
import { useRealtimeData } from './hooks/useRealtimeData';
import { AudioProvider } from './context/AudioContext';
import { db } from './services/db';
import { Release, Video, Post, PressArticle } from './types';

// Layout & Sections
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { ArtistIntro } from './components/home/ArtistIntro';
import { FeaturedRelease } from './components/home/FeaturedRelease';
import { LatestReleases } from './components/home/LatestReleases';
import { FeaturedVideo } from './components/home/FeaturedVideo';
import { LatestVideos } from './components/home/LatestVideos';
import { LatestPosts } from './components/home/LatestPosts';
import { PressSection } from './components/home/PressSection';
import { UpcomingEvents } from './components/home/UpcomingEvents';
import { GallerySection } from './components/home/GallerySection';
import { EditorialProfile } from './components/home/EditorialProfile';
import { OfficialProfiles } from './components/home/OfficialProfiles';
import { NewsletterSection } from './components/home/NewsletterSection';
import { ContactCTA } from './components/home/ContactCTA';

// Audio Player & Modals
import { AudioPlayerBar } from './components/player/AudioPlayerBar';
import { SearchModal } from './components/modals/SearchModal';
import { ReleaseModal } from './components/modals/ReleaseModal';
import { VideoModal } from './components/modals/VideoModal';
import { ArticleReaderModal } from './components/modals/ArticleReaderModal';
import { BookingModal } from './components/modals/BookingModal';
import { ContactModal } from './components/modals/ContactModal';
import { LegalModal } from './components/modals/LegalModal';
import { AuthModal } from './components/auth/AuthModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Dedicated Full Pages
import { AdminStudio } from './pages/AdminStudio';
import { UserStudio, UserStudioTab } from './pages/UserStudio';
import { EPKPage } from './pages/EPKPage';
import { MusicPage, VideosPage, PostsPage, AboutPage, ContactPage } from './pages/CatalogPages';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { Forbidden403Page } from './pages/Forbidden403Page';
import { LabelPricingPage } from './pages/LabelPricingPage';
import { ArtistPortalPage } from './pages/ArtistPortalPage';
import { PublicRecordLabelPage } from './pages/PublicRecordLabelPage';
import { ListenEverywherePage } from './pages/ListenEverywherePage';
import { PrantikAiPage } from './pages/PrantikAiPage';

export function AppContent() {
  const {
    settings,
    currentUser,
    releases,
    featuredRelease,
    videos,
    featuredVideo,
    posts,
    press,
    events,
    gallery,
    epkFiles,
    musicPlatforms,
    allMusicPlatforms,
    contactDepartments,
  } = useRealtimeData();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState('/');

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  // Sync route on popstate or URL changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', route);
    } catch {
      // safe fallback
    }
  };

  const handleLogout = () => {
    db.logout();
    navigate('/');
  };

  // Dedicated Owner Portal & Login (/owner, /owner/login, /owner/*)
  if (currentRoute === '/owner/login' || currentRoute.startsWith('/owner')) {
    if (currentRoute === '/owner/login' || !currentUser) {
      return <OwnerLoginPage onSuccess={() => navigate('/admin')} onBackToSite={() => navigate('/')} />;
    }

    // Authenticated user attempting /owner access: check server-side role
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'SUPER_ADMIN') {
      return (
        <Forbidden403Page
          currentUser={currentUser}
          requiredRole="ROOT OWNER"
          attemptedRoute={currentRoute}
          onNavigate={navigate}
          onSwitchAccount={() => navigate('/owner/login')}
        />
      );
    }

    return (
      <AdminStudio
        onBackToSite={() => navigate('/')}
        currentRoute={currentRoute}
        onNavigate={navigate}
      />
    );
  }

  // Dedicated Admin Studio & Login (/admin, /admin/login, /admin/*, /admin/ai, /admin/sites/:id/console)
  if (currentRoute === '/admin/login' || currentRoute === '/admin' || currentRoute.startsWith('/admin/')) {
    if (currentRoute === '/admin/login' || !currentUser) {
      return <AdminLoginPage onSuccess={() => navigate('/admin')} onBackToSite={() => navigate('/')} />;
    }

    // Authenticated user attempting /admin access: check server-side role
    const adminRoles = ['OWNER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'];
    if (!adminRoles.includes(currentUser.role)) {
      return (
        <Forbidden403Page
          currentUser={currentUser}
          requiredRole="ADMINISTRATOR"
          attemptedRoute={currentRoute}
          onNavigate={navigate}
          onSwitchAccount={() => navigate('/admin/login')}
        />
      );
    }

    return (
      <AdminStudio
        onBackToSite={() => navigate('/')}
        currentRoute={currentRoute}
        onNavigate={navigate}
      />
    );
  }

  // Dedicated User Studio Console (/dashboard, /dashboard/*)
  if (currentRoute.startsWith('/dashboard')) {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 bg-zinc-950 border border-white/10 rounded-xl max-w-md space-y-4 shadow-2xl">
            <h2 className="font-display font-extrabold text-2xl uppercase">User Studio Access</h2>
            <p className="text-xs text-zinc-400">Please sign in to access your authenticated User Studio Console.</p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setAuthOpen(true)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
              >
                Sign In / Sign Up
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2.5 bg-zinc-900 text-zinc-300 text-xs rounded cursor-pointer"
              >
                Back to Site
              </button>
            </div>
          </div>
          <AuthModal
            isOpen={authOpen}
            onClose={() => setAuthOpen(false)}
            onSuccess={() => navigate('/dashboard')}
            onNavigateToDashboard={() => navigate('/dashboard')}
          />
        </div>
      );
    }

    // Determine tab from sub-route (e.g. /dashboard/chat -> 'chat', /dashboard/ai -> 'ai', /dashboard/wallet -> 'wallet')
    let initialTab: UserStudioTab = 'overview';
    let initialConvId: string | undefined = undefined;

    if (currentRoute === '/dashboard/ai/usage') {
      initialTab = 'ai_usage';
    } else if (currentRoute.startsWith('/dashboard/chat')) {
      initialTab = 'chat';
      const match = currentRoute.match(/\/dashboard\/chat\/(.+)/);
      if (match && match[1]) {
        initialConvId = match[1];
      }
    } else {
      const cleanSub = currentRoute.replace('/dashboard', '').replace(/^\//, '') as UserStudioTab;
      initialTab = cleanSub || 'overview';
    }

    return (
      <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between">
        <UserStudio
          currentUser={currentUser}
          initialTab={initialTab}
          initialConversationId={initialConvId}
          onBackToSite={() => navigate('/')}
          onLogout={handleLogout}
          onOpenReleaseModal={(r) => setSelectedRelease(r)}
          onPlayVideo={(v) => setSelectedVideo(v)}
          onReadPost={(p) => setSelectedPost(p)}
          onOpenBookingModal={() => setBookingOpen(true)}
        />
        <AudioPlayerBar />

        {/* Overlays inside User Studio */}
        <ReleaseModal
          release={selectedRelease}
          isOpen={Boolean(selectedRelease)}
          onClose={() => setSelectedRelease(null)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthOpen(true)}
        />

        <VideoModal
          video={selectedVideo}
          isOpen={Boolean(selectedVideo)}
          onClose={() => setSelectedVideo(null)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthOpen(true)}
        />

        <ArticleReaderModal
          post={selectedPost}
          isOpen={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthOpen(true)}
        />

        <BookingModal
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />

        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {}}
          onNavigateToDashboard={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-between selection:bg-rose-600 selection:text-white">
      {/* Sticky Top Bar Navigation */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigate}
        currentUser={currentUser}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <>
            {/* 1. Full-screen Cinematic Hero */}
            <Hero
              settings={settings}
              onListenNow={() => {
                if (releases.length > 0) {
                  const el = document.getElementById('latest-releases');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/music');
                } else {
                  navigate('/music');
                }
              }}
              onWatchVideos={() => {
                const el = document.getElementById('latest-videos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/videos');
              }}
            />

            {/* 2. Intro / Artist Section */}
            <ArtistIntro
              settings={settings}
              onOpenAbout={() => navigate('/about')}
            />

            {/* 3. Featured Release (Spotlight) */}
            <FeaturedRelease
              release={featuredRelease}
              onOpenReleaseModal={(r) => setSelectedRelease(r)}
            />

            {/* 4. Latest Releases Grid */}
            <div id="latest-releases">
              <LatestReleases
                releases={releases}
                onViewAllMusic={() => navigate('/music')}
                onSelectRelease={(r) => setSelectedRelease(r)}
              />
            </div>

            {/* 5. Featured Video Spotlight */}
            <FeaturedVideo
              video={featuredVideo}
              onPlayVideo={(v) => setSelectedVideo(v)}
            />

            {/* 6. Latest Videos Grid */}
            <div id="latest-videos">
              <LatestVideos
                videos={videos}
                onViewAllVideos={() => navigate('/videos')}
                onPlayVideo={(v) => setSelectedVideo(v)}
              />
            </div>

            {/* 7. Posts / Articles */}
            <LatestPosts
              posts={posts}
              onViewAllPosts={() => navigate('/posts')}
              onReadPost={(p) => setSelectedPost(p)}
            />

            {/* 8. Genuine Independent Press */}
            <PressSection press={press} />

            {/* 9. Upcoming & Past Tour Events */}
            <UpcomingEvents
              events={events}
              onOpenBooking={() => setBookingOpen(true)}
            />

            {/* 10. Official Photo Gallery */}
            <GallerySection gallery={gallery} />

            {/* 11. Editorial Artist Profile */}
            <EditorialProfile
              settings={settings}
              onOpenFullBio={() => navigate('/about')}
              onOpenContact={() => navigate('/contact')}
            />

            {/* 12. Official Platform Profiles */}
            <OfficialProfiles
              settings={settings}
              musicPlatforms={musicPlatforms}
              onExploreAll={() => navigate('/listen')}
            />

            {/* 13. Newsletter Subscription */}
            <NewsletterSection />

            {/* 14. Performance & Booking CTA */}
            <ContactCTA
              settings={settings}
              onOpenBooking={() => setBookingOpen(true)}
              onOpenContact={() => setContactOpen(true)}
            />
          </>
        )}

        {/* Subpages */}
        {(currentRoute === '/ai' || currentRoute === '/chat' || currentRoute === '/prantik-ai') && (
          <PrantikAiPage onBackToSite={() => navigate('/')} />
        )}

        {(currentRoute === '/listen' || currentRoute === '/platforms' || currentRoute === '/streaming') && (
          <ListenEverywherePage
            platforms={musicPlatforms}
            allPlatforms={allMusicPlatforms}
            onNavigateToAdmin={() => navigate('/admin/platforms')}
            isAdmin={Boolean(currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'OWNER'))}
          />
        )}

        {currentRoute === '/music' && (
          <MusicPage
            releases={releases}
            onSelectRelease={(r) => setSelectedRelease(r)}
          />
        )}

        {currentRoute === '/videos' && (
          <VideosPage
            videos={videos}
            onPlayVideo={(v) => setSelectedVideo(v)}
          />
        )}

        {currentRoute === '/posts' && (
          <PostsPage
            posts={posts}
            onReadPost={(p) => setSelectedPost(p)}
          />
        )}

        {currentRoute === '/press' && (
          <div className="pt-16">
            <PressSection press={press} />
          </div>
        )}

        {currentRoute === '/events' && (
          <div className="pt-16">
            <UpcomingEvents
              events={events}
              onOpenBooking={() => setBookingOpen(true)}
            />
          </div>
        )}

        {currentRoute === '/gallery' && (
          <div className="pt-16">
            <GallerySection gallery={gallery} />
          </div>
        )}

        {currentRoute === '/about' && (
          <AboutPage
            settings={settings}
            onOpenContact={() => setContactOpen(true)}
          />
        )}

        {currentRoute === '/contact' && (
          <ContactPage
            settings={settings}
            onOpenBooking={() => setBookingOpen(true)}
            contactDepartments={contactDepartments}
          />
        )}

        {currentRoute === '/epk' && (
          <EPKPage
            settings={settings}
            epkFiles={epkFiles}
            onOpenBooking={() => setBookingOpen(true)}
          />
        )}

        {(currentRoute === '/pricing' || currentRoute === '/label/pricing') && (
          <LabelPricingPage
            onNavigate={navigate}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}

        {currentRoute.startsWith('/label') && currentRoute !== '/label/pricing' && (
          <PublicRecordLabelPage
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}

        {currentRoute.startsWith('/artist') && (
          <ArtistPortalPage
            currentRoute={currentRoute}
            onNavigate={navigate}
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={navigate}
        onOpenLegal={(type) => setLegalType(type)}
      />

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar />

      {/* Global Interactive Overlays */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        releases={releases}
        videos={videos}
        posts={posts}
        events={events}
        press={press}
        onSelectRelease={(r) => setSelectedRelease(r)}
        onSelectVideo={(v) => setSelectedVideo(v)}
        onSelectPost={(p) => setSelectedPost(p)}
        onNavigate={navigate}
      />

      <ReleaseModal
        release={selectedRelease}
        isOpen={Boolean(selectedRelease)}
        onClose={() => setSelectedRelease(null)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <VideoModal
        video={selectedVideo}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <ArticleReaderModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        contactEmail={settings.contact_email}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {}}
        onNavigateToDashboard={() => navigate('/dashboard')}
      />

      <LegalModal
        type={legalType}
        isOpen={Boolean(legalType)}
        onClose={() => setLegalType(null)}
        artistName={settings.artist_name}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
