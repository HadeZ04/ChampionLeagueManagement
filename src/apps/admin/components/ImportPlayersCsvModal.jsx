import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader2, Save } from 'lucide-react';
import ApiService from '../../../layers/application/services/ApiService';
import SeasonService from '../../../layers/application/services/SeasonService';

const ImportPlayersCsvModal = ({ isOpen, onClose, onSuccess }) => {
    const [seasons, setSeasons] = useState([]);
    const [seasonTeams, setSeasonTeams] = useState([]);

    const [selectedSeasonId, setSelectedSeasonId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [file, setFile] = useState(null);

    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);

    // Fetch seasons on mount
    useEffect(() => {
        if (isOpen) {
            const fetchSeasons = async () => {
                try {
                    const data = await SeasonService.listSeasons();
                    setSeasons(data || []);
                } catch (err) {
                    console.error('Failed to load seasons', err);
                    setError('Không thể tải danh sách mùa giải.');
                }
            };
            fetchSeasons();
        }
    }, [isOpen]);

    // Fetch teams when season changes
    useEffect(() => {
        if (!selectedSeasonId) {
            setSeasonTeams([]);
            setSelectedTeamId('');
            return;
        }

        const fetchTeams = async () => {
            setLoadingTeams(true);
            try {
                const data = await ApiService.get(`/seasons/${selectedSeasonId}/teams`);
                setSeasonTeams(data.teams || []);
            } catch (err) {
                console.error("Failed to fetch teams", err);
                setSeasonTeams([]);
            } finally {
                setLoadingTeams(false);
            }
        };

        fetchTeams();
    }, [selectedSeasonId]);

    // Reset state when modal closes or opens
    useEffect(() => {
        if (!isOpen) {
            // Reset form
            setSelectedSeasonId('');
            setSelectedTeamId('');
            setFile(null);
            setPreviewData([]);
            setError(null);
            setValidationErrors([]);
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('Vui lòng chọn file CSV.');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setValidationErrors([]);

        // Simple preview logic
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            // Remove slice to show ALL rows
            const rows = text.split('\n').filter(row => row.trim());
            setPreviewData(rows);
        };
        reader.readAsText(selectedFile);
    };

    const mapBackendErrorToUserMessage = (errorCode) => {
        const mappings = {
            'SEASON_TEAM_NOT_FOUND': 'Đội bóng không tồn tại trong mùa giải này.',
            'CSV_VALIDATION_FAILED': '❌ Không thể import danh sách cầu thủ. Vui lòng kiểm tra và sửa các lỗi bên dưới.',
            'FILE_REQUIRED': 'Vui lòng chọn file CSV.',
            'DEFAULT': 'Đã xảy ra lỗi khi import. Vui lòng thử lại.'
        };
        return mappings[errorCode] || errorCode || mappings['DEFAULT'];
    };

    const handleSubmit = async () => {
        if (!selectedSeasonId || !selectedTeamId || !file) {
            setError('Vui lòng chọn Mùa giải, Đội bóng và File CSV.');
            return;
        }

        setLoading(true);
        setError(null);
        setValidationErrors([]);

        try {
            await ApiService.upload('/season-players/import-csv', file, {
                season_id: selectedSeasonId,
                season_team_id: selectedTeamId
            });

            // Success handled by parent
            onSuccess();
            onClose();

        } catch (err) {
            console.error("Import failed", err);

            let backendMessage = '';
            let details = null;

            if (err.payload) {
                backendMessage = err.payload.error || err.payload.message;
                details = err.payload.details;
            } else if (err.message) {
                backendMessage = err.message;
            }

            setError(mapBackendErrorToUserMessage(backendMessage));

            if (details && Array.isArray(details.errors)) {
                setValidationErrors(details.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const getRowErrorMessage = (msg) => {
        const mapping = {
            "Trùng số áo trong chính file CSV": "Số áo bị trùng trong danh sách CSV",
            "Trùng số áo trong đội (đã có trong DB)": "Số áo đã được đăng ký cho đội bóng trong mùa giải",
            "Cầu thủ chưa đủ 16 tuổi tại thời điểm bắt đầu mùa giải": "Cầu thủ chưa đủ 16 tuổi tại thời điểm bắt đầu mùa giải",
            "PLAYER_ALREADY_REGISTERED_IN_SEASON": "Cầu thủ đã được đăng ký trong mùa giải này (trùng lặp)",
            "Vượt quá giới hạn cầu thủ nước ngoài (Global Limit)": "Vượt quá giới hạn cầu thủ nước ngoài (tối đa 5)"
        };
        return mapping[msg] || msg;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Upload size={20} className="text-blue-600" />
                        Import danh sách cầu thủ (CSV)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Error Banner */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-2">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Global Validation Errors (Banner) */}
                    {validationErrors.filter(e => e.row === 0).map((err, index) => (
                        <div key={`global-err-${index}`} className="p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-2">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">
                                    {err.field === 'foreign'
                                        ? "Số lượng cầu thủ nước ngoài vượt quá giới hạn (tối đa 5)."
                                        : err.message}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mùa giải <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedSeasonId}
                                onChange={(e) => setSelectedSeasonId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn mùa giải --</option>
                                {seasons.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đội bóng <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTeamId}
                                    onChange={(e) => setSelectedTeamId(e.target.value)}
                                    disabled={!selectedSeasonId || loadingTeams}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn đội bóng --</option>
                                    {seasonTeams.map(t => (
                                        <option key={t.season_team_id} value={t.season_team_id}>{t.team_name}</option>
                                    ))}
                                </select>
                                {loadingTeams && (
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                        <Loader2 size={14} className="animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${!selectedTeamId ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' : 'hover:bg-blue-50 border-gray-300 hover:border-blue-400'
                        }`}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-file-upload"
                            disabled={!selectedTeamId}
                        />

                        <label
                            htmlFor="csv-file-upload"
                            className={`flex flex-col items-center justify-center ${!selectedTeamId ? 'pointer-events-none' : 'cursor-pointer'}`}
                        >
                            {file ? (
                                <>
                                    <FileText size={40} className="text-blue-600 mb-2" />
                                    <span className="font-medium text-gray-900">{file.name}</span>
                                    <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                    <span className="text-xs text-blue-600 mt-2 hover:underline">Thay đổi file</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={40} className="text-gray-400 mb-2" />
                                    <span className="font-medium text-gray-700">
                                        {selectedTeamId ? 'Nhấn để tải lên danh sách cầu thủ (CSV)' : 'Vui lòng chọn đội bóng trước'}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Chỉ hỗ trợ định dạng .csv</span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Preview & Validation Errors */}
                    {previewData.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Xem trước danh sách cầu thủ</span>
                            </div>
                            <div className="overflow-x-auto max-h-[500px]">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                        <tr>
                                            {previewData[0].split(',').map((header, i) => (
                                                <th key={i} className="px-4 py-2 bg-gray-50 border-b whitespace-nowrap">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewData.slice(1).map((row, rowIndex) => {
                                            const cells = row.split(',');
                                            // 1. Check for specific Row Error
                                            // Backend: rowUserIndex = i + 2.
                                            const activeRowError = validationErrors.find(e => e.row === rowIndex + 2);

                                            // Map field to column index
                                            const fieldToIndex = {
                                                'full_name': 0,
                                                'date_of_birth': 1,
                                                'nationality': 2,
                                                'position_code': 3,
                                                'shirt_number': 4,
                                                'height_cm': 5,
                                                'weight_kg': 6,
                                                'is_foreign': 7,
                                                'foreign': 7
                                            };

                                            return (
                                                <tr key={rowIndex} className={activeRowError ? 'bg-red-50' : ''}>
                                                    {cells.map((cell, cellIndex) => {
                                                        const isErrorCell = activeRowError && (
                                                            // If field matches column index
                                                            (activeRowError.field && fieldToIndex[activeRowError.field] === cellIndex) ||
                                                            // Or if no specific field, show on first column (Index 0)
                                                            (!activeRowError.field && cellIndex === 0)
                                                        );

                                                        return (
                                                            <td key={cellIndex} className="px-4 py-2 whitespace-nowrap relative group">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{cell}</span>
                                                                    {isErrorCell && (
                                                                        <div className="relative">
                                                                            <AlertCircle size={16} className="text-red-600 cursor-help" />
                                                                            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-normal min-w-[200px] text-center">
                                                                                {getRowErrorMessage(activeRowError.message)}
                                                                                {/* Arrow */}
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {validationErrors.length > 0 && (
                                <div className="p-3 bg-red-50 border-t border-red-100 text-xs text-red-600 font-medium">
                                    ❌ Phát hiện {validationErrors.length} lỗi trong danh sách cầu thủ. Vui lòng sửa file CSV và import lại.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file || !selectedTeamId || validationErrors.length > 0}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Import danh sách</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportPlayersCsvModal;
