import React, { useState } from 'react'
import { Gamepad2, Trophy, Users, Target, Star, Zap, Award, Crown } from 'lucide-react'

const Gaming = () => {
  const [selectedGame, setSelectedGame] = useState('fantasy')

  const games = [
    {
      id: 'fantasy',
      name: 'UEFA Fantasy Football',
      description: 'Create your dream team and compete with millions of fans worldwide',
      icon: '⚽',
      players: '2.5M+',
      status: 'Live'
    },
    {
      id: 'predictor',
      name: 'Match Predictor',
      description: 'Predict match results and climb the global leaderboard',
      icon: '🔮',
      players: '1.8M+',
      status: 'Live'
    },
    {
      id: 'quiz',
      name: 'Champions League Quiz',
      description: 'Test your knowledge of Champions League history and facts',
      icon: '🧠',
      players: '950K+',
      status: 'Live'
    },
    {
      id: 'mobile',
      name: 'UEFA Mobile Game',
      description: 'Official UEFA mobile game with exclusive content',
      icon: '📱',
      players: '3.1M+',
      status: 'Coming Soon'
    }
  ]

  const leaderboard = [
    {
      rank: 1,
      username: 'ChampionsKing',
      points: 2847,
      country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      badge: 'Legend'
    },
    {
      rank: 2,
      username: 'BarçaFan2024',
      points: 2756,
      country: '🇪🇸',
      badge: 'Master'
    },
    {
      rank: 3,
      username: 'LiverpoolLegend',
      points: 2689,
      country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      badge: 'Master'
    },
    {
      rank: 4,
      username: 'InterMilan',
      points: 2634,
      country: '🇮🇹',
      badge: 'Expert'
    },
    {
      rank: 5,
      username: 'BayernMunich',
      points: 2587,
      country: '🇩🇪',
      badge: 'Expert'
    }
  ]

  const achievements = [
    {
      id: 1,
      name: 'Perfect Predictor',
      description: 'Predict 10 matches correctly in a row',
      icon: Target,
      rarity: 'Legendary',
      progress: 7,
      total: 10
    },
    {
      id: 2,
      name: 'Fantasy Master',
      description: 'Finish in top 1% of Fantasy Football',
      icon: Crown,
      rarity: 'Epic',
      progress: 85,
      total: 100
    },
    {
      id: 3,
      name: 'Quiz Champion',
      description: 'Answer 100 quiz questions correctly',
      icon: Award,
      rarity: 'Rare',
      progress: 73,
      total: 100
    },
    {
      id: 4,
      name: 'Social Butterfly',
      description: 'Share 25 predictions with friends',
      icon: Users,
      rarity: 'Common',
      progress: 18,
      total: 25
    }
  ]

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'from-uefa-gold to-yellow-400'
      case 'Epic':
        return 'from-uefa-purple to-purple-400'
      case 'Rare':
        return 'from-uefa-blue to-blue-400'
      case 'Common':
        return 'from-uefa-gray to-gray-400'
      default:
        return 'from-uefa-gray to-gray-400'
    }
  }

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Legend':
        return 'bg-uefa-gold text-uefa-black'
      case 'Master':
        return 'bg-uefa-purple text-white'
      case 'Expert':
        return 'bg-uefa-blue text-white'
      default:
        return 'bg-uefa-gray text-white'
    }
  }

  return (
    <div className="uefa-container py-8">
      {/* Breadcrumb */}
      <nav className="uefa-breadcrumb">
        <a href="#" className="uefa-breadcrumb-item">Home</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <a href="#" className="uefa-breadcrumb-item">Champions League</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <span className="text-uefa-dark">Gaming</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="uefa-section-title">UEFA Champions League Gaming</h1>
        <p className="uefa-section-subtitle">
          Play official UEFA games and compete with fans worldwide
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {games.map((game) => (
          <div key={game.id} className="uefa-card p-6 text-center group hover:shadow-2xl transition-all duration-500">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {game.icon}
            </div>
            
            <h3 className="text-lg font-bold text-uefa-dark mb-3 group-hover:text-uefa-blue transition-colors">
              {game.name}
            </h3>
            
            <p className="text-uefa-gray text-sm mb-4 leading-relaxed">
              {game.description}
            </p>
            
            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users size={14} className="text-uefa-gray" />
                <span className="text-uefa-gray">{game.players}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                game.status === 'Live' ? 'bg-uefa-green text-white' : 'bg-uefa-yellow text-uefa-black'
              }`}>
                {game.status}
              </span>
            </div>
            
            <button 
              onClick={() => setSelectedGame(game.id)}
              className={`w-full uefa-btn-primary ${game.status === 'Coming Soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={game.status === 'Coming Soon'}
            >
              {game.status === 'Coming Soon' ? 'Coming Soon' : 'Play Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="uefa-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="text-uefa-gold" size={24} />
            <h2 className="text-2xl font-bold text-uefa-dark">Global Leaderboard</h2>
          </div>
          
          <div className="space-y-4">
            {leaderboard.map((player) => (
              <div key={player.rank} className="flex items-center justify-between p-4 bg-uefa-light-gray rounded-uefa hover:bg-uefa-medium-gray transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    player.rank === 1 ? 'bg-uefa-gold text-uefa-black' :
                    player.rank === 2 ? 'bg-uefa-silver text-uefa-black' :
                    player.rank === 3 ? 'bg-uefa-bronze text-white' :
                    'bg-uefa-gray'
                  }`}>
                    {player.rank}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-uefa-dark">{player.username}</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span>{player.country}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeColor(player.badge)}`}>
                        {player.badge}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-uefa-blue">{player.points.toLocaleString()}</div>
                  <div className="text-uefa-gray text-sm">points</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="uefa-btn-secondary">
              View Full Leaderboard
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div className="uefa-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="text-uefa-purple" size={24} />
            <h2 className="text-2xl font-bold text-uefa-dark">Achievements</h2>
          </div>
          
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 bg-uefa-light-gray rounded-uefa">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center`}>
                      <achievement.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-uefa-dark">{achievement.name}</h3>
                      <p className="text-uefa-gray text-sm">{achievement.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                    {achievement.rarity}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-uefa-gray">Progress</span>
                    <span className="text-uefa-dark font-medium">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                  <div className="uefa-progress-bar">
                    <div 
                      className="uefa-progress-fill"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="uefa-btn-secondary">
              View All Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Gaming Stats */}
      <div className="mt-12 pt-8 border-t border-uefa-medium-gray">
        <h2 className="text-2xl font-bold text-uefa-dark mb-6 text-center">Gaming Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">8.4M+</div>
            <div className="text-uefa-gray">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">156M+</div>
            <div className="text-uefa-gray">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">89%</div>
            <div className="text-uefa-gray">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-uefa-blue mb-2">24/7</div>
            <div className="text-uefa-gray">Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gaming
