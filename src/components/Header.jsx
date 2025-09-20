import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Search, Globe, User, ShoppingCart, Bell } from 'lucide-react'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCompetitionDropdownOpen, setIsCompetitionDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { name: 'Standings', path: '/standings' },
    { name: 'Matches', path: '/matches' },
    { name: 'Teams', path: '/teams' },
    { name: 'Stats', path: '/stats' },
    { name: 'News', path: '/news' },
    { name: 'Video', path: '/video' },
    { name: 'Gaming', path: '/gaming' },
  ]

  const competitions = [
    { name: 'Champions League', path: '/champions-league', active: true },
    { name: 'Europa League', path: '/europa-league' },
    { name: 'Conference League', path: '/conference-league' },
    { name: 'Super Cup', path: '/super-cup' },
    { name: 'Youth League', path: '/youth-league' },
    { name: 'Women\'s Champions League', path: '/womens-champions-league' },
    { name: 'Futsal Champions League', path: '/futsal-champions-league' },
  ]

  const userMenuItems = [
    { name: 'My Profile', path: '/profile' },
    { name: 'My Tickets', path: '/tickets' },
    { name: 'Fantasy Football', path: '/fantasy' },
    { name: 'Predictions', path: '/predictions' },
    { name: 'Settings', path: '/settings' },
  ]

  return (
    <header className={`uefa-nav sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      {/* Top Bar */}
      <div className="bg-uefa-dark text-white py-2">
        <div className="uefa-container">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="font-medium">Official UEFA Website</span>
              <div className="hidden md:flex items-center space-x-4">
                <a href="#" className="hover:text-uefa-gold transition-colors flex items-center">
                  <Globe size={16} className="mr-1" />
                  English
                </a>
                <span className="text-uefa-gray">|</span>
                <a href="#" className="hover:text-uefa-gold transition-colors">
                  <Bell size={16} className="inline mr-1" />
                  Notifications
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-uefa-gold transition-colors">Store</a>
              <a href="#" className="hover:text-uefa-gold transition-colors">Tickets</a>
              <a href="#" className="hover:text-uefa-gold transition-colors">Fantasy</a>
              <a href="#" className="hover:text-uefa-gold transition-colors">Gaming</a>
              <span className="text-uefa-gray hidden md:inline">|</span>
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-uefa-gold transition-colors"
                >
                  <User size={16} />
                  <span>Sign In</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="uefa-dropdown right-0">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-uefa-dark">Welcome back!</p>
                      <p className="text-xs text-uefa-gray">Access your UEFA account</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="uefa-dropdown-item"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 px-4 py-2">
                      <button className="text-sm text-uefa-red hover:text-uefa-dark transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="uefa-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-uefa-blue to-uefa-light-blue rounded-full flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="white"/>
                </svg>
              </div>
              <div className="hidden md:block">
                <div className="text-uefa-blue font-bold text-xl">UEFA</div>
                <div className="text-uefa-gray text-sm font-medium">Champions League</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* Competition Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCompetitionDropdownOpen(!isCompetitionDropdownOpen)}
                  className="flex items-center space-x-1 text-uefa-dark-gray hover:text-uefa-blue font-medium transition-colors py-2"
                >
                  <span>Competitions</span>
                  <ChevronDown size={16} className={`transform transition-transform ${isCompetitionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCompetitionDropdownOpen && (
                  <div className="uefa-dropdown w-64">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-uefa-dark">UEFA Competitions</p>
                    </div>
                    {competitions.map((competition) => (
                      <Link
                        key={competition.name}
                        to={competition.path}
                        className={`uefa-dropdown-item flex items-center justify-between ${competition.active ? 'text-uefa-blue font-semibold bg-uefa-light-gray' : ''}`}
                        onClick={() => setIsCompetitionDropdownOpen(false)}
                      >
                        <span>{competition.name}</span>
                        {competition.active && (
                          <span className="w-2 h-2 bg-uefa-blue rounded-full"></span>
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
                  className={`uefa-nav-item py-2 px-1 border-b-2 border-transparent ${location.pathname === item.path ? 'active border-uefa-blue' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-uefa-gray" />
                <input
                  type="text"
                  placeholder="Search teams, players, matches..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-uefa-blue focus:border-transparent w-80 transition-all duration-300"
                />
              </div>
              
              <button className="p-2 text-uefa-dark-gray hover:text-uefa-blue transition-colors md:hidden">
                <Search size={20} />
              </button>

              <button className="p-2 text-uefa-dark-gray hover:text-uefa-blue transition-colors relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-uefa-red text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              <button className="p-2 text-uefa-dark-gray hover:text-uefa-blue transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-uefa-red rounded-full"></span>
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-uefa-dark-gray hover:text-uefa-blue transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="uefa-mobile-menu">
          <div className="uefa-container py-4">
            <div className="space-y-4">
              {/* Competition Section */}
              <div>
                <div className="text-uefa-gray text-sm font-semibold uppercase tracking-wide mb-2">
                  Competitions
                </div>
                {competitions.map((competition) => (
                  <Link
                    key={competition.name}
                    to={competition.path}
                    className={`uefa-mobile-menu-item ${competition.active ? 'text-uefa-blue font-semibold' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {competition.name}
                  </Link>
                ))}
              </div>

              {/* Navigation Section */}
              <div>
                <div className="text-uefa-gray text-sm font-semibold uppercase tracking-wide mb-2">
                  Navigation
                </div>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`uefa-mobile-menu-item ${location.pathname === item.path ? 'text-uefa-blue font-semibold' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
