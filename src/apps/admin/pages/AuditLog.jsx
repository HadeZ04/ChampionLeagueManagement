import React, { useState, useEffect } from 'react';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // TODO: Gọi API GET /api/admin/audit-logs
    const fakeLogs = [
      { id: 1, timestamp: '2025-09-17 21:30:00', user: 'manager01', action: 'Cập nhật kết quả trận đấu #123.' },
      { id: 2, timestamp: '2025-09-17 21:28:15', user: 'sysadmin', action: 'Khóa tài khoản người dùng "editor01".' },
      { id: 3, timestamp: '2025-09-17 21:25:40', user: 'manager01', action: 'Phê duyệt hồ sơ đăng ký của đội "FC Demo".' },
    ];
    setLogs(fakeLogs);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nhật ký Hoạt động</h1>
      <div className="bg-white p-4 rounded shadow">
        {/* TODO: Thêm bộ lọc theo người dùng và ngày tháng */}
        <ul className="space-y-2">
          {logs.map(log => (
            <li key={log.id} className="p-2 border-b text-sm">
              <span className="font-mono bg-gray-100 p-1 rounded text-xs">{log.timestamp}</span> - 
              <span className="font-semibold text-blue-700"> {log.user}</span>: 
              <span> {log.action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuditLog;