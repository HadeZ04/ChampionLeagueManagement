import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Layout
import PublicLayout from './components/PublicLayout';

// Import các trang
import HomePage from './pages/HomePage';
import StandingsPage from './pages/StandingsPage';
import MatchesPage from './pages/MatchesPage';
import TeamsPage from './pages/TeamsPage';
import StatsPage from './pages/StatsPage';
import NewsPage from './pages/NewsPage';
import VideoPage from './pages/VideoPage';
import GamingPage from './pages/GamingPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import TeamProfilePage from './pages/TeamProfilePage'; // <-- Đã sửa lỗi import
import LineupSubmissionPage from './pages/LineupSubmissionPage';

const PublicApp = () => {
  return (
    <Routes>
      {/* Sử dụng Layout Route để bọc các trang public */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="video" element={<VideoPage />} />
        <Route path="gaming" element={<GamingPage />} />
        <Route path="submit-lineup" element={<LineupSubmissionPage />} />

        {/* Thêm các Route động cho trang chi tiết */}
        <Route path="teams/:teamId" element={<TeamProfilePage />} />
        <Route path="players/:playerId" element={<PlayerProfilePage />} />
      </Route>
    </Routes>
  );
};

export default PublicApp;