import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Trophy, Users, Activity, CalendarDays, Shield, Star } from 'lucide-react';
import StandingsTable from '../components/StandingsTable';
import UpcomingMatches from '../components/UpcomingMatches';
import TopScorers from '../components/TopScorers';
import NewsCard from '../components/NewsCard';
import uefaWordmark from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png';
import PlayersService from '../../../layers/application/services/PlayersService';
import MatchesService from '../../../layers/application/services/MatchesService';
import { toCompetitionStageLabel, toCountryLabel, toMatchStatusLabel, toPlayerPositionLabel } from '../../../shared/utils/vi';

const heroStats = [
  { label: 'CLB', value: '36', icon: Users, gradient: 'from-[#003B73] via-[#0074F0] to-[#E3F2FF]' },
  { label: 'Trận', value: '189', icon: CalendarDays, gradient: 'from-[#003B73] via-[#00C65A] to-[#FACC15]' },
  { label: 'Bàn thắng', value: '312', icon: Activity, gradient: 'from-[#00924A] via-[#00C65A] to-[#FF9F1C]' },
  { label: 'Quốc gia', value: '17', icon: Trophy, gradient: 'from-[#003B73] via-[#00C65A] to-[#FACC15]' }
];

const quickTiles = [
  {
    title: 'Lịch thi đấu',
    description: 'Lọc theo vòng đấu, ngày hoặc CLB với thẻ timeline trực quan.',
    to: '/matches',
    gradient: 'from-[#0A1F4A] via-[#1E3A8A] to-[#3B82F6]',
    icon: CalendarDays
  },
  {
    title: 'Bảng xếp hạng',
    description: 'Bảng điểm trực tiếp với khu vực giành vé, play-off và bị loại.',
    to: '/standings',
    gradient: 'from-[#0A1F4A] via-[#102B6A] to-[#0B7C9E]',
    icon: Trophy
  }
];

const featuredNews = [
  {
    id: 1,
    title: 'Liverpool giữ mạch toàn thắng sau chiến thắng trước Lille',
    summary: 'Anfield bùng nổ dưới ánh đèn khi Salah và Nunez mang về thêm một đêm Cúp C1 kinh điển.',
    category: 'matches',
    date: '2025-02-10',
    time: '21:45',
    image: '',
    featured: true,
    tags: ['Liverpool', 'Lille', 'Tường thuật trận']
  },
  {
    id: 2,
    title: 'Barcelona vượt qua Atalanta để chắc suất top 8',
    summary: 'Đội bóng của Flick thể hiện đẳng cấp để đảm bảo suất vào vòng 1/8.',
    category: 'matches',
    date: '2025-02-09',
    time: '20:30',
    image: '',
    featured: true,
    tags: ['Barcelona', 'Atalanta', 'Vòng 1/8']
  }
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [playerResults, setPlayerResults] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setPlayerResults([]);
      setMatchResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);
    const delay = setTimeout(async () => {
      try {
        const [playersResponse, matchesResponse] = await Promise.all([
          PlayersService.listPlayers({ search: searchTerm, limit: 5 }),
          MatchesService.getAllMatches({ search: searchTerm, limit: 5 })
        ]);

        setPlayerResults(playersResponse?.players || []);
        setMatchResults((matchesResponse?.matches || []).slice(0, 5));
        setSearchError(null);
      } catch (error) {
        console.error('Tìm kiếm thất bại', error);
        setPlayerResults([]);
        setMatchResults([]);
        setSearchError(error?.message || 'Không thể tìm kiếm. Vui lòng thử lại.');
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <div className="space-y-16 pb-6">
      {/* Hero */}
      <section className="mt-6 space-y-8">
        {/* Main Hero Block */}
        <article className="soccer-patterned p-8 md:p-12 lg:p-20 text-white relative rounded-[32px] min-h-[calc(100vh-200px)] flex items-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating particles */}
            <div className="absolute w-2 h-2 bg-cyan-400/30 rounded-full top-1/4 left-1/4 animate-float-slow"></div>
            <div className="absolute w-1 h-1 bg-blue-400/40 rounded-full top-1/3 right-1/3 animate-float-medium"></div>
            <div className="absolute w-3 h-3 bg-yellow-400/20 rounded-full bottom-1/4 left-1/3 animate-float-fast"></div>
            <div className="absolute w-1.5 h-1.5 bg-green-400/30 rounded-full top-2/3 right-1/4 animate-float-slow"></div>
            
            {/* Animated gradient orbs */}
            <div className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full -top-48 -left-48 animate-pulse-slow blur-xl"></div>
            <div className="absolute w-80 h-80 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-full -bottom-40 -right-40 animate-pulse-medium blur-xl"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" 
                 style={{
                   backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                   backgroundSize: '50px 50px'
                 }}>
            </div>
          </div>

          {/* Shooting stars */}
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          <div className="shooting-star"></div>
          
          <div className="relative w-full space-y-10 z-10">
            {/* Top Section */}
            <div className="space-y-8 max-w-5xl">
              <div className="flex items-center gap-4">
                <img
                  src={uefaWordmark}
                  alt="Logo chữ Cúp C1 châu Âu"
                  className="h-12 md:h-14 w-auto drop-shadow-2xl opacity-90"
                  loading="lazy"
                />
                <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-300/60 font-semibold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  Official digital experience
                </span>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.5em] text-cyan-300 font-bold flex items-center gap-2 animate-pulse">
                  <span className="w-8 h-[2px] bg-gradient-to-r from-cyan-300 via-blue-400 to-transparent animate-shimmer"></span>
                  European Nights
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
                </p>
                
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight relative">
                  {/* Revised Title with Brighter Colors and Two Lines */}
                  <span className="block mb-2">
                    <span
                      className="block text-2xl md:text-3xl lg:text-4xl font-medium text-white/90 uppercase tracking-[0.1em] mb-2"
                      style={{
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        letterSpacing: '0.15em'
                      }}
                    >
                      Union of European Football Associations
                    </span>
                  </span>

                  <span className="block">
                    <span
                      className="inline-block font-black pb-1 relative"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fbff 25%, #c2e7ff 50%, #7bc8ff 75%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'

                      }}
                    >
                      Cúp C1 châu Âu
                    </span>
                  </span>
                  
                </h1>

              </div>

              <div className="relative mt-4">
                <p className="text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed font-light backdrop-blur-sm bg-black/10 p-4 rounded-2xl border border-white/10">
                  Lịch thi đấu trực tiếp, video tổng hợp giàu cảm xúc và nguồn dữ liệu cao cấp mang bầu không khí
                  <span className="text-cyan-300 font-semibold"> Cúp C1 châu Âu </span>
                  tới mọi thiết bị.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to="/match-center" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full font-bold text-white text-sm uppercase tracking-wider overflow-hidden transition-all hover:scale-110 hover:shadow-[0_0_60px_rgba(0,217,255,0.8),0_0_100px_rgba(99,102,241,0.5)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Play size={20} className="group-hover:scale-125 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
                    <span className="relative drop-shadow-[0_2px_4px rgba(0,0,0,0.5)]">
                      Xem trực tiếp
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow" style={{ padding: '2px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor' }}></div>
                  </div>
                  
                  {/* Glowing corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/70 group-hover:border-white transition-colors"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/70 group-hover:border-white transition-colors"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                  </div>
                </Link>
                
                <Link
                  to="/standings"
                  className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-cyan-400/40 rounded-full font-bold text-white text-sm uppercase tracking-wider hover:bg-white/20 hover:border-cyan-300 transition-all hover:scale-110 overflow-hidden hover:shadow-[0_0_40px rgba(0,217,255,0.6)]"
                >
                  <span className="relative z-10 drop-shadow-[0_2px_4px rgba(0,0,0,0.5)]">Xem bảng xếp hạng</span>
                  
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Pulsing border effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-cyan-300/50 group-hover:animate-pulse"></div>
                  
                  {/* Glowing corners */}
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/0 group-hover:border-cyan-300 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/0 group-hover:border-cyan-300 transition-colors"></div>
                </Link>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {heroStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="relative group p-6 text-white hover:scale-110 transition-all duration-300 backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 hover:border-cyan-400/30 hover:bg-black/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
                    
                    <IconComponent size={28} className="mb-3 text-cyan-300 group-hover:scale-125 group-hover:text-cyan-200 transition-transform drop-shadow-[0_0_10px rgba(0,217,255,0.8)] relative z-10" />
                    <p className="text-4xl md:text-5xl font-black text-3d mb-1 relative z-10" style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #00d9ff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/80 font-bold relative z-10">{stat.label}</p>
                    
                    {/* Animated corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/50 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/50 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 pt-6">
              <div className="p-5 transition-all group hover:scale-105 backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 hover:border-green-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-green-500/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px rgba(74,222,128,0.6)]"></div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-green-300 font-bold drop-shadow-[0_2px_4px rgba(0,0,0,0.8)]">Đang diễn ra</span>
                </div>
                <p className="text-xl font-bold text-white mb-0.5 text-3d">3 trận</p>
                <p className="text-xs text-slate-300">Đang thi đấu</p>
                
                {/* Live pulse effect */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>

              <div className="p-5 transition-all group hover:scale-105 backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 hover:border-blue-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-blue-500/20">
                    <CalendarDays size={18} className="text-blue-400 drop-shadow-[0_0_10px rgba(59,130,246,0.8)]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold drop-shadow-[0_2px_4px rgba(0,0,0,0.8)]">Trận kế tiếp</span>
                </div>
                <p className="text-xl font-bold text-white mb-0.5 text-3d">Ngày mai 21:00</p>
                <p className="text-xs text-slate-300">Real Madrid gặp Man City</p>
              </div>

              <div className="p-5 transition-all group hover:scale-105 backdrop-blur-sm bg-black/10 rounded-2xl border border-white/10 hover:border-yellow-400/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform bg-yellow-500/20">
                    <Trophy size={18} className="text-yellow-400 drop-shadow-[0_0_10px rgba(251,191,36,0.8)]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-yellow-300 font-bold drop-shadow-[0_2px_4px rgba(0,0,0,0.8)]">Vua phá lưới</span>
                </div>
                <p className="text-xl font-bold text-white mb-0.5 text-3d-gold">Erling Haaland</p>
                <p className="text-xs text-slate-300">12 bàn mùa này</p>
                
                {/* Crown icon for top scorer */}
                <Star size={12} className="absolute top-4 right-4 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* Enhanced Scroll Indicator */}
            <div className="flex justify-center pt-8">
              <div className="flex flex-col items-center gap-2 animate-bounce opacity-60 hover:opacity-100 transition-opacity group cursor-pointer">
                <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70 font-semibold group-hover:text-cyan-300 transition-colors">Cuộn để khám phá</span>
                <div className="w-5 h-8 border-2 border-cyan-400/40 rounded-full flex items-start justify-center p-1.5 group-hover:border-cyan-300 transition-colors">
                  <div className="w-1 h-2 bg-cyan-400/60 rounded-full animate-pulse group-hover:bg-cyan-300"></div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Enhanced Three Blocks Below */}
        <div className="grid lg:grid-cols-3 gap-6 mt-16">
          {/* Enhanced Featured Match */}
          <div className="rounded-[32px] p-6 text-white transition-all hover:scale-105 relative overflow-hidden backdrop-blur-sm bg-black/10 border border-white/10 hover:border-red-400/30 group">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative mt-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/90 mb-4 font-semibold">Trận tâm điểm</p>
              <div className="flex items-center justify-between mb-6">
                <p className="text-2xl font-bold text-white">PSG gặp Dortmund</p>
                <span className="text-sm font-mono text-white bg-red-600 px-3 py-1 rounded-full shadow-lg animate-pulse">Trực tiếp 78'</span>
              </div>
              <div className="flex items-center justify-between py-6 border-y border-white/20">
                <div>
                  <p className="text-4xl font-bold text-white">2</p>
                  <p className="text-sm text-white/90 mt-1 font-medium">Paris SG</p>
                </div>
                <div className="text-3xl font-bold text-white/70">-</div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">1</p>
                  <p className="text-sm text-white/90 mt-1 font-medium">Dortmund</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/80 font-medium">
                <span>Parc des Princes</span>
                <span>Bảng H</span>
              </div>
            </div>
            
            {/* Live indicator pulse */}
            <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>

          {/* Enhanced Fixtures Tile */}
          {quickTiles.map((tile, index) => {
            const TileIcon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className={`rounded-2xl p-6 bg-gradient-to-br ${tile.gradient} border border-white/10 text-white hover:scale-[1.01] transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group backdrop-blur-sm`}
              >
                {/* Animated icon */}
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <TileIcon size={80} className="text-cyan-400" />
                </div>
                
                <div className="relative mt-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/90 mb-3 font-semibold">Khám phá</p>
                  <p className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{tile.title}</p>
                  <p className="text-sm text-white/80 mb-6 font-medium">{tile.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:gap-3 transition-all">
                    Xem ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Search & Stats Section */}
      <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Tìm kiếm CLB, cầu thủ & lịch thi đấu</h2>
            <p className="text-white/70 text-sm">
              Dữ liệu trực tiếp từ Football-Data API với bộ lọc tức thì.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập ít nhất 2 ký tự..."
              className="w-full rounded-full bg-black/40 border border-white/20 text-white px-5 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 placeholder:text-white/50"
            />
            {searching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-cyan-300">
                Đang tìm...
              </span>
            )}
          </div>
        </div>

        {(playerResults.length > 0 || matchResults.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white/80 text-sm uppercase tracking-[0.3em] mb-3">Cầu thủ</h3>
              <ul className="space-y-3">
                {playerResults.map((player) => (
                  <li key={player.id} className="flex items-center justify-between text-white/90">
                    <div>
                      <div className="font-semibold text-white">{player.name}</div>
                      <div className="text-xs text-white/60">
                        {player.teamName} · {toPlayerPositionLabel(player.position)}
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      Áo #{player.shirtNumber ?? '—'}
                      <div>{toCountryLabel(player.nationality)}</div>
                    </div>
                  </li>
                ))}
              </ul>
              {playerResults.length === 0 && !searching && (
                <div className="text-white/60 text-sm">Không tìm thấy cầu thủ phù hợp.</div>
              )}
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white/80 text-sm uppercase tracking-[0.3em] mb-3">Trận đấu</h3>
              <ul className="space-y-3">
                {matchResults.map((match) => (
                  <li key={match.id} className="flex items-center justify-between text-white/90">
                    <div>
                      <div className="font-semibold text-white">
                        {match.homeTeamName} gặp {match.awayTeamName}
                      </div>
                      <div className="text-xs text-white/60">
                        {new Date(match.utcDate).toLocaleDateString('vi-VN')} · {toCompetitionStageLabel(match.stage || match.groupName || 'Vòng phân hạng')}
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      Trạng thái: {toMatchStatusLabel(match.status)}
                      <div>{match.venue || 'Đang cập nhật sân'}</div>
                    </div>
                  </li>
                ))}
              </ul>
              {matchResults.length === 0 && !searching && (
                <div className="text-white/60 text-sm">Không tìm thấy lịch thi đấu.</div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Rest of the sections remain the same */}
      {/* ... (other sections) ... */}
    </div>
  );
};

export default HomePage;
