import React, { useState, useEffect } from 'react';
import { Upload, Save, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import ApiService from '../../../layers/application/services/ApiService';

const ERROR_MAPPINGS = {
    'PLAYER_ALREADY_REGISTERED': '⚠️ Cầu thủ này đã được đăng ký trong mùa giải đã chọn.',
    'SHIRT_NUMBER_ALREADY_USED': '⚠️ Số áo này đã được đăng ký trong đội bóng ở mùa giải này.',
    'SHIRT_NUMBER_TAKEN': '⚠️ Số áo này đã được đăng ký trong đội bóng ở mùa giải này.',
    'SEASON_TEAM_NOT_FOUND': '⚠️ Đội bóng chưa tham gia mùa giải này.',
    'FILE_REQUIRED': '⚠️ Vui lòng tải lên hồ sơ đăng ký (PDF).',
    'DEFAULT': '❌ Lỗi hệ thống. Vui lòng thử lại sau.'
};

const mapBackendErrorToUserMessage = (errorCode) => {
    if (!errorCode) return ERROR_MAPPINGS['DEFAULT'];
    return ERROR_MAPPINGS[errorCode] || errorCode;
};

const SeasonPlayerRegistrationForm = ({ currentUser, onSuccess }) => {
    const [formData, setFormData] = useState({
        season_id: '',
        season_team_id: '',
        full_name: '',
        date_of_birth: '',
        nationality: '',
        position_code: '',
        shirt_number: '',
        age_on_season_start: '',
        player_type: 'domestic'
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Dropdown Data
    const [seasonTeams, setSeasonTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Fetch teams when season_id changes
    useEffect(() => {
        const fetchTeams = async () => {
            if (!formData.season_id) {
                setSeasonTeams([]);
                setFormData(prev => ({ ...prev, season_team_id: '' }));
                return;
            }

            setLoadingTeams(true);
            try {
                const data = await ApiService.get(`/seasons/${formData.season_id}/teams`);
                const teams = data.teams || [];
                const scopedTeamIds = Array.isArray(currentUser?.teamIds) ? currentUser.teamIds : null;
                const scopedTeams = scopedTeamIds ? teams.filter((team) => scopedTeamIds.includes(team.team_id)) : teams;

                setSeasonTeams(scopedTeams);

                if (scopedTeams.length === 1) {
                    setFormData((prev) => ({ ...prev, season_team_id: scopedTeams[0].season_team_id }));
                } else if (scopedTeams.length > 0 && formData.season_team_id) {
                    const stillValid = scopedTeams.some((team) => String(team.season_team_id) === String(formData.season_team_id));
                    if (!stillValid) {
                        setFormData((prev) => ({ ...prev, season_team_id: '' }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch teams", err);
                setSeasonTeams([]);
            } finally {
                setLoadingTeams(false);
            }
        };

        const timerId = setTimeout(() => {
            if (formData.season_id) {
                fetchTeams();
            }
        }, 500);

        return () => clearTimeout(timerId);
    }, [formData.season_id, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!file) {
            setMessage({
                type: 'error',
                text: '⚠️ Vui lòng tải lên hồ sơ đăng ký cầu thủ (PDF).'
            });
            setLoading(false);
            return;
        }

        try {
            await ApiService.upload('/players/registrations', file, {
                season_id: Number(formData.season_id),
                season_team_id: Number(formData.season_team_id),
                full_name: formData.full_name,
                date_of_birth: formData.date_of_birth,
                nationality: formData.nationality || null,
                position_code: formData.position_code,
                shirt_number: formData.shirt_number === '' ? null : Number(formData.shirt_number),
                player_type: formData.player_type
            });

            setMessage({
                type: 'success',
                text: 'Đăng ký cầu thủ thành công.'
            });

            setFormData(prev => ({
                ...prev,
                full_name: '',
                date_of_birth: '',
                nationality: '',
                position_code: '',
                shirt_number: '',
                age_on_season_start: '',
                player_type: 'domestic'
                // Keep season_id and season_team_id for convenience
            }));
            setFile(null);
            onSuccess?.();
            return;

            // STEP 1: Create Player
            const playerPayload = {
                full_name: formData.full_name,
                date_of_birth: formData.date_of_birth,
                nationality: formData.nationality,
                position_code: formData.position_code
            };

            const createPlayerResponse = await ApiService.post('/players', playerPayload);
            const createdPlayerId = createPlayerResponse.data?.player_id;

            if (!createdPlayerId) {
                throw new Error("Không thể tạo cầu thủ mới.");
            }

            // STEP 2: Register Player to Season
            await ApiService.upload('/season-players/register', file, {
                season_id: Number(formData.season_id),
                season_team_id: Number(formData.season_team_id),
                player_id: Number(createdPlayerId),
                position_code: formData.position_code,
                shirt_number: Number(formData.shirt_number),
                age_on_season_start: Number(formData.age_on_season_start),
                player_type: formData.player_type
            });

            setMessage({
                type: 'success',
                text: '✅ Đăng ký cầu thủ mới thành công.'
            });

            // Reset form
            setFormData(prev => ({
                ...prev,
                full_name: '',
                date_of_birth: '',
                nationality: '',
                position_code: '',
                shirt_number: '',
                age_on_season_start: '',
                player_type: 'domestic'
                // Keep season_id and season_team_id for convenience
            }));
            setFile(null);

        } catch (err) {
            console.error('Registration failed', err);
            let backendMessage = '';

            // Attempt to extract message from response
            if (err.response) {
                if (err.response.data && err.response.data.message) {
                    backendMessage = err.response.data.message;
                } else if (typeof err.response.json === 'function') {
                    try {
                        const data = await err.response.json();
                        backendMessage = data.message || data.error || '';
                    } catch (_) { }
                }
            }

            // Fallback to existing payload/message properties
            if (!backendMessage) {
                if (err.payload && err.payload.error) {
                    backendMessage = err.payload.error;
                } else if (err.message) {
                    backendMessage = err.message;
                }
            }

            // --- CUSTOM UI LOGIC ---
            // 1. Age Validation
            if (backendMessage && backendMessage.toLowerCase().includes('tuổi')) {
                setMessage({
                    type: 'error',
                    text: 'Cầu thủ phải từ 16 tuổi trở lên'
                });
                return; // Stop here
            }

            // 2. Hide "Internal Server Error"
            if (backendMessage === 'Internal Server Error') {
                backendMessage = 'DEFAULT'; // Use Key to trigger default message
            }

            setMessage({
                type: 'error',
                text: mapBackendErrorToUserMessage(backendMessage)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Đăng ký cầu thủ mới và đăng ký mùa giải
            </h2>

            {message && (
                <div className={`p-4 mb-4 rounded-lg flex items-center ${message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success'
                        ? <CheckCircle size={20} className="mr-2" />
                        : <AlertCircle size={20} className="mr-2" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputField label="Mùa giải" name="season_id" value={formData.season_id} onChange={handleChange} type="number" placeholder="Nhập ID mùa giải" />

                    {/* Team Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Đội bóng <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="season_team_id"
                                value={formData.season_team_id}
                                onChange={handleChange}
                                disabled={!formData.season_id || loadingTeams}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn đội bóng --</option>
                                {seasonTeams.map(team => (
                                    <option key={team.season_team_id} value={team.season_team_id}>
                                        {team.team_name}
                                    </option>
                                ))}
                            </select>
                            {loadingTeams && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                    <Loader2 size={14} className="animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                        {!formData.season_id && (
                            <p className="text-xs text-gray-400 mt-1">Nhập Season ID để tải danh sách đội.</p>
                        )}
                    </div>

                    <InputField label="Họ và tên" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                    <InputField label="Ngày sinh" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} type="date" />
                    <InputField label="Quốc tịch" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Việt Nam" required={false} />

                    <InputField label="Vị trí thi đấu" name="position_code" value={formData.position_code} onChange={handleChange} placeholder="GK, DF, MF, FW" />
                    <InputField label="Số áo" name="shirt_number" value={formData.shirt_number} onChange={handleChange} type="number" />
                    <InputField label="Tuổi tại thời điểm bắt đầu mùa giải" name="age_on_season_start" value={formData.age_on_season_start} onChange={handleChange} type="number" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại cầu thủ</label>
                        <select
                            name="player_type"
                            value={formData.player_type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="domestic">Domestic</option>
                            <option value="foreign">Foreign</option>
                            <option value="u21">U21</option>
                            <option value="u23">U23</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* File upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hồ sơ đăng ký (PDF)
                    </label>
                    <div className="border border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="registration-file" />
                        <label htmlFor="registration-file" className="cursor-pointer text-blue-600 font-medium hover:underline">
                            {file ? file.name : 'Nhấn để tải lên file PDF'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận file PDF</p>
                    </div>
                </div>

                {/* Rules */}
                <div className="text-sm text-gray-600 border-t pt-3">
                    <div className="flex items-center mb-1 font-medium">
                        <Info size={16} className="mr-2" /> Quy định
                    </div>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>Mỗi cầu thủ chỉ được đăng ký <b>một lần</b> trong cùng mùa giải.</li>
                        <li>Mỗi đội bóng không được có <b>hai cầu thủ trùng số áo</b>.</li>
                        <li>Hồ sơ đăng ký phải ở định dạng <b>PDF</b>.</li>
                    </ul>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-60 transition-colors shadow-sm"
                    >
                        {loading ? <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Đang xử lý...</span>
                        </> : <>
                            <Save size={18} />
                            <span>Đăng ký cầu thủ</span>
                        </>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper input component
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = true }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export default SeasonPlayerRegistrationForm;
