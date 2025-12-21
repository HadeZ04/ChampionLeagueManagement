import React, { useState, useEffect } from 'react';

const TeamFormModal = ({ isOpen, onClose, onSave, team }) => {
  const isEditing = !!team;
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Đặt giá trị mặc định cho form tạo mới
    const initialData = { name: '', country: '', city: '', stadium: '', capacity: '', founded: '', coach: '' };
    // Nếu là chế độ sửa, dùng dữ liệu của team. Nếu không, dùng dữ liệu mặc định.
    setFormData(isEditing ? team : initialData);
  }, [team, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="admin-surface rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">{isEditing ? `Sửa: ${team.name}` : 'Thêm đội mới'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Tên đội" className="admin-input" required/>
          <div className="grid grid-cols-2 gap-4">
            <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="Quốc gia" className="admin-input" required/>
            <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="Thành phố" className="admin-input" required/>
          </div>
          <input name="stadium" value={formData.stadium || ''} onChange={handleChange} placeholder="Sân vận động" className="admin-input"/>
          <div className="grid grid-cols-2 gap-4">
            <input name="capacity" type="number" value={formData.capacity || ''} onChange={handleChange} placeholder="Sức chứa" className="admin-input"/>
            <input name="founded" type="number" value={formData.founded || ''} onChange={handleChange} placeholder="Năm thành lập" className="admin-input"/>
          </div>
          <input name="coach" value={formData.coach || ''} onChange={handleChange} placeholder="Huấn luyện viên" className="admin-input"/>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 admin-btn-secondary justify-center">Hủy</button>
            <button type="submit" className="flex-1 admin-btn-primary justify-center"><span>Lưu đội</span></button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;
