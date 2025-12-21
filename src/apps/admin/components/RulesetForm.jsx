import React, { useState } from 'react';

const goalTypeLibrary = [
  { id: 'open_play', label: 'Bóng sống' },
  { id: 'penalty', label: 'Phạt đền' },
  { id: 'free_kick', label: 'Đá phạt' },
  { id: 'own_goal', label: 'Phản lưới' },
  { id: 'header', label: 'Đánh đầu' },
  { id: 'shootout', label: 'Luân lưu' }
];

const tiebreakerLibrary = [
  { id: 'points', label: 'Tổng điểm' },
  { id: 'goal_difference', label: 'Hiệu số' },
  { id: 'goals_for', label: 'Bàn thắng' },
  { id: 'head_to_head', label: 'Đối đầu' },
  { id: 'away_goals', label: 'Bàn sân khách' },
  { id: 'fair_play', label: 'Điểm chơi đẹp' },
  { id: 'drawing_of_lots', label: 'Bốc thăm' }
];

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const RulesetForm = ({ initialData = {}, onSave, onCancel, isSubmitting = false }) => {
  const initialParams = initialData.parameters || {};

  const [name, setName] = useState(initialData.name ?? '');
  const [description, setDescription] = useState(initialData.description ?? '');
  const [versionTag, setVersionTag] = useState(initialData.versionTag ?? '');
  const [squadConfig, setSquadConfig] = useState({
    minAge: initialParams?.squad?.minAge ?? 16,
    maxAge: initialParams?.squad?.maxAge ?? 40,
    maxPlayers: initialParams?.squad?.maxPlayers ?? 30,
    maxForeignPlayers: initialParams?.squad?.maxForeignPlayers ?? 5
  });
  const [goalTypes, setGoalTypes] = useState(
    initialParams?.scoring?.goalTypes && initialParams.scoring.goalTypes.length > 0
      ? initialParams.scoring.goalTypes
      : ['open_play', 'penalty', 'free_kick', 'own_goal']
  );
  const [maxGoalTime, setMaxGoalTime] = useState(initialParams?.scoring?.maxGoalTime ?? 120);
  const [pointsConfig, setPointsConfig] = useState({
    win: initialParams?.ranking?.points?.win ?? 3,
    draw: initialParams?.ranking?.points?.draw ?? 1,
    loss: initialParams?.ranking?.points?.loss ?? 0
  });
  const [tiebreakers, setTiebreakers] = useState(
    initialParams?.ranking?.tiebreakers && initialParams.ranking.tiebreakers.length > 0
      ? initialParams.ranking.tiebreakers
      : ['points', 'goal_difference', 'goals_for', 'head_to_head', 'fair_play']
  );
  const [pointsError, setPointsError] = useState('');
  const [errors, setErrors] = useState([]);

  const handleGoalTypeToggle = (goalTypeId) => {
    setGoalTypes(prev => {
      if (prev.includes(goalTypeId)) {
        return prev.filter(item => item !== goalTypeId);
      }
      return [...prev, goalTypeId];
    });
  };

  const handleMoveTiebreaker = (index, direction) => {
    setTiebreakers(prev => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const tmp = next[targetIndex];
      next[targetIndex] = next[index];
      next[index] = tmp;
      return next;
    });
  };

  const handleTiebreakerToggle = (id) => {
    setTiebreakers(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const validate = () => {
    const validationErrors = [];

    if (!name.trim()) {
      validationErrors.push('Cần nhập tên bộ luật.');
    }
    if (!versionTag.trim()) {
      validationErrors.push('Cần nhập nhãn phiên bản.');
    }
    if (squadConfig.minAge < 12) {
      validationErrors.push('Tuổi tối thiểu phải từ 12 trở lên.');
    }
    if (squadConfig.maxAge <= squadConfig.minAge) {
      validationErrors.push('Tuổi tối đa phải lớn hơn tuổi tối thiểu.');
    }
    if (squadConfig.maxPlayers < 11) {
      validationErrors.push('Số lượng cầu thủ tối đa phải từ 11 trở lên.');
    }
    if (squadConfig.maxForeignPlayers > squadConfig.maxPlayers) {
      validationErrors.push('Giới hạn cầu thủ ngoại không được vượt quá tổng số cầu thủ.');
    }
    if (goalTypes.length === 0) {
      validationErrors.push('Chọn ít nhất một loại bàn thắng.');
    }
    if (maxGoalTime < 30 || maxGoalTime > 150) {
      validationErrors.push('Thời gian xác thực bàn thắng phải từ 30 đến 150 phút.');
    }
    if (tiebreakers.length === 0) {
      validationErrors.push('Chọn ít nhất một tiêu chí phụ.');
    }

    const winPoints = Number(pointsConfig.win);
    const drawPoints = Number(pointsConfig.draw);
    const lossPoints = Number(pointsConfig.loss);
    if (!(winPoints > drawPoints && drawPoints > lossPoints)) {
      validationErrors.push('Điểm phải thỏa: Thắng > Hòa > Thua.');
      setPointsError('Điểm thắng phải lớn hơn điểm hòa, và điểm hòa phải lớn hơn điểm thua.');
    } else {
      setPointsError('');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    onSave({
      ...initialData,
      name: name.trim(),
      versionTag: versionTag.trim(),
      description: description.trim(),
      parameters: {
        squad: {
          minAge: toInt(squadConfig.minAge, 16),
          maxAge: toInt(squadConfig.maxAge, 40),
          maxPlayers: toInt(squadConfig.maxPlayers, 30),
          maxForeignPlayers: toInt(squadConfig.maxForeignPlayers, 5)
        },
        scoring: {
          goalTypes,
          maxGoalTime: toInt(maxGoalTime, 120)
        },
        ranking: {
          points: {
            win: toInt(pointsConfig.win, 3),
            draw: toInt(pointsConfig.draw, 1),
            loss: toInt(pointsConfig.loss, 0)
          },
          tiebreakers
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label htmlFor="ruleset-name" className="block text-sm font-medium text-gray-700">
          Tên bộ luật
        </label>
        <input
          id="ruleset-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="vd: Quy định Cúp C1 2026"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="ruleset-version" className="block text-sm font-medium text-gray-700">
          Nhãn phiên bản
        </label>
        <input
          id="ruleset-version"
          type="text"
          value={versionTag}
          onChange={(event) => setVersionTag(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="vd: 2026.v2-bản-nháp"
        />
        <p className="text-xs text-gray-500">
          Dùng tên phiên bản có ý nghĩa để theo dõi phê duyệt/quy trình, ví dụ: 2026.v2 hoặc truocmua.beta.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="ruleset-description" className="block text-sm font-medium text-gray-700">
          Mô tả (tùy chọn)
        </label>
        <textarea
          id="ruleset-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Thêm ghi chú về thay đổi so với mùa giải trước."
        />
      </div>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-900">Điều kiện cầu thủ (QD1)</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tuổi tối thiểu</label>
            <input
              type="number"
              min={12}
              max={60}
              value={squadConfig.minAge}
              onChange={(event) =>
                setSquadConfig(prev => ({ ...prev, minAge: toInt(event.target.value, prev.minAge) }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tuổi tối đa</label>
            <input
              type="number"
              min={16}
              max={55}
              value={squadConfig.maxAge}
              onChange={(event) =>
                setSquadConfig(prev => ({ ...prev, maxAge: toInt(event.target.value, prev.maxAge) }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng cầu thủ tối đa</label>
            <input
              type="number"
              min={11}
              max={40}
              value={squadConfig.maxPlayers}
              onChange={(event) =>
                setSquadConfig(prev => ({ ...prev, maxPlayers: toInt(event.target.value, prev.maxPlayers) }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giới hạn cầu thủ ngoại</label>
            <input
              type="number"
              min={0}
              max={40}
              value={squadConfig.maxForeignPlayers}
              onChange={(event) =>
                setSquadConfig(prev => ({
                  ...prev,
                  maxForeignPlayers: toInt(event.target.value, prev.maxForeignPlayers)
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-900">Xác thực bàn thắng (QD3)</h3>
        <div className="mt-4 space-y-3">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Loại bàn thắng được tính</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {goalTypeLibrary.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={goalTypes.includes(option.id)}
                    onChange={() => handleGoalTypeToggle(option.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian xác thực tối đa (phút)</label>
            <input
              type="number"
              min={30}
              max={150}
              value={maxGoalTime}
              onChange={(event) => setMaxGoalTime(toInt(event.target.value, maxGoalTime))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Dùng 120 để tính cả hiệp phụ và tình huống luân lưu.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tiêu chí xếp hạng (QD5)</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm cho thắng</label>
              <input
                type="number"
                min={0}
                max={10}
                value={pointsConfig.win}
                onChange={(event) =>
                  setPointsConfig(prev => ({ ...prev, win: toInt(event.target.value, prev.win) }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm cho hòa</label>
              <input
                type="number"
                min={0}
                max={5}
                value={pointsConfig.draw}
                onChange={(event) =>
                  setPointsConfig(prev => ({ ...prev, draw: toInt(event.target.value, prev.draw) }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm cho thua</label>
              <input
                type="number"
                min={-5}
                max={5}
                value={pointsConfig.loss}
                onChange={(event) =>
                  setPointsConfig(prev => ({ ...prev, loss: toInt(event.target.value, prev.loss) }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {pointsError && (
            <p className="mt-2 text-xs font-semibold text-red-600">{pointsError}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Thứ tự tiêu chí phụ</h4>
          <p className="mt-1 text-xs text-gray-500">
            Bật các tiêu chí cần xét và sắp xếp để xác định thứ tự ưu tiên.
          </p>
          <div className="mt-3 space-y-2">
            {tiebreakerLibrary.map(option => {
              const isSelected = tiebreakers.includes(option.id);
              const index = tiebreakers.indexOf(option.id);
              return (
                <div
                  key={option.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                    isSelected ? 'border-blue-400 bg-white' : 'border-gray-200 bg-gray-100 text-gray-500'
                  }`}
                >
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTiebreakerToggle(option.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option.label}</span>
                  </label>
                  {isSelected && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="font-semibold">#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveTiebreaker(index, -1)}
                        className="rounded border border-gray-200 px-2 py-1 hover:border-blue-400 hover:text-blue-600"
                      >
                        Lên
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTiebreaker(index, 1)}
                        className="rounded border border-gray-200 px-2 py-1 hover:border-blue-400 hover:text-blue-600"
                      >
                        Xuống
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {errors.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu bộ luật'}
        </button>
      </div>
    </form>
  );
};

export default RulesetForm;
