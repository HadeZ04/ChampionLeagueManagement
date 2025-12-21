import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, AlertCircle, Users, Calendar, Filter } from 'lucide-react';
import ApiService from '../../../layers/application/services/ApiService';

// Localized player type labels
const PLAYER_TYPE_MAP = {
    domestic: 'Trong nước',
    foreign: 'Nước ngoài',
    u21: 'U21',
    u23: 'U23'
};

// Business Error Localization Map
const ERROR_MESSAGE_MAP = {
    'PLAYER_ALREADY_REGISTERED': 'Cầu thủ đã được đăng ký trong mùa giải này.',
    'SHIRT_NUMBER_ALREADY_USED': 'Số áo này đã được sử dụng trong đội bóng.',
    'SEASON_TEAM_NOT_FOUND': 'Đội bóng này chưa được đăng ký tham gia mùa giải.'
};

const SeasonPlayersManagement = () => {
    const [filters, setFilters] = useState({
        season_id: '',
        team_id: '',
        position_code: '',
        player_type: ''
    });

    // Data state
    const [seasonTeams, setSeasonTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Results state
    const [result, setResult] = useState(null); // { season_id, total, players: [] }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch teams when season_id changes
    useEffect(() => {
        const fetchTeams = async () => {
            if (!filters.season_id) {
                setSeasonTeams([]);
                return;
            }

            setLoadingTeams(true);
            try {
                const data = await ApiService.get(`/seasons/${filters.season_id}/teams`);
                setSeasonTeams(data.teams || []);
            } catch (err) {
                console.error("Failed to fetch teams", err);
                setSeasonTeams([]);
            } finally {
                setLoadingTeams(false);
            }
        };

        const timerId = setTimeout(() => {
            if (filters.season_id) {
                fetchTeams();
            }
        }, 500); // Debounce season input

        return () => clearTimeout(timerId);
    }, [filters.season_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };

            // Reset team selection if season changed
            if (name === 'season_id') {
                newFilters.team_id = '';
            }
            return newFilters;
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        // Validation
        if (!filters.season_id) {
            setError('Vui lòng nhập Season ID.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setHasSearched(true);

        try {
            // Build query params
            const params = {};
            if (filters.team_id) params.team_id = filters.team_id;
            if (filters.position_code) params.position_code = filters.position_code;
            if (filters.player_type) params.player_type = filters.player_type;

            const data = await ApiService.get(`/seasons/${filters.season_id}/players`, params);
            setResult(data);
        } catch (err) {
            console.error("Search failed", err);

            // Error handling logic
            let msg = 'Không thể tải danh sách cầu thủ.';

            // 1. Check mapped business errors
            const errorCode = err?.payload?.error;
            if (errorCode && ERROR_MESSAGE_MAP[errorCode]) {
                msg = ERROR_MESSAGE_MAP[errorCode];
            }
            // 2. Check backend dynamic message
            else if (err?.payload?.message) {
                msg = err.payload.message;
            }
            // 3. Fallback to generic error message
            else if (err?.message) {
                msg = err.message;
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Helper for file URL
    const getFileUrl = (path) => {
        if (!path) return null;
        // Fix backslashes to forward slashes
        const normalizedPath = path.replace(/\\/g, '/');
        // Extract filename
        const filename = normalizedPath.split('/').pop();
        return `/uploads/${filename}`;
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tra cứu cầu thủ theo mùa giải</h1>
                <p className="text-gray-600 mt-1">
                    Xem danh sách cầu thủ đã đăng ký chính thức trong mùa giải.
                </p>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">

                    {/* Season ID (Required) */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Season ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="season_id"
                            value={filters.season_id}
                            onChange={handleChange}
                            placeholder="Nhập ID"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Team Selector (Replaces Season Team ID) */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đội bóng
                        </label>
                        <div className="relative">
                            <select
                                name="team_id"
                                value={filters.team_id}
                                onChange={handleChange}
                                disabled={!filters.season_id || loadingTeams}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 appearance-none"
                            >
                                <option value="">Tất cả</option>
                                {seasonTeams.map(team => (
                                    <option key={team.team_id} value={team.team_id}>
                                        {team.team_name}
                                    </option>
                                ))}
                            </select>
                            {/* Loading Indicator for Teams */}
                            {loadingTeams && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                    <Loader2 size={14} className="animate-spin text-gray-400" />
                                </div>
                            )}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <Filter size={14} />
                            </div>
                        </div>
                        {/* Helper text moved or removed as simple selector is clearer */}
                        {!filters.season_id && (
                            <p className="text-xs text-gray-400 mt-1">Nhập Season ID để chọn đội.</p>
                        )}
                    </div>

                    {/* Position */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vị trí
                        </label>
                        <select
                            name="position_code"
                            value={filters.position_code}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="GK">Thủ môn (GK)</option>
                            <option value="DF">Hậu vệ (DF)</option>
                            <option value="MF">Tiền vệ (MF)</option>
                            <option value="FW">Tiền đạo (FW)</option>
                        </select>
                    </div>

                    {/* Player Type */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại cầu thủ
                        </label>
                        <select
                            name="player_type"
                            value={filters.player_type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="domestic">Trong nước</option>
                            <option value="foreign">Nước ngoài</option>
                            <option value="u21">U21</option>
                            <option value="u23">U23</option>
                        </select>
                    </div>

                    {/* Search Button */}
                    <div className="col-span-1 pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Search size={20} />
                                    <span>Tìm kiếm</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {/* Empty State / Initial State */}
            {!loading && !result && !error && hasSearched && (
                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    Không tìm thấy dữ liệu.
                </div>
            )}

            {!loading && !hasSearched && !error && (
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-8 text-center text-blue-700">
                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Nhập Season ID và nhấn Tìm kiếm để xem danh sách cầu thủ.</p>
                </div>
            )}

            {/* Results Table */}
            {!loading && result && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="font-semibold text-gray-900 flex items-center">
                            <Users size={18} className="mr-2 text-gray-500" />
                            Kết quả tìm kiếm
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Tổng: {result.total}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Cầu thủ</th>
                                    <th className="px-6 py-3">Đội bóng</th>
                                    <th className="px-6 py-3 text-center">Số áo</th>
                                    <th className="px-6 py-3 text-center">Vị trí</th>
                                    <th className="px-6 py-3">Loại</th>
                                    <th className="px-6 py-3">Ngày đăng ký</th>
                                    <th className="px-6 py-3 text-right">Hồ sơ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.players.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Không có cầu thủ nào thỏa mãn điều kiện lọc.
                                        </td>
                                    </tr>
                                ) : (
                                    result.players.map((player) => (
                                        <tr key={`${player.season_id}-${player.player_id}`} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {player.player_name}
                                                <div className="text-xs text-gray-500 font-normal">ID: {player.player_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {player.logo_url && (
                                                        <img src={player.logo_url} alt="" className="w-6 h-6 mr-2 object-contain" />
                                                    )}
                                                    {player.team_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-gray-700">
                                                {player.shirt_number}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {player.position_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded capitalize
                                                    ${player.player_type === 'foreign' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                                                 `}>
                                                    {PLAYER_TYPE_MAP[player.player_type] || player.player_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1 text-gray-400" />
                                                    {formatDate(player.registered_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {player.file_path ? (
                                                    <a
                                                        href={getFileUrl(player.file_path)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-blue-600 hover:underline flex items-center justify-end"
                                                    >
                                                        <FileText size={16} className="mr-1" />
                                                        View PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">No file</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeasonPlayersManagement;
