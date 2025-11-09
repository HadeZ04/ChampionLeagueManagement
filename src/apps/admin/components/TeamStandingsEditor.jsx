import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';

const TeamStandingsEditor = ({ team, onSave, onCancel, isProcessing }) => {
  const [formData, setFormData] = useState({
    wins: team.wins || 0,
    draws: team.draws || 0,
    losses: team.losses || 0,
    goalsFor: team.goalsFor || 0,
    goalsAgainst: team.goalsAgainst || 0,
    points: team.points || 0,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : numValue
      }));
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.wins < 0) newErrors.wins = 'Số trận thắng không thể âm';
    if (formData.draws < 0) newErrors.draws = 'Số trận hòa không thể âm';
    if (formData.losses < 0) newErrors.losses = 'Số trận thua không thể âm';
    if (formData.goalsFor < 0) newErrors.goalsFor = 'Số bàn thắng không thể âm';
    if (formData.goalsAgainst < 0) newErrors.goalsAgainst = 'Số bàn thua không thể âm';
    if (formData.points < 0) newErrors.points = 'Điểm không thể âm';

    // Logical validation
    const expectedPoints = formData.wins * 3 + formData.draws;
    if (formData.points !== expectedPoints) {
      newErrors.points = `Điểm nên là ${expectedPoints} (${formData.wins} thắng × 3 + ${formData.draws} hòa)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(team.seasonTeamId, formData);
    }
  };

  const calculatedMatchesPlayed = formData.wins + formData.draws + formData.losses;
  const calculatedGoalDifference = formData.goalsFor - formData.goalsAgainst;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh Sửa Thống Kê
            </h2>
            <p className="text-gray-600 mt-1">
              {team.teamName} {team.shortName && `(${team.shortName})`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Match Results */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết Quả Trận Đấu</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thắng
                </label>
                <input
                  type="number"
                  name="wins"
                  value={formData.wins}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.wins ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.wins && (
                  <p className="mt-1 text-sm text-red-600">{errors.wins}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hòa
                </label>
                <input
                  type="number"
                  name="draws"
                  value={formData.draws}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.draws ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.draws && (
                  <p className="mt-1 text-sm text-red-600">{errors.draws}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thua
                </label>
                <input
                  type="number"
                  name="losses"
                  value={formData.losses}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.losses ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.losses && (
                  <p className="mt-1 text-sm text-red-600">{errors.losses}</p>
                )}
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bàn Thắng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bàn Thắng Ghi Được
                </label>
                <input
                  type="number"
                  name="goalsFor"
                  value={formData.goalsFor}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.goalsFor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.goalsFor && (
                  <p className="mt-1 text-sm text-red-600">{errors.goalsFor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bàn Thắng Thủng Lưới
                </label>
                <input
                  type="number"
                  name="goalsAgainst"
                  value={formData.goalsAgainst}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.goalsAgainst ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                />
                {errors.goalsAgainst && (
                  <p className="mt-1 text-sm text-red-600">{errors.goalsAgainst}</p>
                )}
              </div>
            </div>
          </div>

          {/* Points */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng Điểm
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.points ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isProcessing}
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Thắng: {formData.wins} × 3 = {formData.wins * 3} điểm + Hòa: {formData.draws} × 1 = {formData.draws} điểm = {formData.wins * 3 + formData.draws} điểm
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tóm Tắt</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tổng trận đấu:</span>
                <span className="ml-2 font-semibold text-gray-900">{calculatedMatchesPlayed}</span>
              </div>
              <div>
                <span className="text-gray-600">Hiệu số:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {calculatedGoalDifference > 0 ? '+' : ''}{calculatedGoalDifference}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamStandingsEditor;

