import React from 'react';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { PressArticle } from '../../types';

interface PressSectionProps {
  press: PressArticle[];
  onOpenPressArticle?: (article: PressArticle) => void;
}

export const PressSection: React.FC<PressSectionProps> = ({ press }) => {
  return (
    <section className="py-24 bg-[#070709] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
            Independent Media & Coverage
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
            Press & Media
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl">
            Verified journalistic features, critical reviews, and external editorial coverage.
          </p>
        </div>

        {press.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <Newspaper className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No press entries published yet
            </p>
            <p className="text-sm text-zinc-400">
              Official press features, interviews, and media reviews will appear here once authenticated and archived.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {press.map((item) => {
              const formattedDate = new Date(item.publication_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="bg-[#0c0c10] border border-white/10 hover:border-white/20 rounded-lg p-6 flex flex-col justify-between space-y-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px]">
                        {item.publication}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                      Coverage: {item.coverage_type}
                    </div>

                    <h3 className="font-display font-bold text-lg text-white tracking-tight uppercase leading-snug">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-3">
                        "{item.excerpt}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    {item.external_url && item.external_url !== '#' ? (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <span>Read Coverage</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-500 font-medium">
                        Archived Press File
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
