import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import HomePage from './pages/HomePage';
import StandingsPage from './pages/StandingsPage';
import MatchesPage from './pages/MatchesPage';
import TeamsPage from './pages/TeamsPage';
import StatsPage from './pages/StatsPage';
import NewsPage from './pages/NewsPage';
import VideoPage from './pages/VideoPage';
import GamingPage from './pages/GamingPage';
import TeamProfilePage from './pages/TeamProfilePage';
import LineupSubmissionPage from './pages/LineupSubmissionPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import MatchCenterPage from './pages/MatchCenterPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import PlayerLookup from '../../pages/PlayerLookup';

const PublicApp = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="standings" element={<StandingsPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="player-lookup" element={<PlayerLookup />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="video" element={<VideoPage />} />
        <Route path="gaming" element={<GamingPage />} />
        <Route path="match-center" element={<MatchCenterPage />} />
        <Route path="submit-lineup" element={<LineupSubmissionPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="teams/:teamId" element={<TeamProfilePage />} />
        <Route path="players/:playerId" element={<PlayerProfilePage />} />
      </Route>
    </Routes>
  );
};

export default PublicApp;
