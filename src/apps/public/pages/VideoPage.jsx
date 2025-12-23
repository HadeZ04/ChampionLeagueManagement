// src/pages/VideoPage.js
import React from 'react';

// Dữ liệu giả - Trong thực tế, dữ liệu này sẽ được lấy từ API
const videos = [
  {
    id: 1,
    title: 'TÓM TẮT: Real Madrid vs Dortmund | Chung kết 2024',
    thumbnailUrl: 'https://via.placeholder.com/400x250/FFC72C/000000?text=Tom+tat+1',
    duration: '10:32',
  },
  {
    id: 2,
    title: 'Tất cả 8 bàn thắng của Harry Kane tại C1 2023/24',
    thumbnailUrl: 'https://via.placeholder.com/400x250/DC143C/FFFFFF?text=Tom+tat+2',
    duration: '05:18',
  },
  {
    id: 3,
    title: 'Top 10 pha cứu thua không tưởng mùa giải 2023/24',
    thumbnailUrl: 'https://via.placeholder.com/400x250/32CD32/FFFFFF?text=Tom+tat+3',
    duration: '07:45',
  },
];

const VideoCard = ({ video }) => {
    const thumbnailUrl = video.thumbnailUrl || null;
    return (
        <div className="bg-[#020617]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:border-cyan-400/30 min-h-[320px] flex flex-col">
            <div className="relative h-48 flex-shrink-0 overflow-hidden">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#4C1D95] flex items-center justify-center">
                        <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-cyan-400 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm">{video.duration}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-md font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">{video.title}</h3>
            </div>
        </div>
    );
};

const VideoPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-8 border-l-4 border-cyan-400 pl-4">
        Video nổi bật
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {/* Lặp qua dữ liệu giả để hiển thị các video */}
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoPage;
