import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, ShieldCheck, ShieldAlert, Clock, Edit } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ApprovalModal from '../components/ApprovalModal';

// --- Giả lập API Service cho quy trình phê duyệt ---
const FAKE_REGISTRATIONS_DB = [
  { id: 1, teamId: 1, teamName: 'Liverpool', seasonName: 'Champions League 2025/26', submittedAt: '2025-09-17', status: 'Approved' },
  { id: 2, teamId: 2, teamName: 'Barcelona', seasonName: 'Champions League 2025/26', submittedAt: '2025-09-18', status: 'Pending' },
  { id: 3, teamId: 3, teamName: 'Arsenal', seasonName: 'Champions League 2025/26', submittedAt: '2025-09-16', status: 'Rejected', reason: 'Invalid player age' },
];
const teamService = {
  getRegistrations: async () => new Promise(resolve => setTimeout(() => resolve({ data: FAKE_REGISTRATIONS_DB }), 500)),
};
// --- Hết giả lập ---

const TeamsManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    teamService.getRegistrations()
      .then(response => setRegistrations(response.data))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApprove = (id) => {
    toast.success(`Registration #${id} approved successfully!`);
    setSelectedRegistration(null);
    // TODO: Gọi API để cập nhật trạng thái và tải lại danh sách
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="flex items-center gap-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"><ShieldCheck size={14}/> Approved</span>;
      case 'Pending': return <span className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium"><Clock size={14}/> Pending</span>;
      case 'Rejected': return <span className="flex items-center gap-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"><ShieldAlert size={14}/> Rejected</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      {/* Page Header (đã cập nhật tiêu đề) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Registration Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve team profiles for the current season.</p>
      </div>

      {/* Filters (giữ nguyên) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* ... JSX cho bộ lọc của bạn ... */}
      </div>

      {/* Bảng hồ sơ đăng ký */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-10">Loading registrations...</td></tr>
            ) : registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{reg.teamName}</td>
                <td className="p-4">{reg.seasonName}</td>
                <td className="p-4">{reg.submittedAt}</td>
                <td className="p-4">{getStatusBadge(reg.status)}</td>
                <td className="p-4">
                  <button onClick={() => setSelectedRegistration(reg)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                    <Eye size={16} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Phê duyệt */}
      <ApprovalModal 
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        registration={selectedRegistration}
        onApprove={handleApprove}
      />
    </div>
  )
}

export default TeamsManagement