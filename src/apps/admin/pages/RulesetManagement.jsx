import React, { useState, useEffect } from 'react';
// Giả sử bạn có RulesetForm trong một modal hoặc trang riêng
// import RulesetForm from '../components/RulesetForm';

const RulesetManagement = () => {
  const [rulesets, setRulesets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Gọi API GET /api/admin/rulesets để lấy dữ liệu
    const fakeData = [
      { id: 1, name: 'Điều lệ Champion League 2024' },
      { id: 2, name: 'Điều lệ Champion League 2025' },
    ];
    setRulesets(fakeData);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading rulesets...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Bộ Điều lệ</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Tạo mới
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Tên Bộ Điều lệ</th>
              <th className="text-right p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rulesets.map((ruleset) => (
              <tr key={ruleset.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{ruleset.name}</td>
                <td className="text-right p-2">
                  <button className="text-blue-500 hover:underline">Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RulesetManagement;