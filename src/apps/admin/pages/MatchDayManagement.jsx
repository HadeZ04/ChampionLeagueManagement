import React from 'react';
import { useNavigate } from 'react-router-dom';

const MatchDayManagement = () => {
    const navigate = useNavigate();
    // TODO: Lấy danh sách trận đấu hôm nay từ API
    const FAKE_TODAY_MATCHES = [
        { id: 1, homeTeam: 'Liverpool', awayTeam: 'Barcelona', time: '21:00', status: 'upcoming' },
        { id: 2, homeTeam: 'Arsenal', awayTeam: 'Newcastle', time: '21:00', status: 'live' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quản lý trận đấu hôm nay</h1>
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                {FAKE_TODAY_MATCHES.map(match => (
                    <div key={match.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <span className="font-bold text-lg">{match.homeTeam} gặp {match.awayTeam}</span>
                            <span className="ml-4 text-gray-600">{match.time}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-sm rounded-full ${match.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                                {match.status === 'live' ? 'Trực tiếp' : 'Sắp diễn ra'}
                            </span>
                            <button 
                                onClick={() => navigate(`/admin/matches/${match.id}/live`)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {match.status === 'live' ? 'Tiếp tục cập nhật' : 'Bắt đầu cập nhật trực tiếp'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchDayManagement;
