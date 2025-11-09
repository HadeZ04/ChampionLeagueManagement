import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, AlertCircle } from 'lucide-react';

const StandingsTable = ({ standings = [], selectedGroup = 'all' }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredStandings = selectedGroup === 'all' ? standings : standings.filter(team => team.status === selectedGroup);

  const getStatusZone = (position) => {
    if (position <= 8) return 'qualified';
    if (position <= 24) return 'playoff';
    return 'eliminated';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp size={14} className="text-emerald-500" />;
    if (change < 0) return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'qualified':
        return 'bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500';
      case 'playoff':
        return 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500';
      case 'eliminated':
        return 'bg-gradient-to-r from-rose-500/10 to-transparent border-l-4 border-rose-500';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  const getStatusBadge = (position) => {
    if (position <= 8) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
          <Award size={12} />
          <span>Direct</span>
        </div>
      );
    }
    if (position <= 24) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
          <AlertCircle size={12} />
          <span>Playoff</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 bg-white backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-semibold">League Phase</p>
            <p className="text-xl font-bold text-white mt-1">Standings Overview</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Last Updated</p>
            <p className="text-sm font-semibold text-white">{new Date().toLocaleTimeString('en-GB')}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-600">Direct Qualification (1-8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-slate-600">Playoff Round (9-24)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-slate-600">Eliminated (25-36)</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                { key: '#', label: '#', width: 'w-20' },
                { key: 'team', label: 'Team', width: 'min-w-[280px]' },
                { key: 'p', label: 'P', width: 'w-14' },
                { key: 'w', label: 'W', width: 'w-14' },
                { key: 'd', label: 'D', width: 'w-14' },
                { key: 'l', label: 'L', width: 'w-14' },
                { key: 'gf', label: 'GF', width: 'w-14' },
                { key: 'ga', label: 'GA', width: 'w-14' },
                { key: 'gd', label: 'GD', width: 'w-16' },
                { key: 'pts', label: 'Pts', width: 'w-16' },
                { key: 'form', label: 'Form', width: 'w-44' }
              ].map(col => (
                <th 
                  key={col.key} 
                  className={`${col.width} py-4 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStandings.length ? filteredStandings.map((team, index) => {
              const status = team.status || getStatusZone(team.position);
              const isSelected = selectedTeam === team.position;
              const isHovered = hoveredRow === team.position;
              
              return (
                <tr
                  key={team.position}
                  className={`
                    transition-all duration-300 cursor-pointer
                    ${getStatusColor(status)}
                    ${isSelected ? 'bg-blue-50 shadow-lg scale-[1.02]' : 'hover:bg-slate-50'}
                    ${isHovered ? 'shadow-md' : ''}
                  `}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                  }}
                  onClick={() => setSelectedTeam(isSelected ? null : team.position)}
                  onMouseEnter={() => setHoveredRow(team.position)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Position */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm
                        transition-all duration-300
                        ${team.position <= 8 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                          : team.position <= 24 
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-slate-200 text-slate-600'
                        }
                        ${isHovered ? 'scale-110 rotate-3' : ''}
                      `}>
                        {team.position}
                      </div>
                      <div className="transition-transform duration-300" style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>
                        {getChangeIcon(team.change)}
                      </div>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 min-w-[280px]">
                      <div className="relative group flex-shrink-0">
                        <img 
                          src={team.logo} 
                          alt={team.team} 
                          className="h-10 w-10 object-contain rounded-full border-2 border-slate-200 bg-white p-1 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400 group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 transition-colors duration-300 hover:text-blue-600 whitespace-nowrap">
                            {team.team}
                          </p>
                          <p className="text-xs text-slate-500 whitespace-nowrap">{team.country}</p>
                        </div>
                        {getStatusBadge(team.position)}
                      </div>
                    </div>
                  </td>

                  {/* Stats */}
                  {[
                    team.played,
                    team.won,
                    team.drawn,
                    team.lost,
                    team.goalsFor,
                    team.goalsAgainst
                  ].map((stat, idx) => (
                    <td key={idx} className="py-4 px-4 text-center text-slate-700 font-medium">
                      <span className="inline-block transition-transform duration-300 hover:scale-125">
                        {stat}
                      </span>
                    </td>
                  ))}

                  {/* Goal Difference */}
                  <td className="py-4 px-4 text-center">
                    <span className={`
                      inline-flex items-center justify-center px-2 py-1 rounded-lg font-bold text-sm
                      transition-all duration-300
                      ${team.goalDifference > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : team.goalDifference < 0 
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                      }
                      ${isHovered ? 'scale-110' : ''}
                    `}>
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3">
                      {team.points}
                    </span>
                  </td>

                  {/* Form */}
                  <td className="py-4 px-4">
                    <div className="flex gap-1.5">
                      {(team.form || []).slice(-5).map((result, idx) => (
                        <div
                          key={idx}
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                            transition-all duration-300 hover:scale-125 hover:-translate-y-1
                            ${result === 'W' 
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                              : result === 'D' 
                              ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-400/30'
                              : 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30'
                            }
                          `}
                          style={{
                            animation: `scaleIn 0.3s ease-out ${idx * 0.1}s both`
                          }}
                          title={`Match ${idx + 1}: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={11} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <AlertCircle size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No standings available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default StandingsTable;
