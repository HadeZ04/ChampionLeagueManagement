import React, { useState, useEffect } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([
    'Liverpool standings',
    'Barcelona vs Atalanta',
    'Champions League top scorers',
    'Real Madrid news'
  ])

  const popularSearches = [
    'Liverpool perfect record',
    'Lewandowski goals',
    'Champions League format',
    'Knockout phase draw',
    'Barcelona qualification'
  ]

  useEffect(() => {
    if (searchTerm.length > 2) {
      // Simulate search results
      const mockResults = [
        { type: 'team', title: 'Liverpool FC', subtitle: 'Current league leaders with 18 points' },
        { type: 'match', title: 'Liverpool vs Lille', subtitle: 'Tonight at 21:00, Anfield' },
        { type: 'player', title: 'Mohamed Salah', subtitle: 'Liverpool forward, 5 goals this season' },
        { type: 'news', title: 'Liverpool maintain perfect record', subtitle: 'Latest match report from Anfield' }
      ].filter(result => 
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(mockResults)
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-[#020617]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-2xl mx-4">
        {/* Search Header */}
        <div className="flex items-center p-6 border-b border-white/10">
          <Search size={20} className="text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Tìm kiếm đội, cầu thủ, trận đấu, tin tức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-lg outline-none bg-transparent text-white placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {searchTerm.length > 2 ? (
            /* Search Results */
            <div className="p-6">
              <h3 className="font-semibold text-uefa-dark mb-4">Kết quả tìm kiếm</h3>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 hover:bg-uefa-light-gray rounded cursor-pointer transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        result.type === 'team' ? 'bg-uefa-blue' :
                        result.type === 'match' ? 'bg-uefa-green' :
                        result.type === 'player' ? 'bg-uefa-purple' :
                        'bg-uefa-red'
                      }`}>
                        {result.type.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-uefa-dark">{result.title}</div>
                        <div className="text-uefa-gray text-sm">{result.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-uefa-gray">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy kết quả cho "{searchTerm}"</p>
                </div>
              )}
            </div>
          ) : (
            /* Default Content */
            <div className="p-6 space-y-6">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock size={16} className="text-uefa-gray" />
                  <h3 className="font-semibold text-uefa-dark">Tìm kiếm gần đây</h3>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchTerm(search)}
                      className="block w-full text-left p-2 hover:bg-uefa-light-gray rounded transition-colors text-uefa-gray hover:text-uefa-dark"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp size={16} className="text-uefa-gray" />
                  <h3 className="font-semibold text-uefa-dark">Tìm kiếm phổ biến</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchTerm(search)}
                      className="px-3 py-1 bg-uefa-light-gray text-uefa-dark-gray rounded-full text-sm hover:bg-uefa-blue hover:text-white transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
