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
              <h3 className="font-semibold text-gray-900 mb-4">Team Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Country:</span><span className="font-medium">{team.country}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">City:</span><span className="font-medium">{team.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Stadium:</span><span className="font-medium">{team.stadium}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Capacity:</span><span className="font-medium">{team.capacity.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Founded:</span><span className="font-medium">{team.founded}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Coach:</span><span className="font-medium">{team.coach}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Current Season</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Players:</span><span className="font-medium">{team.players}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Status:</span>{getStatusBadge(team.status)}</div>
                <div className="flex justify-between"><span className="text-gray-600">Last Updated:</span><span className="font-medium">{team.lastUpdated}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Edit Team</button>
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg">View Players</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;