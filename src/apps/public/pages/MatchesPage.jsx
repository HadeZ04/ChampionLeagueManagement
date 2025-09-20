import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import WeatherWidget from '../components/WeatherWidget';
import MatchPreview from '../components/MatchPreview';

// --- Giả lập API Service ---
// Trong thực tế, dữ liệu này sẽ được lấy từ backend sau khi admin tạo lịch.
const FAKE_SCHEDULE_FROM_DB = [
    { 
        id: 1, date: '2025-09-17', time: '21:00', status: 'upcoming', 
        homeTeam: { name: 'Liverpool', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png', shortName: 'LIV' }, 
        awayTeam: { name: 'Barcelona', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png', shortName: 'BAR' }, 
        matchday: 1, venue: 'Anfield', city: 'Liverpool', tvChannels: ['BT Sport 1'] 
    },
    { 
        id: 2, date: '2025-09-17', time: '21:00', status: 'upcoming', 
        homeTeam: { name: 'Arsenal', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png', shortName: 'ARS' }, 
        awayTeam: { name: 'Newcastle', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52281.png', shortName: 'NEW' }, 
        matchday: 1, venue: 'Emirates Stadium', city: 'London', tvChannels: ['CBS Sports'] 
    },
    { 
        id: 3, date: '2025-09-18', time: '18:45', status: 'finished', 
        homeTeam: { name: 'Juventus', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50139.png', shortName: 'JUV' }, 
        awayTeam: { name: 'Real Madrid', logo: 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50051.png', shortName: 'RMA' }, 
        matchday: 1, venue: 'Allianz Stadium', city: 'Turin', tvChannels: [] 
    },
];

const matchService = {
    getMatches: async () => new Promise(resolve => setTimeout(() => resolve({ data: FAKE_SCHEDULE_FROM_DB }), 500)),
};
// --- Hết giả lập ---

const MatchesPage = () => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('2025-09-17');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        setIsLoading(true);
        matchService.getMatches()
            .then(response => {
                setMatches(response.data);
            })
            .catch(err => console.error("Failed to fetch matches:", err))
            .finally(() => setIsLoading(false));
    }, []);

    const filters = [
        { id: 'all', name: 'All Matches' },
        { id: 'today', name: 'Today' },
        { id: 'live', name: 'Live' },
        { id: 'upcoming', name: 'Upcoming' },
        { id: 'finished', name: 'Finished' }
    ];

    const filteredMatches = matches.filter(match => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'today') return match.date === new Date().toISOString().split('T')[0];
        return match.status === selectedFilter;
    });

    const groupedMatches = filteredMatches.reduce((groups, match) => {
        const date = match.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(match);
        return groups;
    }, {});

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="uefa-container py-8 text-center">
                <p className="text-xl font-semibold">Loading Matches...</p>
            </div>
        );
    }
    
    return (
        <div className="uefa-container py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="uefa-section-title">UEFA Champions League Matches</h1>
                <p className="uefa-section-subtitle">Fixtures and results for the 2024/25 season</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="uefa-filter-tabs">
                    {filters.map((filter) => (
                        <button key={filter.id} onClick={() => setSelectedFilter(filter.id)} className={`uefa-filter-tab ${selectedFilter === filter.id ? 'active' : ''}`}>
                            {filter.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-500" />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="uefa-input"/>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Matches List */}
                <div className="lg:col-span-3">
                    <div className="space-y-8">
                        {Object.keys(groupedMatches).length > 0 ? Object.entries(groupedMatches).map(([date, dayMatches]) => (
                            <div key={date}>
                                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg">
                                    <div>
                                        <h2 className="text-xl font-bold">{formatDate(date)}</h2>
                                        <div className="text-sm opacity-90">Matchday {dayMatches[0]?.matchday} • {dayMatches.length} matches</div>
                                    </div>
                                    <div className="text-right text-sm opacity-90">
                                        <div>Champions League</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {dayMatches.map((match) => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            </div>
                        )) : (
                             <div className="text-center py-12 bg-white rounded-lg shadow">
                                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches found</h3>
                                <p className="text-gray-500">Try adjusting your filters or select a different date.</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <WeatherWidget city="Liverpool" temperature="8°C" condition="Partly Cloudy" />
                    <div className="uefa-card p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Tv size={20} className="mr-2 text-blue-700" /> TV Schedule
                        </h3>
                        <div className="space-y-3">
                            {matches.filter(m => m.status === 'upcoming' && m.tvChannels).slice(0, 3).map((match) => (
                                <div key={match.id} className="p-3 bg-gray-100 rounded">
                                    <div className="font-semibold text-gray-800 text-sm">
                                        {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {match.time} • {match.tvChannels.join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Match Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium transition-colors">
                    <ChevronLeft size={16} />
                    <span>Previous Matchday</span>
                </button>
                <div className="text-gray-600 text-sm font-semibold">Matchday 1</div>
                <button className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium transition-colors">
                    <span>Next Matchday</span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default MatchesPage;