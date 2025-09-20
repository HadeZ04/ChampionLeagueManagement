import React, { useState } from 'react';
import { Send } from 'lucide-react';

// Giả lập danh sách cầu thủ của đội đã được phê duyệt
const FAKE_ROSTER = [
  { id: 1, name: 'Alisson Becker', position: 'GK' },
  { id: 2, name: 'Trent Alexander-Arnold', position: 'DF' },
  { id: 3, name: 'Virgil van Dijk', position: 'DF' },
  { id: 4, name: 'Alexis Mac Allister', position: 'MF' },
  { id: 5, name: 'Mohamed Salah', position: 'FW' },
  { id: 6, name: 'Darwin Núñez', position: 'FW' },
  // ... thêm 20-25 cầu thủ
];

const LineupSubmissionPage = () => {
  const [startingXI, setStartingXI] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);

  const handlePlayerSelect = (player, listType) => {
    // Logic để thêm/xóa cầu thủ khỏi danh sách đá chính hoặc dự bị
    // Đảm bảo không quá 11 người đá chính
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gửi danh sách startingXI và substitutes lên API
    alert('Lineup submitted!');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Lineup Submission</h1>
      <p className="text-gray-600 mb-6">Match: Liverpool vs Barcelona - 2025-09-17</p>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
        {/* Cột 1: Toàn bộ danh sách cầu thủ */}
        <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-bold mb-4">Full Roster ({FAKE_ROSTER.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {FAKE_ROSTER.map(p => (
              <div key={p.id} className="p-2 border rounded flex justify-between items-center">
                <span>{p.name} ({p.position})</span>
                <div>
                  <button type="button" onClick={() => handlePlayerSelect(p, 'start')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-l">Start</button>
                  <button type="button" onClick={() => handlePlayerSelect(p, 'sub')} className="text-xs bg-gray-500 text-white px-2 py-1 rounded-r">Sub</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 2 & 3: Đội hình đá chính và dự bị */}
        <div className="col-span-2 space-y-6">
           <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="font-bold mb-4">Starting XI ({startingXI.length}/11)</h2>
              {/* Hiển thị danh sách startingXI */}
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="font-bold mb-4">Substitutes ({substitutes.length})</h2>
              {/* Hiển thị danh sách substitutes */}
           </div>
           <div className="text-right">
              <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold">
                 <Send size={18}/> Submit Lineup
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default LineupSubmissionPage;