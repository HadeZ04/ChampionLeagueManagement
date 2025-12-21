import React from 'react';
import { X } from 'lucide-react';

const TeamDetailModal = ({ isOpen, onClose, team, getStatusBadge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin đội</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Quốc gia:</span><span className="font-medium">{team.country}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Thành phố:</span><span className="font-medium">{team.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sân vận động:</span><span className="font-medium">{team.stadium}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sức chứa:</span><span className="font-medium">{team.capacity.toLocaleString('vi-VN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Năm thành lập:</span><span className="font-medium">{team.founded}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Huấn luyện viên:</span><span className="font-medium">{team.coach}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Mùa hiện tại</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Cầu thủ:</span><span className="font-medium">{team.players}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span>{getStatusBadge(team.status)}</div>
                <div className="flex justify-between"><span className="text-gray-600">Cập nhật lần cuối:</span><span className="font-medium">{team.lastUpdated}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Sửa đội</button>
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg">Xem cầu thủ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;
