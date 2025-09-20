import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Edit, Trash2, Eye, Lock, Unlock, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import UserFormModal from '../components/UserFormModal';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Giả lập API Service ---
const FAKE_USERS_DB = [
  { id: 1, username: 'admin', email: 'admin@uefa.com', firstName: 'UEFA', lastName: 'Administrator', role: 'super_admin', status: 'active', lastLogin: '2025-01-22 14:30', createdAt: '2024-09-01' },
  { id: 2, username: 'content_manager', email: 'content@uefa.com', firstName: 'Content', lastName: 'Manager', role: 'content_manager', status: 'active', lastLogin: '2025-01-22 12:15', createdAt: '2024-09-15' },
  { id: 3, username: 'match_official', email: 'matches@uefa.com', firstName: 'Match', lastName: 'Official', role: 'match_official', status: 'suspended', lastLogin: '2025-01-21 18:45', createdAt: '2024-10-01' },
  // Thêm dữ liệu để test pagination
];

const userService = {
  getUsers: async (filters) => {
    console.log("Fetching users with filters:", filters);
    return new Promise(resolve => setTimeout(() => resolve({ data: FAKE_USERS_DB }), 500));
  },
  createUser: async (userData) => {
    console.log("Creating user:", userData);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  },
  updateUser: async (userId, userData) => {
    console.log(`Updating user ${userId}:`, userData);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  },
  deleteUser: async (userId) => {
     console.log(`Deleting user ${userId}`);
     return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }
};
// --- Hết phần giả lập API ---


const UsersManagement = () => {
  // States
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null: add mode, object: edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Data
  const roles = [ { id: 'all', name: 'All Roles' }, { id: 'super_admin', name: 'Super Admin' }, { id: 'admin', name: 'Admin' }, { id: 'content_manager', name: 'Content Manager' }, { id: 'match_official', name: 'Match Official' }, { id: 'viewer', name: 'Viewer' }];
  const statuses = [ { id: 'all', name: 'All Status' }, { id: 'active', name: 'Active' }, { id: 'inactive', name: 'Inactive' }, { id: 'suspended', name: 'Suspended' }];

  // Fetch data
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const filters = { search: searchTerm, role: selectedRole, status: selectedStatus };
        const response = await userService.getUsers(filters);
        // Lọc ở client side (cho mục đích demo, thực tế nên làm ở backend)
        const filtered = response.data.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'all' || user.role === selectedRole;
            const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
        setUsers(filtered);
      } catch (error) {
        toast.error("Failed to fetch users.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [searchTerm, selectedRole, selectedStatus]);


  // Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };
  
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteConfirm = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    const isEditing = !!editingUser;
    const promise = isEditing 
      ? userService.updateUser(editingUser.id, userData)
      : userService.createUser(userData);

    toast.promise(promise, {
      loading: isEditing ? 'Updating user...' : 'Creating user...',
      success: `User ${isEditing ? 'updated' : 'created'} successfully!`,
      error: `Failed to ${isEditing ? 'update' : 'create'} user.`,
    });
    
    const result = await promise;
    if (result.success) {
      // TODO: Tải lại danh sách user
      setIsFormModalOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const promise = userService.deleteUser(userToDelete.id);
    toast.promise(promise, {
      loading: 'Deleting user...',
      success: 'User deleted successfully!',
      error: 'Failed to delete user.',
    });

    const result = await promise;
    if (result.success) {
      // TODO: Tải lại danh sách user
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
     switch (status) {
       case 'active': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
       case 'inactive': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>;
       case 'suspended': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Suspended</span>;
       default: return null;
     }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
        'super_admin': { name: 'Super Admin', style: 'bg-red-100 text-red-800' },
        'admin': { name: 'Admin', style: 'bg-blue-100 text-blue-800' },
        'content_manager': { name: 'Content Manager', style: 'bg-purple-100 text-purple-800' },
        'match_official': { name: 'Match Official', style: 'bg-green-100 text-green-800' },
        'viewer': { name: 'Viewer', style: 'bg-gray-100 text-gray-800' }
    };
    const roleInfo = roleMap[role] || { name: 'Unknown', style: '' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.style}`}>{roleInfo.name}</span>;
  };
  

  return (
    <div>
      <Toaster position="top-right" />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={16} />
              <span>Export Users</span>
            </button>
            <button onClick={handleOpenAddModal} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search users by name, email, username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex space-x-4">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-white">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-500 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button onClick={() => handleOpenEditModal(user)} className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit User"><Edit size={16} /></button>
                      <button className="text-green-600 hover:text-green-900 transition-colors" title={user.status === 'active' ? 'Lock User' : 'Unlock User'}>{user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}</button>
                      <button onClick={() => handleOpenDeleteConfirm(user)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete User"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* TODO: Add Pagination Component */}
      </div>

      {/* Modals */}
      <UserFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        roles={roles.filter(r => r.id !== 'all')}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UsersManagement;