import React, { useState } from 'react';
import { generateRoundRobinSchedule } from '../../../lib/scheduleGenerator';
import { CalendarCheck, ListRestart, Save } from 'lucide-react';

// Giả lập danh sách đội đã được phê duyệt cho một mùa giải
const APPROVED_TEAMS = ['Liverpool', 'Barcelona', 'Arsenal', 'Newcastle', 'Juventus', 'Real Madrid'];

const ScheduleManagement = () => {
  const [schedule, setSchedule] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = () => {
    // Gọi thuật toán để tạo lịch
    const generatedFixtures = generateRoundRobinSchedule(APPROVED_TEAMS);
    setSchedule(generatedFixtures);
    setIsGenerated(true);
    // TODO: Gửi `generatedFixtures` lên API để lưu vào database
  };

  const handleReset = () => {
    setSchedule([]);
    setIsGenerated(false);
  };
  
  // Nhóm các trận đấu theo vòng
  const rounds = schedule.reduce((acc, match) => {
    acc[match.round] = acc[match.round] || [];
    acc[match.round].push(match);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-3">
          {isGenerated && (
             <button onClick={handleReset} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">
                <ListRestart size={18} /> Reset
             </button>
          )}
          <button 
            onClick={handleGenerate} 
            disabled={isGenerated}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
          >
            <CalendarCheck size={18} /> Generate Schedule
          </button>
        </div>
      </div>

      {!isGenerated ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold mb-4">Teams Approved for this Season ({APPROVED_TEAMS.length})</h2>
          <p className="text-gray-600 mb-4">Click "Generate Schedule" to automatically create fixtures for all approved teams.</p>
          <ul className="grid grid-cols-4 gap-2">
            {APPROVED_TEAMS.map(team => <li key={team} className="bg-gray-100 p-2 rounded">{team}</li>)}
          </ul>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                <Save size={18} /> Save All Changes
             </button>
          </div>
          {Object.entries(rounds).map(([roundNumber, matches]) => (
            <div key={roundNumber} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-3">Round {roundNumber}</h3>
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1 text-right font-semibold">{match.home}</div>
                    <div className="mx-4 text-gray-500">vs</div>
                    <div className="flex-1 text-left font-semibold">{match.away}</div>
                    {/* TODO: Thêm input để sửa ngày/giờ/sân */}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;