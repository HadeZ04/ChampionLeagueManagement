import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, BarChartHorizontal } from 'lucide-react';

// --- Giả lập API Service ---
const FAKE_TOP_SCORERS = [
  { rank: 1, playerName: 'Robert Lewandowski', team: 'Barcelona', goals: 7 },
  { rank: 2, playerName: 'Mohamed Salah', team: 'Liverpool', goals: 5 },
  { rank: 3, playerName: 'Bukayo Saka', team: 'Arsenal', goals: 3 },
];
const statsService = {
  getTopScorers: async (seasonId) => new Promise(resolve => setTimeout(() => resolve({ data: FAKE_TOP_SCORERS }), 500)),
};
// --- Hết giả lập ---

const TopScorersList = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
                <p className="text-slate-300">Chưa có dữ liệu thống kê</p>
            </div>
        );
    }
    return (
        <div className="bg-[#020617]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <table className="w-full">
                <thead className="bg-gradient-to-r from-[#1E3A8A] to-[#4C1D95]">
                    <tr>
                        <th className="p-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Hạng</th>
                        <th className="p-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Cầu thủ</th>
                        <th className="p-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Đội</th>
                        <th className="p-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Bàn thắng</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((player, idx) => (
                        <tr key={player.rank} className={`transition-colors hover:bg-white/10 ${
                            idx === 0 ? 'bg-yellow-500/10' : ''
                        }`}>
                            <td className="p-4 text-center">
                                <span className={`font-bold text-lg ${
                                    player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-slate-300' : player.rank === 3 ? 'text-orange-400' : 'text-slate-400'
                                }`}>{player.rank}</span>
                            </td>
                            <td className="p-4">
                                <span className="font-semibold text-white">{player.playerName}</span>
                            </td>
                            <td className="p-4">
                                <span className="text-slate-300">{player.team}</span>
                            </td>
                            <td className="p-4 text-center">
                                <span className="font-bold text-xl text-cyan-400">{player.goals}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const StatsPage = () => {
    const [activeTab, setActiveTab] = useState('top_scorers');
    const [topScorers, setTopScorers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch data based on active tab
        if (activeTab === 'top_scorers') {
            setIsLoading(true);
            statsService.getTopScorers(1).then(response => {
                setTopScorers(response.data);
                setIsLoading(false);
            });
        }
        // TODO: Add logic for other tabs (assists, cards...)
    }, [activeTab]);

    const tabs = [
        { id: 'top_scorers', name: 'Vua phá lưới', icon: Award },
        { id: 'top_assists', name: 'Vua kiến tạo', icon: BarChartHorizontal },
        { id: 'discipline', name: 'Thẻ phạt', icon: ShieldAlert },
    ];

    return (
        <div className="uefa-container py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Thống kê cầu thủ & đội bóng</h1>
            
            <div className="overflow-x-auto no-scrollbar mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 p-1 border border-white/10">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'bg-gradient-to-r from-[#2563EB] to-[#22C55E] text-white shadow-sm' 
                                    : 'text-slate-200/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-300'} />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {isLoading ? <p>Đang tải thống kê...</p> : (
                    <>
                        {activeTab === 'top_scorers' && <TopScorersList data={topScorers} />}
                        {/* Render content for other tabs here */}
                    </>
                )}
            </div>
        </div>
    );
};

export default StatsPage;
