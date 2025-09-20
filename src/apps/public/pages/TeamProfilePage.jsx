import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TeamProfilePage = () => {
    const { teamId } = useParams();
    
    // TODO: Dùng teamId để fetch thông tin chi tiết của đội từ API
    const FAKE_TEAM_DATA = {
        name: 'Liverpool',
        logoUrl: 'https://img.uefa.com/imgml/TP/teams/logos/140x140/7889.png',
        stadium: 'Anfield',
        coach: 'Arne Slot',
        squad: [
            { id: 1, name: 'Mohamed Salah', shirtNumber: 11 },
            { id: 2, name: 'Virgil van Dijk', shirtNumber: 4 },
            { id: 3, name: 'Alisson Becker', shirtNumber: 1 },
        ]
    };

    return (
        <div className="uefa-container py-8">
            <div className="flex items-center gap-6 mb-8">
                <img src={FAKE_TEAM_DATA.logoUrl} alt={FAKE_TEAM_DATA.name} className="w-24 h-24"/>
                <div>
                    <h1 className="text-5xl font-bold text-uefa-dark">{FAKE_TEAM_DATA.name}</h1>
                    <p className="text-gray-600">{FAKE_TEAM_DATA.stadium} • HLV: {FAKE_TEAM_DATA.coach}</p>
                </div>
            </div>

            {/* Squad List */}
            <div className="uefa-card p-6">
                <h2 className="text-xl font-bold mb-4">Current Squad</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {FAKE_TEAM_DATA.squad.map(player => (
                        <Link to={`/players/${player.id}`} key={player.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-center">
                            <p className="font-bold">{player.shirtNumber}</p>
                            <p className="text-sm">{player.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
             {/* TODO: Thêm các component hiển thị Lịch thi đấu và Thống kê của đội */}
        </div>
    );
};

export default TeamProfilePage;