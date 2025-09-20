import React, { useState } from 'react';

// initialData là dữ liệu của bộ điều lệ cần sửa, nếu không có thì là form tạo mới
const RulesetForm = ({ initialData = {}, onSave }) => {
  const [name, setName] = useState(initialData.name || '');
  // TODO: Thêm state cho các quy định khác (minAge, maxAge, pointsForWin, tiebreakers...)

  const handleSubmit = (event) => {
    event.preventDefault();
    const rulesetData = {
      name,
      // ...tổng hợp dữ liệu các quy định khác
    };
    // onSave là một hàm được truyền từ component cha để xử lý việc gọi API
    onSave(rulesetData); 
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">{initialData.id ? 'Chỉnh sửa' : 'Tạo mới'} Bộ Điều lệ</h2>
      
      <div>
        <label htmlFor="ruleset-name" className="block text-sm font-medium text-gray-700">Tên Bộ Điều lệ</label>
        <input
          type="text"
          id="ruleset-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ví dụ: Điều lệ Champion League 2026"
        />
      </div>

      {/* --- Thêm các trường cho QĐ1, QĐ3, QĐ5 tại đây --- */}
      <h3 className="text-lg font-semibold border-t pt-4 mt-4">Quy định Cầu thủ (QĐ1)</h3>
      {/* Ví dụ: ô nhập tuổi tối thiểu */}

      <h3 className="text-lg font-semibold border-t pt-4 mt-4">Quy định Xếp hạng (QĐ5)</h3>
      {/* Ví dụ: các ô nhập điểm thắng/hòa/thua và phần kéo thả thứ tự chỉ số phụ */}

      <div className="text-right">
        <button type="button" className="mr-2 px-4 py-2 rounded">Hủy</button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Lưu Điều lệ
        </button>
      </div>
    </form>
  );
};

export default RulesetForm;