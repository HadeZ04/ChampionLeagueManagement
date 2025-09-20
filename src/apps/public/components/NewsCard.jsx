import React from 'react'
import { Calendar, Clock, Tag, ArrowRight, Eye, Share2 } from 'lucide-react'

const NewsCard = ({ article, featured = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'matches':
        return 'bg-uefa-green text-white'
      case 'teams':
        return 'bg-uefa-blue text-white'
      case 'players':
        return 'bg-uefa-purple text-white'
      case 'draws':
        return 'bg-uefa-gold text-uefa-black'
      case 'awards':
        return 'bg-uefa-red text-white'
      default:
        return 'bg-uefa-gray text-white'
    }
  }

  if (featured) {
    return (
      <article className="uefa-card overflow-hidden group hover:shadow-2xl transition-all duration-500">
        {/* Featured Image */}
        <div className="relative h-48 bg-gradient-to-br from-uefa-blue to-uefa-light-blue overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4">
            <span className="bg-uefa-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
              Featured
            </span>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Share2 size={16} />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Eye size={16} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDate(article.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{article.time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <div className="text-2xl">{article.image}</div>
          </div>
          
          <h3 className="text-xl font-bold text-uefa-dark mb-3 group-hover:text-uefa-blue transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-uefa-gray mb-4 leading-relaxed line-clamp-3">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-uefa-light-gray text-uefa-dark-gray px-2 py-1 rounded text-xs flex items-center">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-uefa-blue hover:text-uefa-dark transition-colors font-medium">
              <span>Read More</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="uefa-card p-6 group hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-uefa-light-gray to-uefa-medium-gray rounded-uefa flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            {article.image}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <div className="flex items-center space-x-2 text-uefa-gray text-sm">
                <Calendar size={14} />
                <span>{formatDate(article.date)}</span>
                <Clock size={14} />
                <span>{article.time}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 text-uefa-gray hover:text-uefa-blue transition-colors">
                <Share2 size={14} />
              </button>
              <button className="p-1 text-uefa-gray hover:text-uefa-blue transition-colors">
                <Eye size={14} />
              </button>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-uefa-dark mb-2 group-hover:text-uefa-blue transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-uefa-gray mb-3 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-uefa-light-gray text-uefa-dark-gray px-2 py-1 rounded text-xs flex items-center">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-uefa-blue hover:text-uefa-dark transition-colors font-medium">
              <span>Read More</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default NewsCard
