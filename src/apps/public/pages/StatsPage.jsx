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
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                        <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase">Goals</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map(player => (
                        <tr key={player.rank} className="hover:bg-gray-50">
                            <td className="p-4 text-center font-bold text-lg">{player.rank}</td>
                            <td className="p-4 font-semibold">{player.playerName}</td>
                            <td className="p-4 text-gray-600">{player.team}</td>
                            <td className="p-4 text-center font-bold text-xl text-blue-700">{player.goals}</td>
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
        { id: 'top_scorers', name: 'Top Scorers', icon: Award },
        { id: 'top_assists', name: 'Top Assists', icon: BarChartHorizontal },
        { id: 'discipline', name: 'Discipline', icon: ShieldAlert },
    ];

    return (
        <div className="uefa-container py-8">
            <h1 className="uefa-section-title mb-6">Player & Team Statistics</h1>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <tab.icon size={16} /> {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {isLoading ? <p>Loading stats...</p> : (
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