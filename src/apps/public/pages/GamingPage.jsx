// src/pages/GamingPage.js
import React from 'react';

const GameCard = ({ title, description, buttonText, imageUrl }) => (
    <div className="relative rounded-lg overflow-hidden shadow-2xl group">
        <img src={imageUrl} className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
            <h2 className="text-4xl font-black mb-2">{title}</h2>
            <p className="text-lg mb-4">{description}</p>
            <button className="bg-uefa-yellow text-uefa-blue font-bold py-3 px-6 rounded-lg hover:bg-white transition-colors duration-300">
                {buttonText}
            </button>
        </div>
    </div>
);

const GamingPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-uefa-blue mb-8 border-l-4 border-uefa-yellow pl-4">
            Trung tâm trò chơi UEFA
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <GameCard 
                title="Bóng đá ảo"
                description="Xây dựng đội hình trong mơ của bạn và cạnh tranh với bạn bè trên toàn thế giới."
                buttonText="Chơi ngay"
                imageUrl="https://via.placeholder.com/600x800/003366/FFFFFF?text=Bong+da+ao"
            />
            <GameCard 
                title="Dự đoán trận đấu"
                description="Dự đoán tỉ số các trận đấu để giành những phần thưởng hấp dẫn."
                buttonText="Dự đoán ngay"
                imageUrl="https://via.placeholder.com/600x800/E83F6F/FFFFFF?text=Du+doan"
            />
        </div>
    </div>
  );
};

export default GamingPage;
