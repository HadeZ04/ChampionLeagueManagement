import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const MatchCard = ({ match }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="status-pill text-[#F05252]">Trực tiếp</span>;
      case 'finished':
        return <span className="status-pill text-slate-500">Hết giờ</span>;
      default:
        return <span className="status-pill text-[#0055FF]">Sắp diễn ra</span>;
    }
  };

  const formatTime = (time) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-[#0055FF] via-[#00E5FF] to-[#8454FF]" />
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(match.date).toLocaleDateString('vi-VN')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatTime(match.time)}
          </span>
        </div>
        {getStatusBadge(match.status)}
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={match.homeTeam.logo}
            alt={match.homeTeam.name}
            className="h-10 w-10 object-contain"
          />
          <div>
            <p className="text-slate-900 font-semibold">{match.homeTeam.name}</p>
            <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">{match.homeTeam.shortName}</p>
          </div>
        </div>
        <div className="text-center min-w-[120px] score-flip">
          {match.status === 'finished' && match.score ? (
            <p className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0055FF] to-[#00E5FF]">
              {match.score.home} - {match.score.away}
            </p>
          ) : (
            <p className="text-xl font-semibold text-slate-900">{formatTime(match.time)}</p>
          )}
          <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">{match.status === 'live' ? 'Trực tiếp' : 'Giờ bóng lăn'}</p>
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right">
            <p className="text-slate-900 font-semibold">{match.awayTeam.name}</p>
            <p className="text-xs text-slate-400 uppercase tracking-[0.3em]">{match.awayTeam.shortName}</p>
          </div>
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="h-10 w-10 object-contain" />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {match.venue}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {match.city}
          </span>
        </div>
        <button className="text-[#0055FF] text-xs uppercase tracking-[0.4em]">Chi tiết</button>
      </div>
    </article>
  );
};

export default MatchCard;
