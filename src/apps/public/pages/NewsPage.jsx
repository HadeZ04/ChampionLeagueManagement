// src/pages/NewsPage.js
import React from 'react';

// Dữ liệu giả - Trong thực tế, dữ liệu này sẽ được lấy từ API
const newsArticles = [
  {
    id: 1,
    title: 'Real Madrid lần thứ 15 vô địch Cúp C1',
    excerpt: 'Los Blancos đã đánh bại Borussia Dortmund trong trận chung kết kịch tính tại Wembley...',
    imageUrl: 'https://via.placeholder.com/400x250/00529F/FFFFFF?text=Real+Madrid',
    date: '02/06/2024',
    category: 'Chung kết',
  },
  {
    id: 2,
    title: 'Phân tích chiến thuật: Man City và bài toán hàng công',
    excerpt: 'Pep Guardiola sẽ cần làm gì để cải thiện hiệu suất ghi bàn của đội nhà trong mùa giải tới?',
    imageUrl: 'https://via.placeholder.com/400x250/6CABDD/FFFFFF?text=Man+City',
    date: '15/09/2025',
    category: 'Phân tích',
  },
  {
    id: 3,
    title: 'Lễ bốc thăm vòng bảng Cúp C1 2025/26: Những bảng tử thần nào sẽ xuất hiện?',
    excerpt: 'Cùng chờ đón những cặp đấu duyên nợ và những bất ngờ tại lễ bốc thăm sắp tới...',
    imageUrl: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=Boc+tham',
    date: '14/09/2025',
    category: 'Tin tức',
  },
];

const NewsCard = ({ article }) => (
  <div className="bg-[#020617]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] transform hover:-translate-y-2 hover:border-cyan-400/30 transition-all duration-300">
    <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" loading="lazy" />
    <div className="p-6">
      <p className="text-sm text-slate-400 mb-2">{article.category} • {article.date}</p>
      <h3 className="text-xl font-bold text-white mb-2 hover:text-cyan-400 transition-colors">{article.title}</h3>
      <p className="text-slate-300">{article.excerpt}</p>
      <a href="#" className="inline-block mt-4 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
        Đọc thêm →
      </a>
    </div>
  </div>
);


const NewsPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-8 border-l-4 border-cyan-400 pl-4">
        Tin tức mới nhất
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Lặp qua dữ liệu giả để hiển thị các bài báo */}
        {newsArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
