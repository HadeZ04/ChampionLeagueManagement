import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import backgroundImage from '@/assets/images/background.jpg'
import AdminHeader from './AdminHeader'

const AdminLayout = ({ onLogout, currentUser }) => {
  return (
    <div className="relative flex h-screen overflow-hidden admin-theme">
      {/* Multi-layer background */}
      <div className="absolute inset-0 -z-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" 
          style={{ backgroundImage: `url('${backgroundImage}')` }} 
        />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817]/95 via-[#0a1628]/90 to-[#071020]/95" />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slower" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        {/* Grid pattern */}
        <div className="absolute inset-0 ucl-grid-pattern opacity-20" />
        {/* Star particles */}
        <div className="absolute inset-0 ucl-stars-animated" />
      </div>
      
      <AdminSidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <AdminHeader onLogout={onLogout} currentUser={currentUser} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto ucl-scrollbar">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
