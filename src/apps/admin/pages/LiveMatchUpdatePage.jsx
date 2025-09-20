import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Goal, PlusCircle, Replace, Flag, Square, ShieldCheck } from 'lucide-react';

const LiveMatchUpdatePage = () => {
    const { matchId } = useParams();
    // State để lưu các sự kiện, tỷ số, thời gian...
    const [events, setEvents] = useState([]);
    const [score, setScore] = useState({ home: 0, away: 0 });

    const handleAddEvent = (type) => {
        // TODO: Mở modal tương ứng để nhập chi tiết sự kiện
        const newEvent = { time: '45+1', type, description: `Goal for Liverpool!` };
        setEvents(prev => [newEvent, ...prev]);
        if (type === 'GOAL') {
            setScore(prev => ({ ...prev, home: prev.home + 1}));
        }
    };

    return (
        <div>
            <Link to="/admin/matches-today" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft size={16} />
                Back to Match List
            </Link>
            
            {/* Scoreboard */}
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-6 text-center">
                <div className="flex justify-center items-center gap-8">
                    <span className="text-3xl font-bold">Liverpool</span>
                    <span className="text-5xl font-bold">{score.home} - {score.away}</span>
                    <span className="text-3xl font-bold">Barcelona</span>
                </div>
                <div className="mt-2 text-yellow-400 font-bold text-2xl">45:00</div>
            </div>

            {/* Event Logging Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button onClick={() => handleAddEvent('GOAL')} className="p-4 bg-green-500 text-white rounded-lg flex flex-col items-center gap-2 hover:bg-green-600">
                    <Goal /> <span className="font-semibold">Goal</span>
                </button>
                <button onClick={() => handleAddEvent('CARD')} className="p-4 bg-yellow-500 text-white rounded-lg flex flex-col items-center gap-2 hover:bg-yellow-600">
                    <Square /> <span className="font-semibold">Card</span>
                </button>
                 <button onClick={() => handleAddEvent('SUBSTITUTION')} className="p-4 bg-blue-500 text-white rounded-lg flex flex-col items-center gap-2 hover:bg-blue-600">
                    <Replace /> <span className="font-semibold">Substitution</span>
                </button>
                <button onClick={() => handleAddEvent('OTHER')} className="p-4 bg-gray-500 text-white rounded-lg flex flex-col items-center gap-2 hover:bg-gray-600">
                    <PlusCircle /> <span className="font-semibold">Other Event</span>
                </button>
            </div>

            {/* Event Timeline */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                 <h2 className="font-bold mb-4">Match Timeline</h2>
                 <div className="space-y-3 max-h-64 overflow-y-auto">
                     {events.map((event, i) => (
                        <div key={i} className="text-sm"><strong>{event.time}'</strong> - {event.description}</div>
                     ))}
                 </div>
            </div>

            {/* Finalize Match */}
            <div className="mt-6 text-center">
                <button className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-3 mx-auto">
                    <ShieldCheck /> Confirm Final Result
                </button>
            </div>
        </div>
    );
};

export default LiveMatchUpdatePage;