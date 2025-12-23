import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shirt, Footprints, Hash, Calendar, Flag, BarChart2 } from 'lucide-react';
import { toCountryLabel, toPlayerPositionLabel } from '../../../shared/utils/vi';

// --- Giả lập API Service ---
const FAKE_PLAYER_DATA = {
    id: 1,
    fullName: 'Mohamed Salah',
    dob: '1992-06-15',
    nationality: 'Ai Cập',
    height: 175, // cm
    weight: 71, // kg
    position: 'Tiền đạo',
    shirtNumber: 11,
    portraitUrl: 'https://img.uefa.com/imgml/TP/players/3/2024/324x324/250028383.jpg',
    currentTeam: { id: 1, name: 'Liverpool', logoUrl: '...' },
    stats: {
        matchesPlayed: 32,
        minutesPlayed: 2780,
        goals: 25,
        assists: 12,
        yellowCards: 2,
        redCards: 0
    },
    careerHistory: [
        { season: '2023-2025', team: 'Liverpool' },
        { season: '2016-2017', team: 'AS Roma' },
        { season: '2015-2016', team: 'Chelsea' },
    ]
};
const playerService = {
    getPlayerById: async (id) => new Promise(resolve => setTimeout(() => resolve({ data: FAKE_PLAYER_DATA }), 500))
};
// --- Hết giả lập ---

const PlayerProfilePage = () => {
    const { playerId } = useParams();
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        playerService.getPlayerById(playerId).then(response => setPlayer(response.data));
    }, [playerId]);

    if (!player) {
        return <div className="text-center py-12">Đang tải hồ sơ cầu thủ...</div>;
    }

    return (
        <div className="uefa-container py-8">
            {/* Player Header */}
            <div className="flex items-end gap-6 mb-8">
                <img src={player.portraitUrl} alt={player.fullName} className="w-40 h-40 rounded-full border-4 border-white shadow-lg" loading="lazy" />
                <div>
                    <p className="text-gray-500">{toPlayerPositionLabel(player.position)}</p>
                    <h1 className="text-5xl font-bold text-uefa-dark">{player.fullName}</h1>
                    <div className="flex items-center text-3xl font-bold text-uefa-blue mt-2">
                        <Shirt size={30} className="mr-2"/>{player.shirtNumber}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Cột chính: Thống kê */}
                <div className="md:col-span-2">
                    <div className="uefa-card p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><BarChart2 className="mr-2" /> Thống kê mùa giải</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold">{player.stats.matchesPlayed}</p>
                                <p className="text-sm text-gray-500">Số trận</p>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold">{player.stats.goals}</p>
                                <p className="text-sm text-gray-500">Bàn thắng</p>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-3xl font-bold">{player.stats.assists}</p>
                                <p className="text-sm text-gray-500">Kiến tạo</p>
                            </div>
                            {/* ... Các thống kê khác ... */}
                        </div>
                    </div>
                </div>

                {/* Cột phụ: Thông tin cá nhân & Lịch sử */}
                <div className="space-y-6">
                    <div className="uefa-card p-6">
                        <h2 className="text-xl font-bold mb-4">Tiểu sử</h2>
                        <p><Flag size={16} className="inline mr-2" />{toCountryLabel(player.nationality)}</p>
                        <p><Calendar size={16} className="inline mr-2" />{player.dob}</p>
                        {/* ... Các thông tin khác ... */}
                    </div>
                    <div className="uefa-card p-6">
                        <h2 className="text-xl font-bold mb-4">Lịch sử thi đấu</h2>
                        <ul className="space-y-2">
                            {player.careerHistory.map(item => (
                                <li key={item.season} className="text-sm"><strong>{item.season}:</strong> {item.team}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfilePage;
