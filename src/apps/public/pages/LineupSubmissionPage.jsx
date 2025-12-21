import React, { useState } from 'react';
import { Send } from 'lucide-react';

// Giả lập danh sách cầu thủ của đội đã được phê duyệt
const FAKE_ROSTER = [
  { id: 1, name: 'Alisson Becker', position: 'TM' },
  { id: 2, name: 'Trent Alexander-Arnold', position: 'HV' },
  { id: 3, name: 'Virgil van Dijk', position: 'HV' },
  { id: 4, name: 'Alexis Mac Allister', position: 'TV' },
  { id: 5, name: 'Mohamed Salah', position: 'TĐ' },
  { id: 6, name: 'Darwin Núñez', position: 'TĐ' },
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
    alert('Đã gửi đội hình!');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Nộp đội hình</h1>
      <p className="text-gray-600 mb-6">Trận đấu: Liverpool gặp Barcelona - 2025-09-17</p>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
        {/* Cột 1: Toàn bộ danh sách cầu thủ */}
        <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-bold mb-4">Danh sách cầu thủ ({FAKE_ROSTER.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {FAKE_ROSTER.map(p => (
              <div key={p.id} className="p-2 border rounded flex justify-between items-center">
                <span>{p.name} ({p.position})</span>
                <div>
                  <button type="button" onClick={() => handlePlayerSelect(p, 'start')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-l">Đá chính</button>
                  <button type="button" onClick={() => handlePlayerSelect(p, 'sub')} className="text-xs bg-gray-500 text-white px-2 py-1 rounded-r">Dự bị</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 2 & 3: Đội hình đá chính và dự bị */}
        <div className="col-span-2 space-y-6">
           <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="font-bold mb-4">Đội hình xuất phát ({startingXI.length}/11)</h2>
              {/* Hiển thị danh sách startingXI */}
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="font-bold mb-4">Cầu thủ dự bị ({substitutes.length})</h2>
              {/* Hiển thị danh sách substitutes */}
           </div>
           <div className="text-right">
              <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold">
                 <Send size={18}/> Gửi đội hình
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default LineupSubmissionPage;
