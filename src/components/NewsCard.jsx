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
        return 'bg-gradient-to-r from-[#003B73] to-[#00C65A] text-white'
      case 'teams':
        return 'bg-gradient-to-r from-[#0074F0] to-[#003B73] text-white'
      case 'players':
        return 'bg-gradient-to-r from-[#00C65A] to-[#FACC15] text-[#111827]'
      case 'draws':
        return 'bg-gradient-to-r from-[#E3F2FF] to-[#0074F0] text-[#003B73]'
      case 'awards':
        return 'bg-gradient-to-r from-[#FF9F1C] to-[#FACC15] text-[#111827]'
      default:
        return 'bg-white/20 text-white'
    }
  }

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-[#003B73] via-[#0074F0] to-[#00924A] text-white shadow-[0_35px_90px_rgba(0,59,115,0.45)] transition-all duration-500 group">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#003B73] via-[#0074F0] to-[#00C65A] opacity-90" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 35% 25%, rgba(250,204,21,0.4), transparent 55%)' }} />
          <div className="absolute top-4 left-4">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.3em]">
              Nổi bật
            </span>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors">
              <Share2 size={16} />
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors">
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

        <div className="p-6 space-y-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <div className="text-2xl">{article.image}</div>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#FACC15] transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>

          <p className="text-white/80 mb-4 leading-relaxed line-clamp-3">
            {article.summary}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-white/10 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium">
              <span>Read More</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-[28px] border border-white/20 bg-gradient-to-br from-[#003B73] via-[#00924A] to-[#00C65A] p-6 text-white shadow-[0_25px_70px_rgba(0,59,115,0.4)] group hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            {article.image}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <Calendar size={14} />
                <span>{formatDate(article.date)}</span>
                <Clock size={14} />
                <span>{article.time}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-1 text-white/70 hover:text-white transition-colors">
                <Share2 size={14} />
              </button>
              <button className="p-1 text-white/70 hover:text-white transition-colors">
                <Eye size={14} />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FACC15] transition-colors cursor-pointer line-clamp-2">
            {article.title}
          </h3>

          <p className="text-white/80 mb-3 leading-relaxed line-clamp-2">
            {article.summary}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-white/10 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors font-medium">
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
