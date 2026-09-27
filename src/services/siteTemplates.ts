import { ProjectTemplate, SiteCategory } from '../types';

export const SYSTEM_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank-nextjs',
    name: 'Blank Website',
    category: 'Custom',
    badge: 'Official',
    icon: 'Code',
    description: 'Clean, production-grade Next.js + TypeScript + Tailwind CSS framework scaffold with standard empty states.',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'React 19'],
    default_files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'blank-project',
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint',
            },
            dependencies: {
              react: '^19.0.0',
              'react-dom': '^19.0.0',
              next: '^15.0.0',
              'lucide-react': '^0.468.0',
            },
            devDependencies: {
              typescript: '^5.0.0',
              '@types/node': '^20.0.0',
              '@types/react': '^19.0.0',
              '@types/react-dom': '^19.0.0',
              tailwindcss: '^4.0.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'es5',
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }],
              paths: { '@/*': ['./src/*'] },
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules'],
          },
          null,
          2
        ),
      },
      {
        path: 'src/app/layout.tsx',
        content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Title',
  description: 'Clean project built with Admin Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}`,
      },
      {
        path: 'src/app/globals.css',
        content: `@import "tailwindcss";

:root {
  --background: #09090b;
  --foreground: #ededed;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}`,
      },
      {
        path: 'src/app/page.tsx',
        content: `export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
      <div className="max-w-xl p-8 border border-white/10 rounded-2xl bg-zinc-900/60 backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          New Blank Project
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Ready for development. Add components, create API routes, or configure deployments.
        </p>
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-left text-xs font-mono text-zinc-300">
          <p className="text-rose-400">// Status</p>
          <p>No releases available.</p>
          <p>No posts published.</p>
          <p>No events available.</p>
        </div>
      </div>
    </main>
  );
}`,
      },
      {
        path: 'README.md',
        content: `# Blank Project
Generated automatically by Admin Studio Project Builder.
`,
      },
    ],
  },
  {
    id: 'artist-official-site',
    name: 'Artist Official Website',
    category: 'Artist',
    badge: 'Popular',
    icon: 'Music',
    description: 'Cinematic dark luxury artist website with integrated audio player, disk catalog, video player, and tour schedule.',
    tags: ['Music', 'Audio Player', 'Tour Dates', 'Discography'],
    default_files: [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'artist-website',
            version: '1.0.0',
            dependencies: {
              react: '^19.0.0',
              'react-dom': '^19.0.0',
              'lucide-react': '^0.468.0',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Artist Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Syne:wght@700;800&display=swap">
  <style>
    body { font-family: sans-serif; background-color: #070709; color: #f4f4f5; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-syne { font-family: 'Syne', sans-serif; }
  </style>
</head>
<body class="selection:bg-rose-600 selection:text-white">
  <!-- Nav -->
  <nav class="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
    <div class="font-cinzel tracking-widest text-lg font-bold text-white uppercase">ARTIST PORTAL</div>
    <div class="flex items-center gap-6 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
      <a href="#music" class="hover:text-white transition">Music</a>
      <a href="#tour" class="hover:text-white transition">Tour</a>
      <a href="#contact" class="hover:text-white transition">Contact</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0a0507] to-[#070709]">
    <div class="inline-block px-3 py-1 mb-4 rounded-full border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono tracking-widest uppercase">
      Official Platform
    </div>
    <h1 class="font-syne text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-white mb-4">
      PRANTIK SARKAR
    </h1>
    <p class="text-zinc-400 max-w-lg text-sm md:text-base mb-8">
      Artist • Rapper • Creator. Stream latest drops, watch music videos, and secure tour tickets worldwide.
    </p>
    <div class="flex flex-wrap gap-4 justify-center">
      <a href="#music" class="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-rose-950 transition">
        Listen Now
      </a>
      <a href="#tour" class="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition">
        Tour Dates
      </a>
    </div>
  </section>

  <!-- Releases -->
  <section id="music" class="max-w-5xl mx-auto px-6 py-16">
    <div class="flex items-center justify-between mb-8 pb-3 border-b border-white/10">
      <h2 class="font-syne text-2xl font-bold uppercase tracking-wide">Latest Releases</h2>
      <span class="text-xs text-zinc-500 font-mono">Stream Worldwide</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-zinc-900/60 border border-white/10 rounded-xl p-5 hover:border-rose-500/50 transition">
        <div class="w-full aspect-square bg-zinc-800 rounded-lg mb-4 flex items-center justify-center text-zinc-600 font-mono text-xs">
          [ARTWORK COVER]
        </div>
        <div class="text-xs text-rose-400 font-mono mb-1">SINGLE • 2026</div>
        <h3 class="font-bold text-white text-base mb-1">Crimson Echoes</h3>
        <p class="text-xs text-zinc-400 mb-4">Heavy sub bass, sharp lyrical cadence, and atmospheric strings.</p>
        <button class="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded uppercase tracking-wider text-zinc-200">
          Play Track
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/10 py-8 px-6 text-center text-xs text-zinc-500 font-mono">
    © 2026 Artist Management. All rights reserved.
  </footer>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'record-label-hub',
    name: 'Music Record Label',
    category: 'Record Label',
    badge: 'Enterprise',
    icon: 'Radio',
    description: 'Complete record label platform with artist roster, catalogue indexing, press kits, and demo drop box.',
    tags: ['Label', 'Roster', 'Catalog', 'Submissions'],
    default_files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Record Label Roster & Catalog</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 font-sans p-8">
  <header class="max-w-6xl mx-auto flex justify-between items-center pb-8 border-b border-zinc-800">
    <div class="text-2xl font-black tracking-tighter">IMPRINT RECORDS</div>
    <div class="space-x-6 text-sm text-zinc-400">
      <a href="#roster" class="hover:text-white">Roster</a>
      <a href="#releases" class="hover:text-white">Releases</a>
      <a href="#demos" class="hover:text-white">Demo Submission</a>
    </div>
  </header>
  <main class="max-w-6xl mx-auto py-12">
    <h1 class="text-4xl font-extrabold mb-4">Independent Sound. Global Distribution.</h1>
    <p class="text-zinc-400 mb-8 max-w-xl">Curating forward-thinking artists, heavy electronic productions, and underground hip-hop.</p>
    <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
      <h2 class="text-lg font-bold mb-2">Demo Submissions</h2>
      <p class="text-xs text-zinc-400 mb-4">Send unreleased private streaming links (SoundCloud/Dropbox only).</p>
      <button class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase rounded">Submit Demo</button>
    </div>
  </main>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'producer-portfolio',
    name: 'Creative Portfolio',
    category: 'Portfolio',
    icon: 'FolderKanban',
    description: 'Minimalist showcase for audio producers, sound designers, visual directors, and creators.',
    tags: ['Minimal', 'Grid', 'Case Studies', 'Dark Mode'],
    default_files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Producer & Creator Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0b0e] text-zinc-200 p-8 font-sans">
  <div class="max-w-4xl mx-auto space-y-12">
    <header class="flex justify-between items-baseline border-b border-zinc-800 pb-6">
      <h1 class="text-xl font-bold tracking-tight text-white">STUDIO CREDITS & WORKS</h1>
      <span class="text-xs font-mono text-zinc-500">2024 — 2026</span>
    </header>
    <section class="space-y-4">
      <h2 class="text-sm font-mono uppercase text-zinc-400">Selected Discography & Mixing</h2>
      <div class="divide-y divide-zinc-800 border-y border-zinc-800">
        <div class="py-4 flex justify-between items-center hover:bg-zinc-900/50 px-2 transition">
          <div>
            <div class="font-semibold text-white">Prantik Sarkar — Midnight Cipher</div>
            <div class="text-xs text-zinc-500">Production • Mix & Master</div>
          </div>
          <span class="text-xs font-mono text-zinc-400">2026</span>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'single-drop-landing',
    name: 'Single Release / Tour Drop',
    category: 'Landing Page',
    icon: 'Flame',
    description: 'High conversion pre-save landing page with interactive countdown timer, preview snippet, and direct streaming links.',
    tags: ['Pre-Save', 'Drop', 'Countdown', 'Spotify'],
    default_files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Single Drop — Pre-Save Now</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl">
    <div class="aspect-square bg-gradient-to-tr from-rose-900 to-amber-600 rounded-xl flex items-center justify-center text-xl font-black">
      NEW SINGLE
    </div>
    <div>
      <h1 class="text-2xl font-black uppercase tracking-tight">OUT EVERYWHERE</h1>
      <p class="text-xs text-zinc-400 mt-1">Pre-save on your favorite platform for instant library sync.</p>
    </div>
    <div class="space-y-2.5">
      <a href="#" class="block w-full py-3 bg-[#1DB954] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition">
        Pre-Save on Spotify
      </a>
      <a href="#" class="block w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition">
        Apple Music
      </a>
      <a href="#" class="block w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition">
        YouTube Music
      </a>
    </div>
  </div>
</body>
</html>`,
      },
    ],
  },
];

export function generateProjectId(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let rand = '';
  for (let i = 0; i < 10; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `site_01k${rand}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
