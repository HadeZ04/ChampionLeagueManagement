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
  Loader
} from 'lucide-react';
import StandingsAdminService from '../../../layers/application/services/StandingsAdminService';
import SeasonService from '../../../layers/application/services/SeasonService';
import SeasonFormModal from '../components/SeasonFormModal';
import TeamStandingsEditor from '../components/TeamStandingsEditor';
import ConfirmationModal from '../components/ConfirmationModal';

const StandingsManagement = () => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [standings, setStandings] = useState([]);
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

  // Load seasons on mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load standings when season changes
  useEffect(() => {
    if (selectedSeason) {
      loadStandings();
    }
  }, [selectedSeason]);

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
      const response = await StandingsAdminService.getStandingsBySeason(selectedSeason);
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
                <p>Chưa có dữ liệu bảng xếp hạng</p>
                <p className="text-sm mt-2">Nhấn "Khởi Tạo" để tạo bảng xếp hạng</p>
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
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.matchesPlayed}
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(index + 1)}
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
    </div>
  );
};

export default StandingsManagement;

