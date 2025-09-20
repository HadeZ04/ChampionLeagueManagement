// src/pages/VideoPage.js
import React from 'react';

// Dữ liệu giả - Trong thực tế, dữ liệu này sẽ được lấy từ API
const videos = [
  {
    id: 1,
    title: 'HIGHLIGHTS: Real Madrid vs Dortmund | Chung kết 2024',
    thumbnailUrl: 'https://via.placeholder.com/400x250/FFC72C/000000?text=Highlight+1',
    duration: '10:32',
  },
  {
    id: 2,
    title: 'Tất cả 8 bàn thắng của Harry Kane tại C1 2023/24',
    thumbnailUrl: 'https://via.placeholder.com/400x250/DC143C/FFFFFF?text=Highlight+2',
    duration: '05:18',
  },
  {
    id: 3,
    title: 'Top 10 pha cứu thua không tưởng mùa giải 2023/24',
    thumbnailUrl: 'https://via.placeholder.com/400x250/32CD32/FFFFFF?text=Highlight+3',
    duration: '07:45',
  },
];

const VideoCard = ({ video }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer">
        <div className="relative">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 {/* Play Icon SVG */}
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                </svg>
            </div>
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
        </div>
        <div className="p-4">
             <h3 className="text-md font-bold text-gray-800">{video.title}</h3>
        </div>
    </div>
);

const VideoPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-uefa-blue mb-8 border-l-4 border-uefa-yellow pl-4">
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