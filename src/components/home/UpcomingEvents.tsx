import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Ticket, CalendarDays } from 'lucide-react';
import { EventItem } from '../../types';

interface UpcomingEventsProps {
  events: EventItem[];
  onOpenBooking: () => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onOpenBooking }) => {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingEvents = events.filter((e) => !e.is_past);
  const pastEvents = events.filter((e) => e.is_past);
  const displayedEvents = filter === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <section className="py-24 bg-[#09090c] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500 font-bold mb-2">
              Tour Dates & Live Shows
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
              Live Events
            </h2>
          </div>

          {/* Clean Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-lg">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                filter === 'past'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Past Shows ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Dynamic Events List or Empty State */}
        {displayedEvents.length === 0 ? (
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <p className="font-display font-bold text-lg text-white uppercase">
              No {filter} events scheduled
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {filter === 'upcoming'
                ? 'Tour dates and special appearances will be announced here. For booking inquiries, submit a performance request.'
                : 'No past tour dates recorded in the official archive yet.'}
            </p>
            {filter === 'upcoming' && (
              <div className="pt-2">
                <button
                  onClick={onOpenBooking}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs uppercase tracking-widest font-semibold text-rose-400 hover:text-rose-300 rounded-sm cursor-pointer"
                >
                  Book Prantik Sarkar for an Event
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedEvents.map((evt) => {
              const eventDate = new Date(evt.date);
              const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const day = eventDate.toLocaleDateString('en-US', { day: '2-digit' });
              const fullFormatted = eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={evt.id}
                  className="bg-[#0c0c10] border border-white/10 hover:border-white/20 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors"
                >
                  {/* Date Block */}
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded bg-zinc-900 border border-white/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-rose-500 font-mono tracking-widest">{month}</span>
                      <span className="text-2xl font-display font-extrabold text-white leading-none mt-0.5">{day}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{evt.time}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{fullFormatted}</span>
                      </div>

                      <h3 className="font-display font-bold text-xl text-white tracking-tight uppercase">
                        {evt.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{evt.venue}, {evt.city}, {evt.country}</span>
                      </div>

                      {evt.description && (
                        <p className="text-xs text-zinc-400 pt-1 font-light max-w-xl">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions / Ticket Link */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                    {evt.ticket_url && !evt.is_past ? (
                      <a
                        href={evt.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Get Tickets</span>
                      </a>
                    ) : (
                      <span className="px-4 py-2 bg-zinc-900 border border-white/5 text-zinc-500 text-xs font-medium uppercase tracking-wider rounded">
                        {evt.is_past ? 'Completed' : evt.ticket_status || 'Details TBA'}
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
