import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

const topScorers = [
  {
    rank: 1,
    player: 'Robert Lewandowski',
    team: 'Barcelona',
    teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
    country: 'POL',
    goals: 7,
    matches: 6,
    minutes: 487,
    penalties: 1,
    trend: 'up'
  },
  {
    rank: 2,
    player: 'Viktor Gyokeres',
    team: 'Sporting CP',
    teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png',
    country: 'SWE',
    goals: 5,
    matches: 6,
    minutes: 540,
    penalties: 2,
    trend: 'same'
  },
  {
    rank: 3,
    player: 'Raphinha',
    team: 'Barcelona',
    teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png',
    country: 'BRA',
    goals: 4,
    matches: 6,
    minutes: 456,
    penalties: 0,
    trend: 'up'
  },
  {
    rank: 4,
    player: 'Harry Kane',
    team: 'Bayern Munich',
    teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50037.png',
    country: 'ENG',
    goals: 4,
    matches: 6,
    minutes: 523,
    penalties: 1,
    trend: 'down'
  },
  {
    rank: 5,
    player: 'Serhou Guirassy',
    team: 'Borussia Dortmund',
    teamLogo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52758.png',
    country: 'GUI',
    goals: 4,
    matches: 5,
    minutes: 398,
    penalties: 0,
    trend: 'up'
  }
];

const getTrendIcon = (trend) => {
  if (trend === 'up') {
    return <TrendingUp size={14} className="text-[#1DBF73]" />;
  }
  if (trend === 'down') {
    return <TrendingUp size={14} className="text-[#F05252] rotate-180" />;
  }
  return <div className="w-3.5 h-3.5 bg-slate-200 rounded-full" />;
};

const TopScorers = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Target className="text-[#0055FF]" size={24} />
        <h2 className="text-2xl font-bold text-slate-900">Top Scorers</h2>
        <div className="flex-1" />
        <button className="text-[#0055FF] hover:text-[#8454FF] text-sm font-medium transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {topScorers.map((scorer) => (
          <div key={scorer.rank} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:shadow-sm transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900 w-8 text-center">
                  {scorer.rank}
                </span>
                {getTrendIcon(scorer.trend)}
              </div>

              <img
                src={scorer.teamLogo}
                alt={scorer.team}
                className="w-8 h-8 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              <div>
                <div className="font-bold text-slate-900">
                  {scorer.player}
                </div>
                <div className="text-slate-400 text-sm flex items-center space-x-2">
                  <span>{scorer.country}</span>
                  <span>-</span>
                  <span>{scorer.team}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#0055FF]">{scorer.goals}</div>
              <div className="text-slate-400 text-sm">
                {scorer.matches} matches - {Math.round(scorer.minutes / scorer.matches)}' avg
              </div>
              {scorer.penalties > 0 && (
                <div className="text-slate-400 text-xs">
                  {scorer.penalties} penalties
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-xl font-bold text-slate-900">312</div>
            <div className="text-slate-400">Total Goals</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">2.89</div>
            <div className="text-slate-400">Goals/Match</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">67%</div>
            <div className="text-slate-400">From Play</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopScorers;
