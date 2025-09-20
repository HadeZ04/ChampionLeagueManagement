import React, { useState } from 'react'
import { Play, Clock, Eye, Heart, Share2, Filter } from 'lucide-react'

const Video = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedQuality, setSelectedQuality] = useState('all')

  const categories = [
    { id: 'all', name: 'All Videos' },
    { id: 'highlights', name: 'Highlights' },
    { id: 'goals', name: 'Goals' },
    { id: 'interviews', name: 'Interviews' },
    { id: 'behind-scenes', name: 'Behind the Scenes' },
    { id: 'classic', name: 'Classic Matches' }
  ]

  const videos = [
    {
      id: 1,
      title: 'Liverpool 2-1 Lille | Extended Highlights',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/63706.jpg',
      duration: '05:42',
      views: '2.1M',
      uploadDate: '2025-01-22',
      category: 'highlights',
      quality: 'HD',
      featured: true,
      description: 'Watch the extended highlights as Liverpool maintained their perfect record with a thrilling victory over Lille at Anfield.'
    },
    {
      id: 2,
      title: 'Barcelona 3-2 Atalanta | All Goals & Highlights',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/50207.jpg',
      duration: '08:15',
      views: '1.8M',
      uploadDate: '2025-01-22',
      category: 'highlights',
      quality: '4K',
      featured: true,
      description: 'Barcelona secured their place in the Round of 16 with an entertaining victory over Atalanta at Camp Nou.'
    },
    {
      id: 3,
      title: 'Lewandowski\'s incredible hat-trick vs Atalanta',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/50207.jpg',
      duration: '03:28',
      views: '3.2M',
      uploadDate: '2025-01-22',
      category: 'goals',
      quality: 'HD',
      featured: false,
      description: 'Robert Lewandowski scored a stunning hat-trick to lead Barcelona to victory.'
    },
    {
      id: 4,
      title: 'Klopp: "We\'re ready for the knockout phase"',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/63706.jpg',
      duration: '02:15',
      views: '856K',
      uploadDate: '2025-01-22',
      category: 'interviews',
      quality: 'HD',
      featured: false,
      description: 'Liverpool manager Jürgen Klopp speaks about his team\'s perfect record and preparation for the knockout rounds.'
    },
    {
      id: 5,
      title: 'Inside Training: Liverpool prepare for Lille clash',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/63706.jpg',
      duration: '04:33',
      views: '642K',
      uploadDate: '2025-01-21',
      category: 'behind-scenes',
      quality: 'HD',
      featured: false,
      description: 'Go behind the scenes as Liverpool prepare for their crucial match against Lille.'
    },
    {
      id: 6,
      title: 'Classic Match: Liverpool 4-0 Barcelona (2019)',
      thumbnail: 'https://img.uefa.com/imgml/TP/players/1/2024/324x324/63706.jpg',
      duration: '12:45',
      views: '5.7M',
      uploadDate: '2025-01-20',
      category: 'classic',
      quality: 'HD',
      featured: false,
      description: 'Relive one of the greatest comebacks in Champions League history as Liverpool overturned a 3-0 deficit.'
    }
  ]

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesQuality = selectedQuality === 'all' || video.quality === selectedQuality
    return matchesCategory && matchesQuality
  })

  const featuredVideos = filteredVideos.filter(video => video.featured)
  const regularVideos = filteredVideos.filter(video => !video.featured)

  const formatViews = (views) => {
    if (views.includes('M')) return views
    if (views.includes('K')) return views
    return `${parseInt(views).toLocaleString()}`
  }

  const formatDuration = (duration) => {
    return duration
  }

  return (
    <div className="uefa-container py-8">
      {/* Breadcrumb */}
      <nav className="uefa-breadcrumb">
        <a href="#" className="uefa-breadcrumb-item">Home</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <a href="#" className="uefa-breadcrumb-item">Champions League</a>
        <span className="uefa-breadcrumb-separator">/</span>
        <span className="text-uefa-dark">Video</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="uefa-section-title">UEFA Champions League Video</h1>
        <p className="uefa-section-subtitle">
          Watch highlights, goals, interviews and exclusive content
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="uefa-filter-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`uefa-filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Filter size={16} className="text-uefa-gray" />
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            className="uefa-select"
          >
            <option value="all">All Quality</option>
            <option value="4K">4K Ultra HD</option>
            <option value="HD">HD</option>
            <option value="SD">Standard</option>
          </select>
        </div>
      </div>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-uefa-dark mb-6">Featured Videos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredVideos.map((video) => (
              <div key={video.id} className="uefa-card overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-uefa-blue to-uefa-light-blue flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <button className="relative z-10 w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={24} className="text-uefa-blue ml-1" />
                    </button>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="bg-uefa-red px-2 py-1 rounded text-xs font-bold">
                            FEATURED
                          </span>
                          <span className="bg-black/50 px-2 py-1 rounded text-xs font-bold">
                            {video.quality}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{video.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{video.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-uefa-dark mb-3 group-hover:text-uefa-blue transition-colors">
                    {video.title}
                  </h3>
                  
                  <p className="text-uefa-gray mb-4 leading-relaxed">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-uefa-gray text-sm">
                      {new Date(video.uploadDate).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-uefa-gray hover:text-uefa-red transition-colors">
                        <Heart size={16} />
                      </button>
                      <button className="p-2 text-uefa-gray hover:text-uefa-blue transition-colors">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Videos */}
      {regularVideos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-uefa-dark mb-6">Latest Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularVideos.map((video) => (
              <div key={video.id} className="uefa-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-uefa-light-gray to-uefa-medium-gray flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <button className="relative z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={20} className="text-uefa-blue ml-0.5" />
                    </button>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between text-white text-xs">
                        <span className="bg-black/70 px-2 py-1 rounded font-bold">
                          {video.quality}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{video.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{video.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-uefa-dark mb-2 group-hover:text-uefa-blue transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <p className="text-uefa-gray text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-uefa-gray text-xs">
                      {new Date(video.uploadDate).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-uefa-gray hover:text-uefa-red transition-colors">
                        <Heart size={14} />
                      </button>
                      <button className="p-1 text-uefa-gray hover:text-uefa-blue transition-colors">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Player Modal would go here */}
      
      {/* Load More */}
      <div className="text-center mt-12">
        <button className="uefa-btn-primary px-8 py-3">
          Load More Videos
        </button>
      </div>
    </div>
  )
}

export default Video
