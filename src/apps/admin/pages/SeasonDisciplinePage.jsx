import React, { useEffect, useState } from 'react';
import { AlertTriangle, Ban, RefreshCw, Loader2, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const SeasonDisciplinePage = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [cardSummary, setCardSummary] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'suspensions'
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load seasons on mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load discipline data when season is selected
  useEffect(() => {
    if (selectedSeasonId) {
      loadDisciplineData();
    }
  }, [selectedSeasonId, statusFilter]);

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

  const loadDisciplineData = async () => {
    if (!selectedSeasonId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const suspensionsUrl = statusFilter === 'all' 
        ? `${API_BASE_URL}/seasons/${selectedSeasonId}/discipline/suspensions`
        : `${API_BASE_URL}/seasons/${selectedSeasonId}/discipline/suspensions?status=${statusFilter}`;
      
      const [cardsRes, suspensionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/seasons/${selectedSeasonId}/discipline/cards`, { headers }),
        axios.get(suspensionsUrl, { headers })
      ]);
      
      setCardSummary(cardsRes.data.data || []);
      setSuspensions(suspensionsRes.data.data || []);
    } catch (err) {
      console.error('Error loading discipline data:', err);
      setError(err.response?.data?.error || 'Không thể tải dữ liệu kỷ luật');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedSeasonId) return;
    
    if (!confirm('Bạn có chắc muốn tính toán lại dữ liệu kỷ luật? Thao tác này sẽ xóa các bản ghi cũ và tạo lại từ đầu.')) {
      return;
    }
    
    setRecalculating(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/seasons/${selectedSeasonId}/discipline/recalculate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Hoàn tất! ${response.data.data.created} treo giò mới, ${response.data.data.archived} bản ghi cũ đã lưu trữ.`);
      await loadDisciplineData(); // Reload data
    } catch (err) {
      console.error('Error recalculating:', err);
      setError(err.response?.data?.error || 'Không thể tính toán lại');
    } finally {
      setRecalculating(false);
    }
  };

  const selectedSeason = seasons.find(s => s.seasonId === selectedSeasonId);

  // Get unique teams for filter
  const teams = [...new Set(cardSummary.map(c => c.teamName))].sort();

  // Filter cards by team
  const filteredCards = teamFilter === 'all' 
    ? cardSummary 
    : cardSummary.filter(c => c.teamName === teamFilter);

  // Get reason display text
  const getReasonText = (reason) => {
    const reasons = {
      'RED_CARD': 'Thẻ đỏ',
      'TWO_YELLOW_CARDS': '2 thẻ vàng',
      'VIOLENT_CONDUCT': 'Hành vi bạo lực',
      'ACCUMULATION': 'Tích lũy',
      'OTHER': 'Khác'
    };
    return reasons[reason] || reason;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-red-100 text-red-700',
      'served': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-yellow-100 text-yellow-700',
      'archived': 'bg-slate-200 text-slate-600'
    };
    const labels = {
      'active': 'Đang hiệu lực',
      'served': 'Đã thi hành',
      'cancelled': 'Đã hủy',
      'archived': 'Lưu trữ'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          Kỷ luật mùa giải
        </h1>
        <p className="text-gray-600 mt-2">
          Thống kê thẻ phạt và danh sách cầu thủ bị treo giò
        </p>
      </div>

      {/* Season Selector & Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn mùa giải
            </label>
            <select
              value={selectedSeasonId || ''}
              onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {seasons.map(season => (
                <option key={season.seasonId} value={season.seasonId}>
                  {season.name} ({season.seasonYear})
                </option>
              ))}
            </select>
            {selectedSeason && (
              <div className="mt-2 text-sm text-gray-600">
                Trạng thái: <span className="font-medium">{selectedSeason.status}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleRecalculate}
            disabled={recalculating || !selectedSeasonId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {recalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tính...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Tính lại kỷ luật
              </>
            )}
          </button>
        </div>
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
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Thống kê thẻ phạt
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suspensions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'suspensions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Danh sách treo giò
                {suspensions.filter(s => s.status === 'active').length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {suspensions.filter(s => s.status === 'active').length}
                  </span>
                )}
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

        {/* Cards Tab */}
        {!loading && activeTab === 'cards' && (
          <div className="p-6">
            {/* Team Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo đội
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả đội</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có dữ liệu thẻ phạt</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
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
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-4 h-6 bg-yellow-400 rounded-sm border border-gray-300"></div>
                          Vàng
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-4 h-6 bg-red-500 rounded-sm border border-gray-300"></div>
                          Đỏ
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Trận đấu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCards.map((card) => (
                      <tr
                        key={card.seasonPlayerId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {card.playerName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {card.teamName}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {card.shirtNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                            card.yellowCards >= 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {card.yellowCards}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                            card.redCards > 0 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {card.redCards}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {card.matchesPlayed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Suspensions Tab */}
        {!loading && activeTab === 'suspensions' && (
          <div className="p-6">
            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hiệu lực</option>
                <option value="served">Đã thi hành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            {suspensions.length === 0 ? (
              <div className="text-center py-12">
                <Ban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có dữ liệu treo giò</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Cầu thủ
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Đội bóng
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Lý do
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Trận bị cấm
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Số trận
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspensions.map((suspension) => (
                      <tr
                        key={suspension.suspensionId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">
                            {suspension.playerName}
                          </div>
                          {suspension.shirtNumber && (
                            <div className="text-xs text-gray-500">
                              #{suspension.shirtNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {suspension.teamName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {getReasonText(suspension.reason)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {suspension.startMatchInfo ? (
                            <div className="text-sm text-gray-700">
                              {suspension.startMatchInfo}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Chưa xác định</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {suspension.servedMatches}/{suspension.matchesBanned}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(suspension.status)}
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

export default SeasonDisciplinePage;
