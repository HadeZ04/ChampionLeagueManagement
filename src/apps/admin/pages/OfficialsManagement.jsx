import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader,
  Shield,
  Award,
  UserCheck,
  X
} from 'lucide-react';
import OfficialService from '../../../layers/application/services/OfficialService';
import ConfirmationModal from '../components/ConfirmationModal';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  suspended: 'Đình chỉ',
};

const OfficialsManagement = () => {
  const [officials, setOfficials] = useState([]);
  const [metadata, setMetadata] = useState({
    specialties: [],
    statuses: [],
    specialtyLabels: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [officialToDelete, setOfficialToDelete] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    roleSpecialty: 'referee',
    licenseNumber: '',
    federationLevel: '',
    status: 'active',
    notes: '',
  });

  const loadMetadata = useCallback(async () => {
    try {
      const response = await OfficialService.getMetadata();
      setMetadata(response);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, []);

  const loadOfficials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await OfficialService.listOfficials({
        status: statusFilter || undefined,
        roleSpecialty: specialtyFilter || undefined,
        search: searchTerm || undefined,
      });
      setOfficials(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách trọng tài/giám sát: ' + err.message);
      setOfficials([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, specialtyFilter]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    loadOfficials();
  }, [loadOfficials]);

  const handleOpenModal = (official = null) => {
    if (official) {
      setEditingOfficial(official);
      setFormData({
        fullName: official.fullName || '',
        roleSpecialty: official.roleSpecialty || 'referee',
        licenseNumber: official.licenseNumber || '',
        federationLevel: official.federationLevel || '',
        status: official.status || 'active',
        notes: official.notes || '',
      });
    } else {
      setEditingOfficial(null);
      setFormData({
        fullName: '',
        roleSpecialty: 'referee',
        licenseNumber: '',
        federationLevel: '',
        status: 'active',
        notes: '',
      });
    }
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOfficial(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingOfficial) {
        await OfficialService.updateOfficial(editingOfficial.officialId, formData);
        setSuccess('Đã cập nhật thông tin thành công');
      } else {
        await OfficialService.createOfficial(formData);
        setSuccess('Đã thêm trọng tài/giám sát mới');
      }
      handleCloseModal();
      loadOfficials();
    } catch (err) {
      setError(err.message || 'Không thể lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!officialToDelete) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      await OfficialService.deleteOfficial(officialToDelete.officialId);
      setSuccess(`Đã xóa "${officialToDelete.fullName}"`);
      setOfficialToDelete(null);
      loadOfficials();
    } catch (err) {
      setError('Không thể xóa: ' + err.message);
    }
  };

  const getSpecialtyLabel = (specialty) => {
    return metadata.specialtyLabels?.[specialty] || specialty;
  };

  const getSpecialtyIcon = (specialty) => {
    switch (specialty) {
      case 'referee':
        return <Shield size={16} className="text-blue-600" />;
      case 'assistant':
        return <UserCheck size={16} className="text-green-600" />;
      case 'match_commissioner':
      case 'supervisor':
        return <Award size={16} className="text-purple-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-blue-600" />
            Quản Lý Trọng Tài & Giám Sát
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách trọng tài, giám sát viên và phân công trận đấu
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadOfficials}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, số giấy phép..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            {metadata.statuses?.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Specialty Filter */}
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả chuyên môn</option>
            {metadata.specialties?.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Stats */}
          <div className="flex items-center justify-end text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {officials.length} trọng tài/giám sát
            </span>
          </div>
        </div>
      </div>

      {/* Officials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : officials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Chưa có trọng tài/giám sát nào</p>
            <p className="text-sm mt-1">Nhấn "Thêm mới" để tạo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Họ và tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chuyên môn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Số giấy phép
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cấp độ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {officials.map((official) => (
                  <tr key={official.officialId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getSpecialtyIcon(official.roleSpecialty)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {official.fullName}
                          </div>
                          {official.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {official.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {getSpecialtyIcon(official.roleSpecialty)}
                        {getSpecialtyLabel(official.roleSpecialty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {official.licenseNumber || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {official.federationLevel || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[official.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[official.status] || official.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(official)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setOfficialToDelete(official)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingOfficial ? 'Chỉnh sửa thông tin' : 'Thêm trọng tài/giám sát'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Role Specialty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên môn <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleSpecialty}
                    onChange={(e) => setFormData({ ...formData, roleSpecialty: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {metadata.specialties?.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số giấy phép
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VFF-001234"
                    />
                  </div>

                  {/* Federation Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp độ
                    </label>
                    <input
                      type="text"
                      value={formData.federationLevel}
                      onChange={(e) => setFormData({ ...formData, federationLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="FIFA, AFC, Quốc gia..."
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {metadata.statuses?.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Thông tin bổ sung..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        {editingOfficial ? 'Cập nhật' : 'Tạo mới'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {officialToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Xóa trọng tài/giám sát"
          message={`Bạn có chắc chắn muốn xóa "${officialToDelete.fullName}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setOfficialToDelete(null)}
          isProcessing={false}
        />
      )}
    </div>
  );
};

export default OfficialsManagement;
