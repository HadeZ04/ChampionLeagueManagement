import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import WeatherWidget from '../components/WeatherWidget';
import MatchPreview from '../components/MatchPreview';

const FAKE_SCHEDULE_FROM_DB = [
  {
    id: 1,
    date: '2025-09-17',
    time: '21:00',
    status: 'upcoming',
    homeTeam: { name: 'Liverpool', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png', shortName: 'LIV' },
    awayTeam: { name: 'Barcelona', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png', shortName: 'BAR' },
    matchday: 1,
    venue: 'Anfield',
    city: 'Liverpool',
    tvChannels: ['BT Sport 1']
  },
  {
    id: 2,
    date: '2025-09-17',
    time: '21:00',
    status: 'upcoming',
    homeTeam: { name: 'Arsenal', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png', shortName: 'ARS' },
    awayTeam: { name: 'Newcastle', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52281.png', shortName: 'NEW' },
    matchday: 1,
    venue: 'Emirates Stadium',
    city: 'London',
    tvChannels: ['CBS Sports']
  },
  {
    id: 3,
    date: '2025-09-18',
    time: '18:45',
    status: 'finished',
    homeTeam: { name: 'Juventus', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50139.png', shortName: 'JUV' },
    awayTeam: { name: 'Real Madrid', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50051.png', shortName: 'RMA' },
    matchday: 1,
    venue: 'Allianz Stadium',
    city: 'Turin',
    tvChannels: []
  }
];

const matchService = {
  getMatches: async () =>
    new Promise(resolve => setTimeout(() => resolve({ data: FAKE_SCHEDULE_FROM_DB }), 500))
};

const filters = [
  { id: 'all', name: 'All Matches' },
  { id: 'today', name: 'Today' },
  { id: 'live', name: 'Live' },
  { id: 'upcoming', name: 'Upcoming' },
  { id: 'finished', name: 'Finished' }
];

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2025-09-17');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    setIsLoading(true);
    matchService
      .getMatches()
      .then(response => setMatches(response.data))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMatches = matches.filter(match => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'today') return match.date === new Date().toISOString().split('T')[0];
    return match.status === selectedFilter;
  });

  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = match.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(match);
    return groups;
  }, {});

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  return (
    <div className="space-y-10 py-6">
      <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-100/40 relative overflow-hidden">
        <div className="absolute -right-12 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-[#0055FF]/15 to-[#8454FF]/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Fixtures</p>
            <h1 className="text-4xl font-display text-slate-900">Match Schedule</h1>
            <p className="text-slate-500 max-w-xl">
              Plan your Champions League nights with quick filters, hover micro-interactions, and live-ready match cards.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="uefa-input max-w-[170px] text-slate-700 border-slate-200 focus:ring-[#0055FF]"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`date-chip ${selectedFilter === filter.id ? 'active' : ''}`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="glass-card p-6 space-y-4">
              <div className="skeleton-bar w-1/3" />
              <div className="skeleton-bar w-2/3" />
              <div className="skeleton-bar w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {Object.entries(groupedMatches).length ? (
              Object.entries(groupedMatches).map(([date, dayMatches], idx) => (
                <div key={date} className="space-y-4" style={{ animation: `fadeUp 500ms ease ${idx * 80}ms both` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Matchday {dayMatches[0]?.matchday}</p>
                      <h3 className="text-xl font-semibold text-slate-900">{formatDate(date)}</h3>
                    </div>
                    <span className="text-slate-400 text-sm">{dayMatches.length} fixtures</span>
                  </div>
                  <div className="space-y-4">
                    {dayMatches.map((match, matchIdx) => (
                      <div style={{ animation: `fadeUp 480ms ease ${matchIdx * 60}ms both` }} key={match.id}>
                        <MatchCard match={match} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-10 text-center">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-700 text-lg">No matches found</p>
                <p className="text-slate-400">Adjust filters or choose another date.</p>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <WeatherWidget city="Liverpool" temperature={'8\u00B0C'} condition="Partly Cloudy" />
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tv size={20} className="text-[#0055FF]" /> Broadcast
              </h3>
              <div className="space-y-3">
                {matches
                  .filter(m => m.status === 'upcoming' && m.tvChannels)
                  .slice(0, 3)
                  .map(match => (
                    <div key={match.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
                      <p className="text-sm font-semibold text-slate-900">
                        {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                      </p>
                      <p className="text-xs text-slate-500">{match.time} - {match.tvChannels.join(', ')}</p>
                    </div>
                  ))}
              </div>
            </div>
            <MatchPreview />
          </aside>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-sm text-slate-500">
        <button className="flex items-center gap-2 text-[#0055FF] font-semibold">
          <ChevronLeft size={16} />
          Previous Matchday
        </button>
        <span>Matchday 1</span>
        <button className="flex items-center gap-2 text-[#0055FF] font-semibold">
          Next Matchday
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default MatchesPage;
