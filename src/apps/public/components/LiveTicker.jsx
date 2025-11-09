import React, { useState, useEffect } from 'react';
import { Clock, Zap, Target, Users, AlertCircle, X, Maximize2 } from 'lucide-react';

const tickerPalette = {
  goal: { icon: Target, accent: 'var(--color-green)' },
  yellow: { icon: AlertCircle, accent: '#FACC15' },
  red: { icon: AlertCircle, accent: 'var(--color-red)' },
  substitution: { icon: Users, accent: 'var(--color-blue)' }
};

const mockEvents = [
  { time: "67'", type: 'goal', team: 'Liverpool', player: 'Salah', match: 'LIV 2 - 1 LIL' },
  { time: "45'+1", type: 'yellow', team: 'Barcelona', player: 'Pedri', match: 'BAR 1 - 0 ATA' },
  { time: "23'", type: 'substitution', team: 'Bayern', player: 'Muller -> Kane', match: 'BAY 0 - 0 SLO' }
];

const LiveTicker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveEvents, setLiveEvents] = useState(mockEvents);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const eventTimer = setInterval(() => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setLiveEvents(prev => [randomEvent, ...prev.slice(0, 4)]);
    }, 9000);

    return () => {
      clearInterval(timer);
      clearInterval(eventTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isMinimized ? 'w-72 h-16' : 'w-80'}`}>
      <div className="live-ticker relative overflow-hidden">
        <div className="relative px-4 py-3 border-b border-[var(--color-border-soft)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-muted)]">
            <span className="live-dot" />
            Live Ticker
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-muted)]">
            {currentTime.toLocaleTimeString('en-GB')}
            <button onClick={() => setIsMinimized(v => !v)} className="h-8 w-8 rounded-full border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text-main)]" aria-label="Toggle ticker size">
              <Maximize2 size={14} />
            </button>
            <button onClick={() => setIsVisible(false)} className="h-8 w-8 rounded-full border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text-main)]" aria-label="Close ticker">
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="max-h-64 overflow-y-auto">
            {liveEvents.length ? (
              <div className="divide-y divide-[var(--color-border-soft)]">
                {liveEvents.map((event, index) => {
                  const palette = tickerPalette[event.type] || tickerPalette.goal;
                  const Icon = palette.icon || Zap;
                  return (
                    <div key={`${event.match}-${index}`} className="flex items-center gap-3 px-4 py-3 group hover:bg-[var(--color-bg-soft)] transition-colors">
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--color-border-soft)]" style={{ color: palette.accent }}>
                        <Icon size={16} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--color-text-main)]">
                          {event.time} - {event.match}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">{event.player} ({event.team})</p>
                      </div>
                      <span className="text-xs text-[var(--color-muted)]">{currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-[var(--color-muted)]">
                <Clock size={32} className="mx-auto mb-2 opacity-60" />
                <p className="text-sm">No live events at the moment</p>
                <p className="text-xs mt-1">Check back during match times</p>
              </div>
            )}
          </div>
        )}

        {!isMinimized && (
          <div className="px-4 py-3 border-t border-[var(--color-border-soft)] text-center">
            <button className="text-xs uppercase tracking-[0.4em] text-[var(--color-blue)] hover:text-[var(--color-navy)] transition-colors">
              View All Live Matches +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTicker;
