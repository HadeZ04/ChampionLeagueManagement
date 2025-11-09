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
import RulesetManagement from './pages/RulesetManagement'
import LeaderboardManagement from './pages/LeaderboardManagement'
import PlayerStatsManagement from './pages/PlayerStatsManagement'
import RolesPermissions from './pages/RolesPermissions'
import AuditLog from './pages/AuditLog'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import StandingsPage from "../public/pages/StandingsPage";
import StandingsManagement from './pages/StandingsManagement';
import SeasonManagement from './pages/SeasonManagement'
import MatchDayManagement from './pages/MatchDayManagement';
import LiveMatchUpdatePage from './pages/LiveMatchUpdatePage';
import AccessGuard from './components/AccessGuard';

const AdminApp = ({ onLogout, currentUser }) => {
  return (
    <Routes>
      {/* 2. Dùng AdminLayout làm route cha */}
      {/* Prop onLogout được truyền vào Layout để nó có thể truyền xuống Header */}
      <Route path="/" element={<AdminLayout onLogout={onLogout} currentUser={currentUser} />}>
        
        {/* 3. Các trang con sẽ được render bên trong <Outlet/> của AdminLayout */}
        <Route index element={<DashboardPage />} /> {/* trang mặc định khi vào /admin */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="teams"
          element={
            <AccessGuard permission="manage_teams" currentUser={currentUser}>
              <TeamsManagement />
            </AccessGuard>
          }
        />
        <Route
          path="matches"
          element={
            <AccessGuard permission="manage_matches" currentUser={currentUser}>
              <MatchesManagement />
            </AccessGuard>
          }
        />
        <Route
          path="players"
          element={
            <AccessGuard permission="manage_teams" currentUser={currentUser}>
              <PlayersManagement />
            </AccessGuard>
          }
        />
        <Route path="standings" element={<StandingsManagement />} />
        <Route path="standings/view" element={<StandingsPage />} />
        <Route
          path="news"
          element={
            <AccessGuard permission="manage_content" currentUser={currentUser}>
              <NewsManagement />
            </AccessGuard>
          }
        />
        <Route
          path="users"
          element={
            <AccessGuard permission="manage_users" currentUser={currentUser}>
              <UsersManagement />
            </AccessGuard>
          }
        />
        <Route
          path="rulesets"
          element={
            <AccessGuard permission="manage_rulesets" currentUser={currentUser}>
              <RulesetManagement />
            </AccessGuard>
          }
        />
        <Route
          path="leaderboard"
          element={
            <AccessGuard permission="manage_matches" currentUser={currentUser}>
              <LeaderboardManagement />
            </AccessGuard>
          }
        />
        <Route
          path="player-stats"
          element={
            <AccessGuard permission="manage_matches" currentUser={currentUser}>
              <PlayerStatsManagement />
            </AccessGuard>
          }
        />
        <Route
          path="roles"
          element={
            <AccessGuard permission="manage_users" currentUser={currentUser}>
              <RolesPermissions />
            </AccessGuard>
          }
        />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="audit-log"
          element={
            <AccessGuard permission="view_audit_logs" currentUser={currentUser}>
              <AuditLog />
            </AccessGuard>
          }
        />
        <Route
          path="settings"
          element={
            <AccessGuard permission="manage_users" currentUser={currentUser}>
              <SettingsPage />
            </AccessGuard>
          }
        />
        <Route
          path="seasons"
          element={
            <AccessGuard permission="manage_teams" currentUser={currentUser}>
              <SeasonManagement />
            </AccessGuard>
          }
        />
        <Route
          path="matches-today"
          element={
            <AccessGuard permission="manage_matches" currentUser={currentUser}>
              <MatchDayManagement />
            </AccessGuard>
          }
        />
        <Route
          path="matches/:matchId/live"
          element={
             <AccessGuard permission="manage_matches" currentUser={currentUser}>
              <LiveMatchUpdatePage />
            </AccessGuard>
          }
        />
      </Route>

      {/* Bạn có thể thêm các route không cần layout ở đây, ví dụ: */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  )
}

export default AdminApp
