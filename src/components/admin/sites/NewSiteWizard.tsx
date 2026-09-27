import React, { useState } from 'react';
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  FileCode,
  FileArchive,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  GitBranch,
  Laptop,
  FolderOpen,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import { SiteCategory, SiteEnvironment, SiteSourceType, ProjectTemplate } from '../../../types';
import { db } from '../../../services/db';
import { SYSTEM_TEMPLATES, generateProjectId, slugify } from '../../../services/siteTemplates';

interface NewSiteWizardProps {
  onCancel: () => void;
  onSuccess: (siteId: string) => void;
}

export const NewSiteWizard: React.FC<NewSiteWizardProps> = ({ onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Project Information
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [projectId] = useState(() => generateProjectId());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SiteCategory>('Artist');
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC (GMT+0)');
  const [currency, setCurrency] = useState('USD ($)');
  const [environment, setEnvironment] = useState<SiteEnvironment>('Production');

  // Step 2: Source Selection
  const [sourceType, setSourceType] = useState<SiteSourceType>('blank');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('artist-official-site');

  // ZIP Import State
  const [zipFiles, setZipFiles] = useState<{ path: string; content: string }[]>([]);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [isUnpackingZip, setIsUnpackingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // HTML Import State
  const [htmlContent, setHtmlContent] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Imported Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white p-8 font-sans">
  <h1 class="text-3xl font-bold">Hello World</h1>
  <p class="text-zinc-400 mt-2">Imported single-page HTML application.</p>
</body>
</html>`);
  const [cssContent, setCssContent] = useState<string>('');
  const [jsContent, setJsContent] = useState<string>('');

  // Git Repo Import State
  const [gitRepoUrl, setGitRepoUrl] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setZipError('Please upload a valid .zip compressed archive.');
      return;
    }

    setIsUnpackingZip(true);
    setZipError(null);
    setZipFileName(file.name);

    try {
      const extracted = await db.parseUploadedZip(file);
      if (extracted.length === 0) {
        setZipError('The ZIP archive is empty or contains only unsupported hidden directories.');
        setZipFiles([]);
      } else {
        setZipFiles(extracted);
        if (!name) {
          const autoName = file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' ');
          setName(autoName);
          setSlug(slugify(autoName));
        }
      }
    } catch (err: any) {
      setZipError(err?.message || 'Failed to unpack ZIP file. Please ensure it is a standard zip archive.');
    } finally {
      setIsUnpackingZip(false);
    }
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setHtmlContent(text);
        if (!name) {
          const autoName = file.name.replace(/\.html?$/i, '');
          setName(autoName);
          setSlug(slugify(autoName));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Site Name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Site Slug is required.');
      return;
    }

    // Reserved slug protection
    const reserved = ['admin', 'api', 'dashboard', 'preview', 'auth', 'login', 'signup', 'root'];
    if (reserved.includes(slug.toLowerCase())) {
      setErrorMsg(`The slug "${slug}" is a protected system route. Please choose a different slug.`);
      return;
    }

    setErrorMsg(null);
    setCurrentStep(2);
  };

  const handleCreateSite = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let createdSite;

      if (sourceType === 'blank') {
        const blankTemplate = SYSTEM_TEMPLATES.find((t) => t.id === 'blank-nextjs');
        createdSite = db.createSite(
          {
            id: projectId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            category,
            language,
            timezone,
            currency,
            environment,
            source_type: 'blank',
          },
          blankTemplate?.default_files
        );
      } else if (sourceType === 'template') {
        const template = SYSTEM_TEMPLATES.find((t) => t.id === selectedTemplateId) || SYSTEM_TEMPLATES[0];
        createdSite = db.createSite(
          {
            id: projectId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || template.description,
            category,
            language,
            timezone,
            currency,
            environment,
            source_type: 'template',
            template_id: template.id,
          },
          template.default_files
        );
      } else if (sourceType === 'zip_import') {
        if (zipFiles.length === 0) {
          throw new Error('Please upload a ZIP archive first.');
        }
        createdSite = db.createSite(
          {
            id: projectId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || `Imported project from ${zipFileName}`,
            category,
            language,
            timezone,
            currency,
            environment,
            source_type: 'zip_import',
          },
          zipFiles
        );
      } else if (sourceType === 'html_import') {
        if (!htmlContent.trim()) {
          throw new Error('HTML content cannot be empty.');
        }
        const files = [{ path: 'index.html', content: htmlContent }];
        if (cssContent.trim()) files.push({ path: 'styles.css', content: cssContent });
        if (jsContent.trim()) files.push({ path: 'main.js', content: jsContent });

        createdSite = db.createSite(
          {
            id: projectId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || 'Imported HTML/CSS/JS application',
            category,
            language,
            timezone,
            currency,
            environment,
            source_type: 'html_import',
          },
          files
        );
      } else if (sourceType === 'git_repo') {
        // Scaffold based on Git Repo stub
        const gitFiles = [
          {
            path: 'README.md',
            content: `# ${name}\nCloned from repository: ${gitRepoUrl}\nEnvironment: ${environment}`,
          },
          {
            path: 'package.json',
            content: JSON.stringify(
              {
                name: slug,
                version: '1.0.0',
                repository: gitRepoUrl,
                scripts: { dev: 'next dev', build: 'next build' },
              },
              null,
              2
            ),
          },
          {
            path: 'index.html',
            content: `<!DOCTYPE html><html><head><title>${name}</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-black text-white p-8 font-sans"><h1 class="text-3xl font-bold">${name}</h1><p class="text-zinc-400 mt-2">Repository: ${gitRepoUrl}</p></body></html>`,
          },
        ];

        createdSite = db.createSite(
          {
            id: projectId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || `Linked to repository ${gitRepoUrl}`,
            category,
            language,
            timezone,
            currency,
            environment,
            source_type: 'git_repo',
          },
          gitFiles
        );
      }

      if (createdSite) {
        onSuccess(createdSite.id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create site project. Please check inputs.');
      setIsSubmitting(false);
    }
  };

  const categories: SiteCategory[] = [
    'Artist',
    'Music',
    'Record Label',
    'Portfolio',
    'Business',
    'Blog',
    'Landing Page',
    'E-Commerce',
    'Custom',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-950/80 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-rose-500" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white">
              New Site Wizard
            </h2>
            <span className="text-[11px] font-mono text-zinc-400">
              Step {currentStep} of 2
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {currentStep === 1
              ? 'Configure project metadata, naming, slug, and environment targeting.'
              : 'Choose the source architecture: Blank Next.js, ZIP archive, HTML upload, or System Templates.'}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-xl flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Project Information */}
      {currentStep === 1 && (
        <form
          onSubmit={handleNextStep}
          className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl"
        >
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Step 1: Project Information
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Specify canonical naming and operational configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Site Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Site Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PRANTIK MUSIC, Crimson Tour 2026, Sound Records"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            {/* Site Slug */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Site Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl bg-zinc-900 border border-white/10 overflow-hidden focus-within:border-rose-500">
                <span className="px-3 py-2.5 bg-zinc-950 text-zinc-500 text-xs font-mono select-none">
                  /
                </span>
                <input
                  type="text"
                  placeholder="prantik-music"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-transparent text-xs text-rose-300 font-mono focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                Project URL: https://{slug || 'your-slug'}.prantiksarkar.studio
              </p>
            </div>

            {/* Project ID (Server-Generated) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Project ID (Server-Assigned)
              </label>
              <input
                type="text"
                value={projectId}
                readOnly
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/5 rounded-xl text-xs text-zinc-400 font-mono select-all cursor-not-allowed"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SiteCategory)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                placeholder="High-level description of this artist site, portal, label hub, or release showcase."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition resize-none"
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Environment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Production', 'Staging', 'Development'] as SiteEnvironment[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition ${
                      environment === env
                        ? 'bg-rose-950 border-rose-500 text-white shadow-md'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Timezone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                  <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                  <option value="French (Français)">French (Français)</option>
                  <option value="German (Deutsch)">German (Deutsch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="CAD ($)">CAD ($)</option>
                  <option value="AUD ($)">AUD ($)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-lg shadow-rose-950 transition cursor-pointer"
            >
              Next: Choose Source
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Source Selector */}
      {currentStep === 2 && (
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-rose-500" />
                Step 2: Source Architecture & Template
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generate clean code, unpack a ZIP project, or start from an official industry template.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/30">
              {name} ({slug})
            </span>
          </div>

          {/* Source Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setSourceType('blank')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                sourceType === 'blank'
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              <FileCode className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs font-bold text-white">Create Blank</div>
                <div className="text-[10px] text-zinc-500">Next.js + Tailwind</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('template')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                sourceType === 'template'
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              <Layers className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Templates</div>
                <div className="text-[10px] text-zinc-500">Artist, Label, Drops</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('zip_import')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                sourceType === 'zip_import'
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              <FileArchive className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Upload ZIP</div>
                <div className="text-[10px] text-zinc-500">Extract & Parse</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('html_import')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                sourceType === 'html_import'
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              <Laptop className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs font-bold text-white">HTML Upload</div>
                <div className="text-[10px] text-zinc-500">Static Pages</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('git_repo')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                sourceType === 'git_repo'
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              <GitBranch className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Git Repository</div>
                <div className="text-[10px] text-zinc-500">Clone URL</div>
              </div>
            </button>
          </div>

          {/* TAB 1: BLANK GENERATOR */}
          {sourceType === 'blank' && (
            <div className="space-y-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase text-white tracking-wide">
                    Clean Next.js 15 & TypeScript Scaffold
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Generates clean production files without mock data. Legitimate empty states only.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                  Ready to Build
                </span>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div className="text-zinc-500">// Generated file tree:</div>
                <div>📁 src/app/ (layout.tsx, page.tsx, globals.css)</div>
                <div>📄 package.json, tsconfig.json, next.config.js</div>
                <div>📄 tailwind.config.js, postcss.config.js</div>
                <div>📄 README.md</div>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES SELECTION */}
          {sourceType === 'template' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-zinc-300 tracking-wide">
                Select an Official Production Template
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYSTEM_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-rose-950/30 border-rose-500 shadow-lg'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{tmpl.name}</span>
                        {tmpl.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50">
                            {tmpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-3 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {tmpl.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-white/5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ZIP IMPORT */}
          {sourceType === 'zip_import' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/10 hover:border-rose-500/50 rounded-2xl p-8 text-center transition bg-zinc-900/30">
                <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Upload .ZIP Project Archive
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mb-4">
                  Drag and drop a .zip file containing your site source code, assets, or static build bundle.
                </p>

                <input
                  type="file"
                  accept=".zip,application/zip"
                  id="zip-upload-input"
                  onChange={handleZipUpload}
                  className="hidden"
                />
                <label
                  htmlFor="zip-upload-input"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition shadow"
                >
                  {isUnpackingZip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Unpacking Archive...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                      Select .ZIP Archive
                    </>
                  )}
                </label>
              </div>

              {zipError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/40 rounded-xl text-xs text-rose-300">
                  {zipError}
                </div>
              )}

              {zipFiles.length > 0 && (
                <div className="p-4 bg-zinc-900/80 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Extracted {zipFiles.length} files from {zipFileName}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {(zipFiles.reduce((acc, f) => acc + new Blob([f.content]).size, 0) / 1024).toFixed(1)} KB Total
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 divide-y divide-zinc-800/60 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    {zipFiles.slice(0, 15).map((f) => (
                      <div key={f.path} className="py-0.5 truncate">
                        📄 {f.path}
                      </div>
                    ))}
                    {zipFiles.length > 15 && (
                      <div className="py-0.5 text-zinc-500 italic">
                        + {zipFiles.length - 15} more files...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HTML IMPORT */}
          {sourceType === 'html_import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-zinc-300 tracking-wide">
                  HTML / CSS / JS Source
                </h4>
                <div>
                  <input
                    type="file"
                    accept=".html,.htm"
                    id="html-upload-input"
                    onChange={handleHtmlFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="html-upload-input"
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-semibold text-zinc-300 rounded-lg cursor-pointer transition inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    Load HTML File
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  index.html
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-zinc-950 border border-white/10 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    styles.css (Optional)
                  </label>
                  <textarea
                    value={cssContent}
                    placeholder="/* Custom CSS */"
                    onChange={(e) => setCssContent(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    main.js (Optional)
                  </label>
                  <textarea
                    value={jsContent}
                    placeholder="// Custom Javascript"
                    onChange={(e) => setJsContent(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GIT REPO */}
          {sourceType === 'git_repo' && (
            <div className="space-y-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <h4 className="text-xs font-bold uppercase text-zinc-300 tracking-wide">
                Import from Git Repository
              </h4>
              <p className="text-[11px] text-zinc-400">
                Provide the HTTPS clone URL of a public repository (GitHub, GitLab, Bitbucket).
              </p>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project-repo.git"
                  value={gitRepoUrl}
                  onChange={(e) => setGitRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Wizard Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              disabled={isSubmitting || (sourceType === 'zip_import' && zipFiles.length === 0)}
              onClick={handleCreateSite}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-lg shadow-rose-950 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Project...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create & Launch Site
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
