import React from 'react'
import { X, CheckCircle, XCircle, MessageSquareWarning } from 'lucide-react'

// --- Giả lập API để lấy chi tiết hồ sơ ---
const FAKE_PROFILE_DETAILS = {
  teamName: 'Barcelona',
  logoUrl: 'https://via.placeholder.com/100',
  homeStadium: 'Spotify Camp Nou',
  players: [
    { id: 1, name: 'Robert Lewandowski', dob: '1988-08-21', nationality: 'Ba Lan', position: 'Tiền đạo', shirtNumber: 9, isValid: true },
    { id: 2, name: 'Lamine Yamal', dob: '2007-07-13', nationality: 'Tây Ban Nha', position: 'Tiền đạo', shirtNumber: 27, isValid: true },
    { id: 3, name: 'Cầu thủ mẫu (Không hợp lệ)', dob: '2009-01-01', nationality: 'Bra-xin', position: 'Tiền đạo', shirtNumber: 99, isValid: false, reason: 'Tuổi không đáp ứng yêu cầu tối thiểu (16).' },
  ]
};
// --- Hết giả lập ---

const ApprovalModal = ({ isOpen, onClose, registration, onApprove }) => {
  if (!isOpen) return null;

  // Trong thực tế, bạn sẽ dùng useEffect và registration.id để fetch chi tiết
  const profile = FAKE_PROFILE_DETAILS;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="admin-surface rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Duyệt hồ sơ: {registration.teamName}</h2>
          <button onClick={onClose} className="text-blue-200/40 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <h3 className="font-semibold text-white mb-4">Danh sách cầu thủ ({profile.players.length})</h3>
          <div className="space-y-3">
            {profile.players.map(player => (
              <div key={player.id} className={`p-3 border-l-4 rounded-md ${player.isValid ? 'border-emerald-400 bg-emerald-500/10' : 'border-rose-400 bg-rose-500/10'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-100">{player.shirtNumber}. {player.name} <span className="text-sm font-normal text-blue-200/40">({player.nationality})</span></p>
                    {!player.isValid && <p className="text-rose-200 text-sm mt-1"><strong>Vi phạm:</strong> {player.reason}</p>}
                  </div>
                  <a href="#" className="text-cyan-300 text-sm hover:text-cyan-200 font-bold">Xem hồ sơ</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-white/10 mt-auto flex justify-end gap-3 bg-[#0a0f1e]/70 rounded-b-lg">
          <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold">
            <MessageSquareWarning size={18} /> Yêu cầu bổ sung
          </button>
          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold">
            <XCircle size={18} /> Từ chối
          </button>
          <button onClick={() => onApprove(registration.id)} className="admin-btn-primary">
            <span><CheckCircle size={18} /> Phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApprovalModal
