import React, { useState, useEffect } from 'react';

// Giả lập dữ liệu cho các dropdown
const FAKE_RULESETS = [ { id: 1, name: 'Điều lệ CL 2024' }, { id: 2, name: 'Điều lệ CL 2025' }];
const FORMAT_OPTIONS = ['Vòng tròn tính điểm', 'Loại trực tiếp', 'Hỗn hợp'];
const STATUS_OPTIONS = ['Sắp diễn ra', 'Đang diễn ra', 'Tạm hoãn', 'Đã kết thúc'];

const SeasonFormModal = ({ isOpen, onClose, onSave, season }) => {
  const [formData, setFormData] = useState({});

  const isEditing = !!season;

  useEffect(() => {
    // Cập nhật form khi prop `season` thay đổi (khi mở modal để sửa)
    if (season) {
      setFormData({
        name: season.name || '',
        rulesetId: season.rulesetId || '',
        format: season.format || '',
        status: season.status || '',
        // Thêm các trường ngày tháng
      });
    } else {
      // Reset form khi tạo mới
      setFormData({ name: '', rulesetId: '', format: '', status: '' });
    }
  }, [season, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: season?.id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Chỉnh sửa Mùa giải' : 'Tạo Mùa giải mới'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tên Mùa giải</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Gán Bộ Điều lệ</label>
              <select name="rulesetId" value={formData.rulesetId || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                <option value="" disabled>Chọn điều lệ</option>
                {FAKE_RULESETS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block font-medium mb-1">Định dạng Giải đấu</label>
              <select name="format" value={formData.format || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                 <option value="" disabled>Chọn định dạng</option>
                 {FORMAT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          
          {/* TODO: Thêm các trường chọn mốc thời gian (ngày tháng) */}

           <div>
              <label className="block font-medium mb-1">Trạng thái</label>
              <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                 {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonFormModal;