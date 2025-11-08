import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader' // Import Header  ở đây

const AdminLayout = ({ onLogout, currentUser }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Truyền onLogout xuống cho AdminHeader */}
        <AdminHeader onLogout={onLogout} currentUser={currentUser} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
