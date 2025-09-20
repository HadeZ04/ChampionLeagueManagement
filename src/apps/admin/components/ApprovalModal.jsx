import React from 'react'
import { X, CheckCircle, XCircle, MessageSquareWarning } from 'lucide-react'

// --- Giả lập API để lấy chi tiết hồ sơ ---
const FAKE_PROFILE_DETAILS = {
  teamName: 'Barcelona',
  logoUrl: 'https://via.placeholder.com/100',
  homeStadium: 'Spotify Camp Nou',
  players: [
    { id: 1, name: 'Robert Lewandowski', dob: '1988-08-21', nationality: 'Poland', position: 'Forward', shirtNumber: 9, isValid: true },
    { id: 2, name: 'Lamine Yamal', dob: '2007-07-13', nationality: 'Spain', position: 'Forward', shirtNumber: 27, isValid: true },
    { id: 3, name: 'John Doe (Invalid)', dob: '2009-01-01', nationality: 'Brazil', position: 'Forward', shirtNumber: 99, isValid: false, reason: 'Age does not meet minimum requirement (16).' },
  ]
};
// --- Hết giả lập ---

const ApprovalModal = ({ isOpen, onClose, registration, onApprove }) => {
  if (!isOpen) return null;

  // Trong thực tế, bạn sẽ dùng useEffect và registration.id để fetch chi tiết
  const profile = FAKE_PROFILE_DETAILS;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Reviewing: {registration.teamName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Player List */}
          <h3 className="font-semibold text-gray-900 mb-4">Player Roster ({profile.players.length})</h3>
          <div className="space-y-3">
            {profile.players.map(player => (
              <div key={player.id} className={`p-3 border-l-4 rounded-md ${player.isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{player.shirtNumber}. {player.name} <span className="text-sm font-normal text-gray-500">({player.nationality})</span></p>
                    {!player.isValid && <p className="text-red-600 text-sm mt-1"><strong>Violation:</strong> {player.reason}</p>}
                  </div>
                  <a href="#" className="text-blue-500 text-sm hover:underline font-medium">View documents</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t mt-auto flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium">
            <MessageSquareWarning size={18} /> Request Update
          </button>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
            <XCircle size={18} /> Reject
          </button>
          <button onClick={() => onApprove(registration.id)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
            <CheckCircle size={18} /> Approve
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApprovalModal