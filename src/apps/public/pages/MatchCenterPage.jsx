import React, { useState, useEffect } from 'react';
import { Clock, Activity, Users, Shield } from 'lucide-react';

const HOME_TEAM_NAME = 'Đội nhà';
const AWAY_TEAM_NAME = 'Đội khách';

const timeline = [
  { minute: 23, team: 'home', type: 'goal', player: 'Haaland' },
  { minute: 45, team: 'away', type: 'goal', player: 'Vinicius' },
  { minute: 67, team: 'home', type: 'goal', player: 'De Bruyne' }
];

const stats = [
  { label: 'Kiểm soát bóng', home: 58, away: 42 },
  { label: 'Sút trúng đích', home: 7, away: 4 },
  { label: 'Tỉ lệ chuyền chính xác', home: 88, away: 81 }
];

const MatchCenterPage = () => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [scores, setScores] = useState({ home: 2, away: 1 });

  useEffect(() => {
    const timer = setInterval(() => {
      setScores(prev => ({ ...prev, home: prev.home + 1 }));
    }, 120000);
    return () => clearInterval(timer);
  }, []);

  const renderStatBar = (homeValue, awayValue) => {
    const total = homeValue + awayValue;
    const homePercent = total ? (homeValue / total) * 100 : 0;

    return (
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#0055FF] to-[#00E5FF]" style={{ width: `${homePercent}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-10 py-6">
      <section className="glass-card p-8 space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Trung tâm trận đấu</p>
            <h1 className="text-4xl font-display text-slate-900">{HOME_TEAM_NAME} gặp {AWAY_TEAM_NAME}</h1>
            <p className="text-slate-500">Sân Etihad - Vòng 6</p>
          </div>
          <div className="flex items-center gap-6 text-4xl font-display text-slate-900">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Chủ nhà</p>
              <p className="score-flip score-flip-enter">{scores.home}</p>
            </div>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055FF] to-[#00E5FF]">:</p>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Đội khách</p>
              <p className="score-flip score-flip-enter">{scores.away}</p>
            </div>
          </div>
          <div className="status-pill">
            <span className="live-dot" />
            Trực tiếp 67'
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {(
            [
              { key: 'timeline', label: 'Diễn biến' },
              { key: 'lineups', label: 'Đội hình' },
              { key: 'stats', label: 'Thống kê' }
            ]
          ).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`date-chip ${activeTab === tab.key ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'timeline' && (
        <section className="glass-card p-8">
          <div className="space-y-6">
            {timeline.map(event => (
              <div key={event.minute} className="flex items-center gap-4">
                <div className="w-16 text-right text-slate-400 text-sm">{event.minute}'</div>
                <div className="flex-1 h-px bg-slate-100" />
                <div className={`rounded-3xl px-4 py-2 border ${event.team === 'home' ? 'border-[#0055FF]/30 bg-[#0055FF]/5' : 'border-slate-200 bg-white'}`}>
                  <p className="text-slate-900 font-semibold">{event.player}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{event.team === 'home' ? HOME_TEAM_NAME : AWAY_TEAM_NAME}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'stats' && (
        <section className="glass-card p-8 space-y-4">
          {stats.map(stat => (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{stat.label}</span>
                <span>{stat.home} - {stat.away}</span>
              </div>
              {renderStatBar(stat.home, stat.away)}
            </div>
          ))}
        </section>
      )}

      {activeTab === 'lineups' && (
        <section className="grid md:grid-cols-2 gap-6">
          {[HOME_TEAM_NAME, AWAY_TEAM_NAME].map((team, idx) => (
            <div key={team} className="glass-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Shield size={16} /> {team}
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{idx === 0 ? '4-3-3' : '4-4-2'}</p>
              <div className="grid grid-cols-2 gap-3 text-slate-600">
                {(idx === 0
                  ? ['Ederson', 'Walker', 'Dias', 'Stones', 'Akanji', 'Rodri', 'Silva', 'De Bruyne', 'Foden', 'Alvarez', 'Haaland']
                  : ['Courtois', 'Carvajal', 'Rudiger', 'Nacho', 'Mendy', 'Valverde', 'Modric', 'Bellingham', 'Kroos', 'Rodrygo', 'Vinicius']
                ).map(player => (
                  <div key={player} className="rounded-2xl border border-slate-100 px-3 py-2 text-sm bg-white">{player}</div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="glass-card p-8 grid md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-100 p-6 text-center bg-slate-50/70">
          <Clock className="mx-auto mb-3 text-[#0055FF]" />
          <p className="text-2xl font-semibold text-slate-900">67'</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Thời gian</p>
        </div>
        <div className="rounded-3xl border border-slate-100 p-6 text-center bg-slate-50/70">
          <Activity className="mx-auto mb-3 text-[#00E5FF]" />
          <p className="text-2xl font-semibold text-slate-900">17</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tổng cú sút</p>
        </div>
        <div className="rounded-3xl border border-slate-100 p-6 text-center bg-slate-50/70">
          <Users className="mx-auto mb-3 text-[#8454FF]" />
          <p className="text-2xl font-semibold text-slate-900">55,321</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Khán giả</p>
        </div>
      </section>
    </div>
  );
};

export default MatchCenterPage;
