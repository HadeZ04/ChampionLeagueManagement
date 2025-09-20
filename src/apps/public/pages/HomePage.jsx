import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Calendar, Users, Target, ArrowRight, Play } from 'lucide-react'
import StandingsTable from '../components/StandingsTable'
import UpcomingMatches from '../components/UpcomingMatches'
import TopScorers from '../components/TopScorers'
import NewsCard from '../components/NewsCard'

const HomePage = () => {
  const heroStats = [
    { label: 'Teams', value: '36', icon: Users },
    { label: 'Matches', value: '189', icon: Calendar },
    { label: 'Goals', value: '312', icon: Target },
    { label: 'Countries', value: '17', icon: Trophy }
  ]

  const featuredNews = [
    {
      id: 1,
      title: 'Liverpool maintain perfect record with victory over Lille',
      summary: 'The Reds secured their sixth consecutive win in the Champions League with a commanding performance at Anfield.',
      category: 'matches',
      date: '2025-01-22',
      time: '23:30',
      image: '🔴',
      featured: true,
      tags: ['Liverpool', 'Lille', 'Match Report']
    },
    {
      id: 2,
      title: 'Barcelona cruise past Atalanta to secure top-eight finish',
      summary: 'Hansi Flick\'s side delivered a masterclass performance to guarantee their place in the Round of 16.',
      category: 'matches',
      date: '2025-01-22',
      time: '23:15',
      image: '🔵',
      featured: true,
      tags: ['Barcelona', 'Atalanta', 'Round of 16']
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-uefa-blue via-uefa-light-blue to-uefa-blue text-white py-20">
        <div className="uefa-container">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              UEFA CHAMPIONS LEAGUE
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              Europe's premier club competition featuring the continent's best teams
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/matches" className="uefa-btn-primary bg-white text-uefa-blue hover:bg-uefa-light-gray">
                <Play size={20} className="mr-2" />
                Watch Live Matches
              </Link>
              <Link to="/standings" className="uefa-btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-uefa-blue">
                View Standings
              </Link>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroStats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-uefa-lg">
                <stat.icon size={32} className="mx-auto mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-75 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="uefa-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Standings */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-uefa-dark">Current Standings</h2>
                <Link to="/standings" className="flex items-center space-x-2 text-uefa-blue hover:text-uefa-dark transition-colors">
                  <span>View Full Table</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              <StandingsTable standings={[]} selectedGroup="all" />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <UpcomingMatches />
              <TopScorers />
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 bg-uefa-light-gray">
        <div className="uefa-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-uefa-dark">Latest News</h2>
            <Link to="/news" className="flex items-center space-x-2 text-uefa-blue hover:text-uefa-dark transition-colors">
              <span>View All News</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {featuredNews.map((article) => (
              <NewsCard key={article.id} article={article} featured={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-uefa-blue to-uefa-light-blue text-white">
        <div className="uefa-container text-center">
          <h2 className="text-4xl font-bold mb-6">Experience the Champions League</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get tickets, play fantasy football, and stay updated with the latest from Europe's premier competition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="uefa-btn-primary bg-white text-uefa-blue hover:bg-uefa-light-gray">
              Buy Tickets
            </button>
            <button className="uefa-btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-uefa-blue">
              Play Fantasy
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
