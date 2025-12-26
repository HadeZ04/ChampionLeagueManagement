import React, { useEffect, useState } from 'react';
import { Award, Trophy, Users, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const SeasonAwardsPage = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [topScorers, setTopScorers] = useState([]);
  const [topMVPs, setTopMVPs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scorers'); // 'scorers' or 'mvps'

  // Load seasons on mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load awards when season is selected
  useEffect(() => {
    if (selectedSeasonId) {
      loadAwards();
    }
  }, [selectedSeasonId]);

  const loadSeasons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/seasons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeasons(response.data.data || []);
      
      // Auto-select first season
      if (response.data.data?.length > 0) {
        setSelectedSeasonId(response.data.data[0].seasonId);
      }
    } catch (err) {
      console.error('Error loading seasons:', err);
      setError('Không thể tải danh sách mùa giải');
    }
  };

  const loadAwards = async () => {
    if (!selectedSeasonId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [scorersRes, mvpsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/seasons/${selectedSeasonId}/awards/top-scorers?limit=20`, { headers }),
        axios.get(`${API_BASE_URL}/seasons/${selectedSeasonId}/awards/top-mvps?limit=20`, { headers })
      ]);
      
      setTopScorers(scorersRes.data.data || []);
      setTopMVPs(mvpsRes.data.data || []);
    } catch (err) {
      console.error('Error loading awards:', err);
      setError(err.response?.data?.error || 'Không thể tải dữ liệu giải thưởng');
    } finally {
      setLoading(false);
    }
  };

  const selectedSeason = seasons.find(s => s.seasonId === selectedSeasonId);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Giải thưởng mùa giải
        </h1>
        <p className="text-gray-600 mt-2">
          Vua phá lưới, cầu thủ xuất sắc nhất và các danh hiệu cá nhân
        </p>
      </div>

      {/* Season Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn mùa giải
        </label>
        <select
          value={selectedSeasonId || ''}
          onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {seasons.map(season => (
            <key={season.seasonId} value={season.seasonId}>
              {season.name} ({season.seasonYear})
            </key>
          ))}
        </select>
        {selectedSeason && (
          <div className="mt-2 text-sm text-gray-600">
            Trạng thái: <span className="font-medium">{selectedSeason.status}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Lỗi</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('scorers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scorers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Vua phá lưới
              </div>
            </button>
            <button
              onClick={() => setActiveTab('mvps')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'mvps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Cầu thủ xuất sắc
              </div>
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Top Scorers Tab */}
        {!loading && activeTab === 'scorers' && (
          <div className="p-6">
            {topScorers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có dữ liệu bàn thắng</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Hạng
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Cầu thủ
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Đội bóng
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Số áo
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Bàn thắng
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Trận đấu
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        TB/trận
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((scorer) => (
                      <tr
                        key={scorer.seasonPlayerId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {scorer.rank === 1 && (
                              <Trophy className="w-5 h-5 text-yellow-500" />
                            )}
                            {scorer.rank === 2 && (
                              <Trophy className="w-5 h-5 text-gray-400" />
                            )}
                            {scorer.rank === 3 && (
                              <Trophy className="w-5 h-5 text-orange-600" />
                            )}
                            <span className="font-semibold text-gray-800">
                              #{scorer.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {scorer.playerName}
                          </div>
                          {scorer.nationality && (
                            <div className="text-xs text-gray-500">
                              {scorer.nationality}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {scorer.teamName}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {scorer.shirtNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                            {scorer.goals}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {scorer.matchesPlayed}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {scorer.matchesPlayed > 0
                            ? (scorer.goals / scorer.matchesPlayed).toFixed(2)
                            : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Top MVPs Tab */}
        {!loading && activeTab === 'mvps' && (
          <div className="p-6">
            {topMVPs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có dữ liệu MVP</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Hạng
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Cầu thủ
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Đội bóng
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Số áo
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Số lần MVP
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Trận đấu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMVPs.map((mvp) => (
                      <tr
                        key={mvp.seasonPlayerId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {mvp.rank === 1 && (
                              <Trophy className="w-5 h-5 text-yellow-500" />
                            )}
                            {mvp.rank === 2 && (
                              <Trophy className="w-5 h-5 text-gray-400" />
                            )}
                            {mvp.rank === 3 && (
                              <Trophy className="w-5 h-5 text-orange-600" />
                            )}
                            <span className="font-semibold text-gray-800">
                              #{mvp.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {mvp.playerName}
                          </div>
                          {mvp.nationality && (
                            <div className="text-xs text-gray-500">
                              {mvp.nationality}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {mvp.teamName}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {mvp.shirtNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold">
                            {mvp.mvpCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {mvp.matchesPlayed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonAwardsPage;
