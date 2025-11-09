import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Globe, User, ShoppingCart, Bell } from 'lucide-react';
import uefaPrimaryMark from '../../../assets/images/UEFA_Champions_League_logo.svg.png';

const PublicHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompetitionDropdownOpen, setIsCompetitionDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Standings', path: '/standings' },
    { name: 'Matches', path: '/matches' },
    { name: 'Teams', path: '/teams' },
    { name: 'Stats', path: '/stats' },
    { name: 'News', path: '/news' },
    { name: 'Video', path: '/video' },
    { name: 'Gaming', path: '/gaming' },
  ];

  const competitions = [
    { name: 'Champions League', path: '/champions-league', active: true },
    { name: 'Europa League', path: '/europa-league' },
    { name: 'Conference League', path: '/conference-league' },
    { name: 'Super Cup', path: '/super-cup' },
    { name: 'Youth League', path: '/youth-league' },
    { name: "Women's Champions League", path: '/womens-champions-league' },
    { name: 'Futsal Champions League', path: '/futsal-champions-league' },
  ];

  const userMenuItems = [
    { name: 'My Profile', path: '/profile' },
    { name: 'My Tickets', path: '/tickets' },
    { name: 'Fantasy Football', path: '/fantasy' },
    { name: 'Predictions', path: '/predictions' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-xl' : ''}`}>
      {/* Top Bar */}
      <div className="bg-[#1a2332] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-6">
              <span className="text-white/70 font-medium hidden md:flex items-center gap-2">
                <Globe size={13} />
                Official UEFA Website
              </span>
              <div className="hidden lg:flex items-center gap-4 text-white/60">
                <a href="#" className="hover:text-white transition-colors">Store</a>
                <span className="text-white/30">•</span>
                <a href="#" className="hover:text-white transition-colors">Tickets</a>
                <span className="text-white/30">•</span>
                <a href="#" className="hover:text-white transition-colors">Fantasy</a>
                <span className="text-white/30">•</span>
                <a href="#" className="hover:text-white transition-colors">Gaming</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
                <Globe size={13} />
                <span className="hidden sm:inline">English</span>
                <ChevronDown size={12} />
              </button>
              <span className="text-white/30 hidden md:inline">|</span>
              <Link
                to="/signup"
                className="hidden md:inline-flex items-center text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/admin/login"
                className="hidden md:inline-flex items-center px-3 py-1 bg-[#00d4ff] text-[#0a1929] font-semibold rounded hover:bg-[#00b8e6] transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[#0a1929] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-[#00d4ff]/50 transition-all">
                <img
                  src={uefaPrimaryMark}
                  alt="UEFA Champions League"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="hidden md:block">
                <div className="text-white font-bold text-lg leading-tight">UEFA</div>
                <div className="text-[#00d4ff] text-[10px] font-semibold uppercase tracking-wider">Champions League</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              {/* Competition Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCompetitionDropdownOpen(!isCompetitionDropdownOpen)}
                  onMouseEnter={() => setIsCompetitionDropdownOpen(true)}
                  onMouseLeave={() => setIsCompetitionDropdownOpen(false)}
                  className="flex items-center gap-1 px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
                >
                  <span>Competitions</span>
                  <ChevronDown size={16} className={`transition-transform ${isCompetitionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCompetitionDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 bg-[#0a1929] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                    onMouseEnter={() => setIsCompetitionDropdownOpen(true)}
                    onMouseLeave={() => setIsCompetitionDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">UEFA Competitions</p>
                    </div>
                    {competitions.map((competition) => (
                      <Link
                        key={competition.name}
                        to={competition.path}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          competition.active
                            ? 'text-[#00d4ff] font-semibold bg-white/5'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                        onClick={() => setIsCompetitionDropdownOpen(false)}
                      >
                        <span>{competition.name}</span>
                        {competition.active && (
                          <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full"></span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-[#00d4ff]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search teams, players, match..."
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/10 w-64 transition-all"
                />
              </div>

              <button className="p-2 text-white/70 hover:text-white transition-colors md:hidden">
                <Search size={20} />
              </button>

              <button className="p-2 text-white/70 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>

              <button className="p-2 text-white/70 hover:text-white transition-colors relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] text-[#0a1929] text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Ticker */}
      <div className="bg-gradient-to-r from-[#003B73] via-[#004EA8] to-[#00C65A] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center h-8 text-xs text-white font-medium overflow-hidden">
            <span className="bg-white text-red-600 px-2 py-0.5 rounded text-[10px] font-bold mr-3 flex-shrink-0">
              LIVE
            </span>
            <div className="flex items-center gap-6 animate-scroll whitespace-nowrap">
              <span>Manchester City 1-0 PSG • 82'</span>
              <span className="text-white/60">•</span>
              <span>Barcelona 3-2 Inter Milan • FT</span>
              <span className="text-white/60">•</span>
              <span>Real Madrid 2-1 Bayern Munich • 78'</span>
              <span className="text-white/60">•</span>
              <span>Liverpool 2-2 Juventus • 65'</span>
              <span className="text-white/60">•</span>
              <span>Manchester City 1-0 PSG • 82'</span>
              <span className="text-white/60">•</span>
              <span>Barcelona 3-2 Inter Milan • FT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0a1929] border-t border-white/5">
          <div className="max-w-[1400px] mx-auto px-4 py-6">
            <div className="space-y-6">
              {/* Competitions */}
              <div>
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
                  Competitions
                </div>
                {competitions.map((competition) => (
                  <Link
                    key={competition.name}
                    to={competition.path}
                    className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      competition.active
                        ? 'text-[#00d4ff] font-semibold bg-white/5'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {competition.name}
                  </Link>
                ))}
              </div>

              {/* Navigation */}
              <div>
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
                  Navigation
                </div>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'text-[#00d4ff] font-semibold bg-white/5'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Account */}
              <div>
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
                  Account
                </div>
                <Link
                  to="/signup"
                  className="block px-4 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
                <Link
                  to="/admin/login"
                  className="block px-4 py-2.5 rounded-lg text-sm text-[#00d4ff] font-semibold bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default PublicHeader;
