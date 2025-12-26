# Backend Utility Scripts

Các script tiện ích để maintain và debug database.

##  Audit Scripts (scripts/audit/)

### audit_matches.js
**Chức năng:** Kiểm tra và tự động sửa điểm số trận đấu
```bash
cd backend
node scripts/audit/audit_matches.js
```

### check_score.js
**Chức năng:** Xem điểm số của trận đấu cụ thể
```bash
node scripts/audit/check_score.js
```

##  Schema Check Scripts (scripts/schema/)

Các script kiểm tra cấu trúc database:
- check_columns.ts - Kiểm tra cột trong bảng
- check_fks_node.js - Kiểm tra foreign keys
- list_*_fks.ts - Liệt kê các foreign keys

```bash
npm run ts-node scripts/schema/check_columns.ts
```

##  Debug Scripts (scripts/debug/)

Các script debug one-time, dùng khi gặp vấn đề:
- debug_service_delete.ts - Debug delete operations
- find_*.ts - Tìm kiếm data trong DB
- check_team_34.* - Kiểm tra dependencies của team

```bash
npm run ts-node scripts/debug/find_team.ts
```

##  Lưu ý

- Các script này **không** là phần của ứng dụng chính
- Chỉ chạy khi cần maintenance hoặc debug
- Backup database trước khi chạy scripts có tính năng modify data
