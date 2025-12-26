import React, { useState, useEffect } from 'react';
import {
  Trophy,
  RefreshCw,
  Plus,
  Edit2,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calculator,
  Loader,
  Users,
  UserPlus,
  Info
} from 'lucide-react';
import StandingsAdminService from '../../../layers/application/services/StandingsAdminService';
import SeasonService from '../../../layers/application/services/SeasonService';
import ApiService from '../../../layers/application/services/ApiService';
import SeasonFormModal from '../components/SeasonFormModal';
import TeamStandingsEditor from '../components/TeamStandingsEditor';
import ConfirmationModal from '../components/ConfirmationModal';

const StandingsManagement = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [standings, setStandings] = useState([]);
  const [standingsMode, setStandingsMode] = useState('live'); // 'live' or 'final'
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modals
  const [editingTeam, setEditingTeam] = useState(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [resetTeamId, setResetTeamId] = useState(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [seasonMetadata, setSeasonMetadata] = useState({ statuses: [], tournaments: [], rulesets: [] });
  const [seasonEditing, setSeasonEditing] = useState(null);
  const [isSeasonSaving, setIsSeasonSaving] = useState(false);
  const [seasonModalLoading, setSeasonModalLoading] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState(null);
  const [isSeasonDeleting, setIsSeasonDeleting] = useState(false);
  
  // Add Teams Modal State
  const [showAddTeamsModal, setShowAddTeamsModal] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isAddingTeams, setIsAddingTeams] = useState(false);
  const [participatingTeams, setParticipatingTeams] = useState([]);

  // Load seasons on mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load standings when season changes
  useEffect(() => {
    if (selectedSeason) {
      loadStandings();
    }
  }, [selectedSeason, standingsMode]); // Also reload when mode changes

  const loadSeasons = async (preferredSeasonId = null) => {
    try {
      const response = await StandingsAdminService.getSeasons();
      const seasonsData = (response && Array.isArray(response.data)) ? response.data : (Array.isArray(response) ? response : []);
      setSeasons(seasonsData);

      if (seasonsData.length === 0) {
        setSelectedSeason(null);
        return null;
      }

      const preferredId = preferredSeasonId != null ? Number(preferredSeasonId) : null;
      const candidateId = preferredId || selectedSeason;
      const matchedSeason = seasonsData.find((season) => season.id === candidateId);
      const seasonIdToSelect = matchedSeason ? matchedSeason.id : seasonsData[0].id;

      setSelectedSeason(seasonIdToSelect);
      return seasonIdToSelect;
    } catch (err) {
      setError('Không thể tải danh sách mùa giải: ' + err.message);
      setSeasons([]);
      setSelectedSeason(null);
      return null;
    }
  };

  const handleOpenSeasonModal = async (seasonId = null) => {
    setError(null);
    setSuccess(null);
    setSeasonModalLoading(true);
    try {
      const metadata = await SeasonService.getMetadata();
      let seasonDetail = null;
      if (seasonId) {
        seasonDetail = await SeasonService.getSeasonById(seasonId);
      }
      setSeasonMetadata(metadata);
      setSeasonEditing(seasonDetail);
      setIsSeasonModalOpen(true);
    } catch (err) {
      setError('Không thể tải dữ liệu mùa giải: ' + err.message);
    } finally {
      setSeasonModalLoading(false);
    }
  };

  const handleCloseSeasonModal = () => {
    setIsSeasonModalOpen(false);
    setSeasonEditing(null);
  };

  const handleSaveSeason = async (payload) => {
    setIsSeasonSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const hasEditingSeason = Boolean(seasonEditing && seasonEditing.id);
      const savedSeason = hasEditingSeason
        ? await SeasonService.updateSeason(seasonEditing.id, payload)
        : await SeasonService.createSeason(payload);

      setSuccess(
        hasEditingSeason
          ? 'Đã cập nhật mùa giải thành công.'
          : 'Đã tạo mùa giải mới thành công.'
      );

      handleCloseSeasonModal();
      const selectedId = await loadSeasons(savedSeason?.id ?? null);
      if (selectedId) {
        setSelectedSeason(selectedId);
      }
    } catch (err) {
      setError(err.message || 'Không thể lưu mùa giải. Vui lòng thử lại.');
    } finally {
      setIsSeasonSaving(false);
    }
  };

  const handleRequestDeleteSeason = (seasonId) => {
    if (!seasonId) {
      return;
    }
    const season = seasons.find((item) => item.id === seasonId);
    if (season) {
      setSeasonToDelete(season);
    }
  };

  const handleDeleteSeason = async () => {
    if (!seasonToDelete) {
      return;
    }

    setIsSeasonDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await SeasonService.deleteSeason(seasonToDelete.id);
      setSuccess(`Đã xóa mùa giải "${seasonToDelete.label ?? seasonToDelete.name ?? seasonToDelete.id}".`);
      setSeasonToDelete(null);
      setStandings([]);
      await loadSeasons();
    } catch (err) {
      setError(err.message || 'Không thể xóa mùa giải. Vui lòng thử lại.');
    } finally {
      setIsSeasonDeleting(false);
    }
  };

  const loadStandings = async () => {
    if (!selectedSeason) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await StandingsAdminService.getStandingsBySeason(selectedSeason, standingsMode);
      setStandings(response.data || []);
    } catch (err) {
      setError('Không thể tải bảng xếp hạng: ' + err.message);
      setStandings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await StandingsAdminService.initializeStandings(selectedSeason);
      setSuccess(response.message || 'Khởi tạo thành công!');
      setShowInitModal(false);
      await loadStandings();
    } catch (err) {
      setError('Khởi tạo thất bại: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculate = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await StandingsAdminService.calculateStandings(selectedSeason);
      setSuccess(response.message || 'Tính toán thành công!');
      setShowCalculateModal(false);
      await loadStandings();
    } catch (err) {
      setError('Tính toán thất bại: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTeam = async (seasonTeamId, updates) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await StandingsAdminService.updateTeamStandings(seasonTeamId, updates);
      setSuccess(response.message || 'Cập nhật thành công!');
      setEditingTeam(null);
      await loadStandings();
    } catch (err) {
      setError('Cập nhật thất bại: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetTeam = async () => {
    if (!resetTeamId) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await StandingsAdminService.resetTeamStandings(resetTeamId);
      setSuccess(response.message || 'Reset thành công!');
      setResetTeamId(null);
      await loadStandings();
    } catch (err) {
      setError('Reset thất bại: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load participating teams for a season
  const loadParticipatingTeams = async () => {
    if (!selectedSeason) return;
    try {
      const response = await ApiService.get(`/seasons/${selectedSeason}/participants`);
      setParticipatingTeams(response.data || []);
    } catch (err) {
      console.error('Failed to load participating teams:', err);
    }
  };

  // Load all available teams for adding to season
  const loadAvailableTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await ApiService.get('/teams?limit=1000');
      const allTeams = response.data || [];
      // Filter out teams already in the season
      const participatingIds = new Set(participatingTeams.map(t => t.team_id));
      const available = allTeams.filter(t => !participatingIds.has(t.team_id));
      setAvailableTeams(available);
    } catch (err) {
      setError('Không thể tải danh sách đội: ' + err.message);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Handle opening the add teams modal
  const handleOpenAddTeamsModal = async () => {
    await loadParticipatingTeams();
    setShowAddTeamsModal(true);
    setSelectedTeamIds([]);
    await loadAvailableTeams();
  };

  // Handle adding selected teams to season
  const handleAddTeamsToSeason = async () => {
    if (selectedTeamIds.length === 0) return;
    
    setIsAddingTeams(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await ApiService.post(`/seasons/${selectedSeason}/participants/bulk`, {
        teamIds: selectedTeamIds,
        status: 'active'
      });
      setSuccess(`Đã thêm ${response.data?.addedCount || selectedTeamIds.length} đội vào mùa giải!`);
      setShowAddTeamsModal(false);
      setSelectedTeamIds([]);
      await loadStandings();
    } catch (err) {
      setError('Thêm đội thất bại: ' + err.message);
    } finally {
      setIsAddingTeams(false);
    }
  };

  // Toggle team selection
  const toggleTeamSelection = (teamId) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  // Select all teams
  const selectAllTeams = () => {
    if (selectedTeamIds.length === availableTeams.length) {
      setSelectedTeamIds([]);
    } else {
      setSelectedTeamIds(availableTeams.map(t => t.team_id));
    }
  };

  const getStatusBadge = (position) => {
    if (position <= 8) {
      return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Qualified</span>;
    } else if (position <= 24) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">Playoff</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Eliminated</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Quản Lý Bảng Xếp Hạng
          </h1>
          <p className="text-gray-600 mt-1">
            Khởi tạo, tính toán và chỉnh sửa bảng xếp hạng
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleOpenAddTeamsModal}
            disabled={!selectedSeason || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus size={20} />
            Thêm Đội
          </button>

          <button
            onClick={() => setShowInitModal(true)}
            disabled={!selectedSeason || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={20} />
            Khởi Tạo
          </button>
          
          <button
            onClick={() => setShowCalculateModal(true)}
            disabled={!selectedSeason || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Calculator size={20} />
            Tính Toán
          </button>

          <button
            onClick={loadStandings}
            disabled={!selectedSeason || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Season Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Mùa Giải
            </label>
            <select
              value={selectedSeason ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSeason(value ? Number(value) : null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn mùa giải --</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label} ({season.year})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div className="w-full md:max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế Độ Xếp Hạng
            </label>
            <select
              value={standingsMode}
              onChange={(e) => setStandingsMode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedSeason}
            >
              <option value="live">Trong Mùa (LIVE)</option>
              <option value="final">Cuối Mùa (FINAL)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {standingsMode === 'live' 
                ? 'Chỉ xét điểm và hiệu số' 
                : 'Áp dụng đối đầu trực tiếp'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenSeasonModal()}
              disabled={seasonModalLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              Thêm Mùa Giải
            </button>
            <button
              onClick={() => selectedSeason && handleOpenSeasonModal(selectedSeason)}
              disabled={!selectedSeason || seasonModalLoading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Edit2 size={18} />
              Chỉnh Sửa
            </button>
            <button
              onClick={() => selectedSeason && handleRequestDeleteSeason(selectedSeason)}
              disabled={!selectedSeason || seasonModalLoading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          </div>
        </div>

        {seasonModalLoading && (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Đang tải dữ liệu mùa giải...</span>
          </p>
        )}

        {/* Mode Info Banner */}
        {selectedSeason && standingsMode === 'final' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Chế độ xếp hạng cuối mùa (FINAL)</p>
                <p className="text-amber-700">
                  Áp dụng đầy đủ quy tắc phân hạng: Điểm → Hiệu số → Đối đầu trực tiếp (H2H) → Bốc thăm (nếu cần).
                  Các đội có biểu tượng ⚖ được xếp hạng theo kết quả đối đầu.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Standings Table */}
      {selectedSeason && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={32} />
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Chưa có dữ liệu bảng xếp hạng</p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left text-sm text-blue-800">
                      <p className="font-medium mb-1">Hướng dẫn khởi tạo:</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>Thêm các đội bóng vào mùa giải</li>
                        <li>Nhấn "Khởi Tạo" để tạo bảng xếp hạng</li>
                        <li>Nhấn "Tính Toán" sau khi có kết quả trận đấu</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={handleOpenAddTeamsModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus size={18} />
                    Thêm Đội Vào Mùa Giải
                  </button>
                  <button
                    onClick={() => setShowInitModal(true)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={18} />
                    Khởi Tạo
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đội
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trận
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thắng
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hòa
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thua
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bàn Thắng
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hiệu Số
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    {standingsMode === 'final' && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tie-Break
                      </th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings.map((team, index) => (
                    <tr key={team.seasonTeamId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.rank || index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {team.teamName}
                            </div>
                            {team.shortName && (
                              <div className="text-sm text-gray-500">
                                {team.shortName}
                              </div>
                            )}
                          </div>
                          {/* Head-to-Head Indicator */}
                          {standingsMode === 'final' && team.tieBreakInfo?.usedHeadToHead && (
                            <div className="group relative">
                              <span className="text-lg cursor-help" title="Xếp hạng theo đối đầu">
                                ⚖
                              </span>
                              <div className="hidden group-hover:block absolute z-10 left-0 top-8 bg-gray-800 text-white text-xs rounded-lg p-2 w-64 shadow-lg">
                                <p className="font-semibold mb-1">Đối đầu trực tiếp (H2H)</p>
                                {team.tieBreakInfo.headToHeadRecords?.map((record, idx) => (
                                  <p key={idx} className="text-gray-200">
                                    vs {record.opponentTeamName}: {record.teamGoals}-{record.opponentGoals}
                                  </p>
                                ))}
                                {team.tieBreakInfo.tieBreakNote && (
                                  <p className="text-gray-300 mt-1 italic">{team.tieBreakInfo.tieBreakNote}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.played || team.matchesPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.draws}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.goalsFor}:{team.goalsAgainst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        {team.points}
                      </td>
                      {/* Tie-Break Status Column */}
                      {standingsMode === 'final' && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {team.tieBreakInfo?.drawLotsRequired ? (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded"
                              title="Cần bốc thăm để xếp hạng cuối cùng"
                            >
                              🎲 Bốc Thăm
                            </span>
                          ) : team.tieBreakInfo?.usedHeadToHead ? (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded"
                              title="Xếp theo đối đầu"
                            >
                              ⚖ H2H
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(team.rank || index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingTeam(team)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setResetTeamId(team.seasonTeamId)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Reset"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {editingTeam && (
        <TeamStandingsEditor
          team={editingTeam}
          onSave={handleUpdateTeam}
          onCancel={() => setEditingTeam(null)}
          isProcessing={isProcessing}
        />
      )}

      <SeasonFormModal
        isOpen={isSeasonModalOpen}
        onClose={handleCloseSeasonModal}
        onSave={handleSaveSeason}
        season={seasonEditing}
        metadata={seasonMetadata}
        isSubmitting={isSeasonSaving}
      />

      <ConfirmationModal
        isOpen={showInitModal}
        title="Khởi Tạo Bảng Xếp Hạng"
        message="Bạn có chắc chắn muốn khởi tạo bảng xếp hạng cho mùa giải này? Điều này sẽ tạo bản ghi rỗng cho tất cả các đội."
        onConfirm={handleInitialize}
        onCancel={() => setShowInitModal(false)}
        confirmText="Khởi Tạo"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        isProcessing={isProcessing}
      />

      <ConfirmationModal
        isOpen={showCalculateModal}
        title="Tính Toán Bảng Xếp Hạng"
        message="Bạn có chắc chắn muốn tính toán lại bảng xếp hạng từ kết quả trận đấu? Điều này sẽ cập nhật tất cả thông tin dựa trên matches đã hoàn thành."
        onConfirm={handleCalculate}
        onCancel={() => setShowCalculateModal(false)}
        confirmText="Tính Toán"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        isProcessing={isProcessing}
      />

      <ConfirmationModal
        isOpen={Boolean(resetTeamId)}
        title="Reset Bảng Xếp Hạng"
        message="Bạn có chắc chắn muốn reset bảng xếp hạng của đội này về 0? Hành động này có thể được phục hồi bằng cách tính toán lại."
        onConfirm={handleResetTeam}
        onCancel={() => setResetTeamId(null)}
        confirmText="Reset"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isProcessing={isProcessing}
      />

      <ConfirmationModal
        isOpen={Boolean(seasonToDelete)}
        title="Xóa Mùa Giải"
        message={
          seasonToDelete
            ? `Bạn có chắc chắn muốn xóa mùa giải "${seasonToDelete.label ?? seasonToDelete.name ?? seasonToDelete.id}"? Hành động này không thể hoàn tác.`
            : ''
        }
        onConfirm={handleDeleteSeason}
        onCancel={() => setSeasonToDelete(null)}
        confirmText="Xóa"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isProcessing={isSeasonDeleting}
      />

      {/* Add Teams Modal */}
      {showAddTeamsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddTeamsModal(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Thêm Đội Vào Mùa Giải</h3>
                    <p className="text-sm text-gray-500">Chọn các đội để thêm vào mùa giải</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTeamsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                {isLoadingTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin text-indigo-600" size={32} />
                    <span className="ml-3 text-gray-600">Đang tải danh sách đội...</span>
                  </div>
                ) : availableTeams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="font-medium">Không có đội nào có thể thêm</p>
                    <p className="text-sm mt-1">Tất cả các đội đã tham gia mùa giải này hoặc chưa có đội nào trong hệ thống.</p>
                  </div>
                ) : (
                  <>
                    {/* Select All */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTeamIds.length === availableTeams.length}
                          onChange={selectAllTeams}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="font-medium text-gray-700">
                          Chọn tất cả ({availableTeams.length} đội)
                        </span>
                      </label>
                      <span className="text-sm text-indigo-600 font-medium">
                        Đã chọn: {selectedTeamIds.length}
                      </span>
                    </div>

                    {/* Teams List */}
                    <div className="space-y-2">
                      {availableTeams.map(team => (
                        <label
                          key={team.team_id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedTeamIds.includes(team.team_id)
                              ? 'bg-indigo-50 border-indigo-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeamIds.includes(team.team_id)}
                            onChange={() => toggleTeamSelection(team.team_id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{team.name}</p>
                            {team.short_name && (
                              <p className="text-sm text-gray-500">{team.short_name}</p>
                            )}
                          </div>
                          {team.country && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {team.country}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowAddTeamsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddTeamsToSeason}
                  disabled={selectedTeamIds.length === 0 || isAddingTeams}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingTeams ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Thêm {selectedTeamIds.length} Đội
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandingsManagement;

