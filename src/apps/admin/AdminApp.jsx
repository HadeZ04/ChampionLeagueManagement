import React from 'react'
import { Routes, Route } from 'react-router-dom'

// 1. Chỉ cần import Layout và các trang
import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import TeamsManagement from './pages/TeamsManagement'
import MatchesManagement from './pages/MatchesManagement'
import PlayersManagement from './pages/PlayersManagement'
import NewsManagement from './pages/NewsManagement'
import UsersManagement from './pages/UsersManagement'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import StandingsPage from "../public/pages/StandingsPage";
import SeasonManagement from './pages/SeasonManagement'
import MatchDayManagement from './pages/MatchDayManagement';
import LiveMatchUpdatePage from './pages/LiveMatchUpdatePage';

const AdminApp = ({ onLogout }) => {
  return (
    <Routes>
      {/* 2. Dùng AdminLayout làm route cha */}
      {/* Prop onLogout được truyền vào Layout để nó có thể truyền xuống Header */}
      <Route path="/" element={<AdminLayout onLogout={onLogout} />}>
        
        {/* 3. Các trang con sẽ được render bên trong <Outlet/> của AdminLayout */}
        <Route index element={<DashboardPage />} /> {/* trang mặc định khi vào /admin */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="teams" element={<TeamsManagement />} />
        <Route path="matches" element={<MatchesManagement />} />
        <Route path="players" element={<PlayersManagement />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="seasons" element={<SeasonManagement />} />
        <Route path="matches-today" element={<MatchDayManagement />} />
        <Route path="matches/:matchId/live" element={<LiveMatchUpdatePage />} />
      </Route>

      {/* Bạn có thể thêm các route không cần layout ở đây, ví dụ: */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  )
}

export default AdminApp