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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? `Edit: ${team.name}` : 'Add New Team'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Team Name" className="w-full p-2 border rounded-lg" required/>
          <div className="grid grid-cols-2 gap-4">
            <input name="country" value={formData.country || ''} onChange={handleChange} placeholder="Country" className="p-2 border rounded-lg" required/>
            <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" className="p-2 border rounded-lg" required/>
          </div>
          <input name="stadium" value={formData.stadium || ''} onChange={handleChange} placeholder="Stadium" className="w-full p-2 border rounded-lg"/>
          <div className="grid grid-cols-2 gap-4">
            <input name="capacity" type="number" value={formData.capacity || ''} onChange={handleChange} placeholder="Capacity" className="p-2 border rounded-lg"/>
            <input name="founded" type="number" value={formData.founded || ''} onChange={handleChange} placeholder="Year Founded" className="p-2 border rounded-lg"/>
          </div>
          <input name="coach" value={formData.coach || ''} onChange={handleChange} placeholder="Coach Name" className="w-full p-2 border rounded-lg"/>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Save Team</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;