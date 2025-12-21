import React, { useEffect, useState } from "react";
import {
    Check,
    X,
    FileText,
    Loader2,
    AlertCircle,
    ShieldCheck,
    Calendar,
    User,
    Filter,
    RotateCcw
} from "lucide-react";
import RegistrationStatusBadge from "../components/RegistrationStatusBadge";
import RejectReasonView from "../components/RejectReasonView";

const SeasonPlayerApprovalPage = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterSeason, setFilterSeason] = useState("");
    const [filterTeam, setFilterTeam] = useState("");

    const [rejectId, setRejectId] = useState(null);
    const [approveId, setApproveId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showApproveAllConfirm, setShowApproveAllConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("auth_token");

    // =========================
    // Load pending registrations
    // =========================
    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/season-players/pending", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Fetch failed");
            }

            const data = await res.json();
            // Standardize data
            const safeData = (data || []).map(item => ({
                ...item,
                registration_status: item.registration_status ?? 'pending',
                reject_reason: item.reject_reason ?? null
            }));

            setList(safeData);
        } catch (err) {
            alert("Không thể tải danh sách hồ sơ chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    //Derived State for Filters
    const uniqueSeasons = React.useMemo(() => {
        return [...new Set(list.map(item => item.season_name).filter(Boolean))].sort();
    }, [list]);

    const uniqueTeams = React.useMemo(() => {
        return [...new Set(list.map(item => item.team_name).filter(Boolean))].sort();
    }, [list]);

    const filteredList = React.useMemo(() => {
        return list.filter(item => {
            if (filterSeason && item.season_name !== filterSeason) return false;
            if (filterTeam && item.team_name !== filterTeam) return false;
            return true;
        });
    }, [list, filterSeason, filterTeam]);

    const resetFilters = () => {
        setFilterSeason("");
        setFilterTeam("");
    };

    // =========================
    // Approve
    // =========================
    const handleApprove = (id) => {
        setApproveId(id);
    };

    const confirmApproveSingle = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/season-players/${approveId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Approve failed");
            }

            // alert("Duyệt hồ sơ thành công");
            setApproveId(null);
            fetchPending();
        } catch (err) {
            alert("Duyệt hồ sơ thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // Reject
    // =========================
    const submitReject = async () => {
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(
                `/api/season-players/${rejectId}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reason: rejectReason,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Reject failed");
            }

            // alert("Từ chối hồ sơ thành công");
            setRejectId(null);
            setRejectReason("");
            fetchPending();
        } catch (err) {
            alert("Từ chối hồ sơ thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // Approve All
    // =========================
    const handleApproveAllClick = () => {
        setShowApproveAllConfirm(true);
    };

    const confirmApproveAll = async () => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/season-players/approve-all", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Approve all failed");
            }

            alert("Đã duyệt tất cả hồ sơ");
            setShowApproveAllConfirm(false);
            fetchPending();
        } catch (err) {
            alert("Duyệt tất cả thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // Helpers
    // =========================
    const formatDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("vi-VN");
    };

    const openPdf = (path) => {
        if (!path) return;
        const normalized = path.replace(/\\/g, "/");
        window.open(`/${normalized}`, "_blank");
    };

    // =========================
    // Render
    // =========================
    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-blue-500" size={28} />
                        Duyệt hồ sơ đăng ký cầu thủ
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Xem và duyệt các hồ sơ đăng ký cầu thủ đang chờ xử lý trong mùa giải hiện tại.
                    </p>
                </div>
                {list.length > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-900/30 text-blue-300 border border-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full">
                            {list.length} hồ sơ đang chờ
                        </div>
                        <button
                            disabled={submitting}
                            onClick={handleApproveAllClick}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            Duyệt tất cả
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex items-center gap-2 text-gray-400 mb-2 md:mb-0 mr-2">
                    <Filter size={20} />
                    <span className="font-medium text-sm">Bộ lọc:</span>
                </div>

                <div className="w-full md:w-48">
                    <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Mùa giải</label>
                    <select
                        value={filterSeason}
                        onChange={(e) => setFilterSeason(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="">Tất cả</option>
                        {uniqueSeasons.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="w-full md:w-56">
                    <label className="block text-xs uppercase text-gray-500 font-semibold mb-1">Đội bóng</label>
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="">Tất cả</option>
                        {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {(filterSeason || filterTeam) && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors border border-gray-600"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                )}
            </div>

            {/* List State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                    <p>Đang tải...</p>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="bg-gray-800/50 rounded-xl border border-dashed border-gray-700 p-16 text-center">
                    <div className="bg-gray-700 p-4 rounded-full inline-block mb-4">
                        <ShieldCheck size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                        {(filterSeason || filterTeam) ? "Không tìm thấy hồ sơ phù hợp" : "Không có hồ sơ chờ duyệt"}
                    </h3>
                    <p className="text-gray-400 mt-1">
                        {(filterSeason || filterTeam) ? "Không còn hồ sơ nào cần duyệt" : "Tất cả hồ sơ đăng ký đã được xử lý."}
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-semibold border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Cầu thủ</th>
                                    <th className="px-6 py-4">Đội bóng</th>
                                    <th className="px-6 py-4">Mùa giải</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-center">Hồ sơ</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredList.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-700 p-2 rounded-full text-blue-400">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white block">{item.player_name}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={10} /> {formatDate(item.registered_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-300">
                                            {item.team_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {item.season_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <RegistrationStatusBadge status={item.registration_status} />
                                                {item.registration_status === 'rejected' && item.reject_reason && (
                                                    <RejectReasonView reason={item.reject_reason} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.file_path ? (
                                                <button
                                                    onClick={() => openPdf(item.file_path)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-transparent hover:border-blue-800 transition-colors"
                                                    title="Xem PDF"
                                                >
                                                    <FileText size={14} />
                                                    Xem PDF
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-600 italic">Không có hồ sơ</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.registration_status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => handleApprove(item.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-900/20 text-green-400 hover:bg-green-900/40 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-green-800 disabled:opacity-50"
                                                        title="Duyệt"
                                                    >
                                                        <Check size={14} />
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        disabled={submitting}
                                                        onClick={() => setRejectId(item.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-red-800 disabled:opacity-50"
                                                        title="Từ chối"
                                                    >
                                                        <X size={14} />
                                                        Từ chối
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-500" />
                                Từ chối hồ sơ đăng ký
                            </h3>
                            <button
                                onClick={() => setRejectId(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm text-white placeholder-gray-500 transition-all resize-none"
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Đội bóng sẽ được thông báo lý do từ chối này.
                            </p>
                        </div>

                        <div className="p-4 bg-gray-900/50 flex justify-end gap-3 border-t border-gray-700">
                            <button
                                onClick={() => setRejectId(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={submitting || !rejectReason.trim()}
                                onClick={submitReject}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-colors flex items-center gap-2"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Approve All Confirmation Modal */}
            {showApproveAllConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-700 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Check size={20} className="text-green-500" />
                                Xác nhận duyệt tất cả
                            </h3>
                            <button
                                onClick={() => setShowApproveAllConfirm(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 text-base leading-relaxed">
                                Bạn có chắc chắn muốn duyệt tất cả hồ sơ đang chờ không?
                            </p>
                        </div>
                        <div className="p-4 bg-gray-900/50 flex justify-end gap-3 border-t border-gray-700">
                            <button
                                onClick={() => setShowApproveAllConfirm(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={submitting}
                                onClick={confirmApproveAll}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-colors flex items-center gap-2"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Duyệt tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Approve Single Confirmation Modal */}
            {approveId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-700 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Check size={20} className="text-green-500" />
                                Duyệt hồ sơ cầu thủ
                            </h3>
                            <button
                                onClick={() => setApproveId(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 text-base leading-relaxed">
                                Bạn có chắc chắn muốn duyệt hồ sơ đăng ký của cầu thủ này không?
                            </p>
                        </div>
                        <div className="p-4 bg-gray-900/50 flex justify-end gap-3 border-t border-gray-700">
                            <button
                                onClick={() => setApproveId(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                disabled={submitting}
                                onClick={confirmApproveSingle}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-colors flex items-center gap-2"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Duyệt hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeasonPlayerApprovalPage;
