import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SeasonFormModal from '../components/SeasonFormModal'; // Component modal sẽ tạo ở bước 2

// --- Giả lập API Service ---
const FAKE_SEASONS_DB = [
  { id: 1, name: 'Champion League 2025/26', ruleset: 'Điều lệ CL 2025', status: 'Sắp diễn ra', startDate: '2025-09-01', endDate: '2026-05-30' },
  { id: 2, name: 'Champion League 2024/25', ruleset: 'Điều lệ CL 2024', status: 'Đã kết thúc', startDate: '2024-09-01', endDate: '2025-05-31' },
];

const seasonService = {
  getSeasons: async () => new Promise(resolve => setTimeout(() => resolve({ data: FAKE_SEASONS_DB }), 500)),
  saveSeason: async (seasonData) => {
    console.log("Saving season:", seasonData);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }
};
// --- Hết phần giả lập ---

const SeasonManagement = () => {
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);

  useEffect(() => {
    const fetchSeasons = async () => {
      setIsLoading(true);
      const response = await seasonService.getSeasons();
      setSeasons(response.data);
      setIsLoading(false);
    };
    fetchSeasons();
  }, []);

  const handleOpenModal = (season = null) => {
    setEditingSeason(season);
    setIsModalOpen(true);
  };

  const handleSave = async (seasonData) => {
    await seasonService.saveSeason(seasonData);
    // TODO: Tải lại danh sách mùa giải và đóng modal
    setIsModalOpen(false);
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      'Sắp diễn ra': 'bg-blue-100 text-blue-800',
      'Đang diễn ra': 'bg-green-100 text-green-800',
      'Đã kết thúc': 'bg-gray-100 text-gray-800',
      'Tạm hoãn': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Mùa giải</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Plus size={18} />
          Tạo Mùa giải mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Tên Mùa giải</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Bộ Điều lệ</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-10">Đang tải...</td></tr>
            ) : seasons.map(season => (
              <tr key={season.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{season.name}</td>
                <td className="p-4 text-gray-600">{season.ruleset}</td>
                <td className="p-4 text-gray-600">{season.startDate} - {season.endDate}</td>
                <td className="p-4">{getStatusBadge(season.status)}</td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <button onClick={() => handleOpenModal(season)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SeasonFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        season={editingSeason}
      />
    </div>
  );
};

export default SeasonManagement;