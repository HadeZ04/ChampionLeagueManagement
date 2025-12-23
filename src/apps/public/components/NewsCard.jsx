import React from 'react';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { toNewsCategoryLabel } from '../../../shared/utils/vi';

const NewsCard = ({ article, featured = false }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const categoryColors = {
    matches: 'bg-[#0055FF]/10 text-[#0055FF]',
    teams: 'bg-[#8454FF]/10 text-[#8454FF]',
    players: 'bg-[#00E5FF]/10 text-[#00E5FF]'
  };

  if (featured) {
    return (
      <article className="glass-card overflow-hidden group min-h-[400px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="h-48 bg-gradient-to-br from-[#0055FF]/15 via-[#00E5FF]/10 to-[#8454FF]/15 relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-4 left-4 space-y-2 text-white">
            <p className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(article.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {article.time}
              </span>
            </p>
            <span className="text-xs uppercase tracking-[0.35em] text-white/70">{toNewsCategoryLabel(article.category)}</span>
          </div>
        </div>
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <h3 className="text-2xl font-semibold text-slate-900 group-hover:text-[#0055FF] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-slate-600 line-clamp-3 flex-1">{article.summary}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[#0055FF] text-sm uppercase tracking-[0.3em]">
              Đọc <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-card p-6 space-y-3 group min-h-[280px] flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span className={`px-3 py-1 rounded-full font-medium ${categoryColors[article.category] || 'bg-slate-100 text-slate-500'}`}>
          {toNewsCategoryLabel(article.category)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(article.date)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {article.time}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-[#0055FF] transition-colors line-clamp-2">{article.title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2 flex-1">{article.summary}</p>
      <button className="flex items-center gap-2 text-[#0055FF] text-xs uppercase tracking-[0.3em]">
        Xem thêm <ArrowRight size={12} />
      </button>
    </article>
  );
};

export default NewsCard;
