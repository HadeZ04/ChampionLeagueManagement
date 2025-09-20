import React, { useState, useEffect } from 'react';

const UserFormModal = ({ isOpen, onClose, onSave, user, roles }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    password: ''
  });

  const isEditing = !!user;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        password: '' // Không bao giờ hiển thị password cũ
      });
    } else {
      // Reset form khi mở modal để tạo mới
      setFormData({ username: '', email: '', firstName: '', lastName: '', role: '', password: '' });
    }
  }, [user, isOpen]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="p-2 border rounded" required />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded" required />
          </div>
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required />
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'New Password (leave blank to keep current)' : 'Password'} className="w-full p-2 border rounded" required={!isEditing} />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="" disabled>Select a role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;