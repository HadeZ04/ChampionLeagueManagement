# Hướng Dẫn Sử Dụng Chức Năng Tự Động Tạo Lời Mời Đội Bóng

## Tổng Quan

Hệ thống hỗ trợ tự động tạo lời mời cho các đội bóng tham gia mùa giải mới dựa trên:
- **Top 8 đội** từ mùa giải trước (được giữ lại)
- **Top 2 đội** từ giải hạng dưới (được thăng hạng)

## Cách Sử Dụng

### 1. Qua API Endpoint

#### Tự động tạo lời mời

```http
POST /api/seasons/{seasonId}/invitations/auto-create
Authorization: Bearer {token}
Content-Type: application/json

{
  "previousSeasonId": 1,
  "responseDeadlineDays": 14,
  "promotedTeamIds": [10, 11]
}
```

**Tham số:**
- `previousSeasonId` (bắt buộc): ID của mùa giải trước
- `promotedTeamIds` (bắt buộc): Mảng ID của 2 đội thăng hạng
- `responseDeadlineDays` (tùy chọn): Số ngày để đội phản hồi (mặc định: 14)

**Ví dụ với cURL:**
```bash
curl -X POST "http://localhost:3000/api/seasons/2/invitations/auto-create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "previousSeasonId": 1,
    "promotedTeamIds": [10, 11],
    "responseDeadlineDays": 14
  }'
```

### 2. Qua Script Command Line

Sử dụng script TypeScript:

```bash
# Cài đặt ts-node nếu chưa có
npm install -g ts-node

# Chạy script
ts-node backend/scripts/autoCreateInvitations.ts \
  --seasonId 2 \
  --previousSeasonId 1 \
  --promotedTeamIds 10,11 \
  --responseDeadlineDays 14 \
  --userId 1
```

**Tham số:**
- `--seasonId`: ID mùa giải mới
- `--previousSeasonId`: ID mùa giải trước
- `--promotedTeamIds`: Danh sách ID đội thăng hạng (phân cách bằng dấu phẩy)
- `--responseDeadlineDays`: Số ngày để đội phản hồi (mặc định: 14)
- `--userId`: ID người dùng tạo lời mời (tùy chọn, sẽ tự lấy admin đầu tiên)

### 3. Các API Endpoint Khác

#### Xem danh sách lời mời

```http
GET /api/seasons/{seasonId}/invitations
Authorization: Bearer {token}
```

#### Tạo lời mời đơn lẻ

```http
POST /api/seasons/{seasonId}/invitations
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamId": 5,
  "inviteType": "retained",
  "responseDeadline": "2025-03-15T00:00:00Z",
  "previousSeasonRank": 3
}
```

#### Kiểm tra điều kiện tham gia

```http
GET /api/seasons/{seasonId}/invitations/{invitationId}/eligibility
Authorization: Bearer {token}
```

#### Cập nhật trạng thái lời mời

```http
PATCH /api/seasons/{seasonId}/invitations/{invitationId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "accepted",
  "responseNotes": "Đội chấp nhận tham gia"
}
```

## Quy Trình Thực Hiện

### Bước 1: Chuẩn bị
1. Đảm bảo mùa giải trước đã hoàn thành và có bảng xếp hạng
2. Tạo mùa giải mới trong hệ thống
3. Xác định 2 đội thăng hạng từ giải hạng dưới

### Bước 2: Tạo lời mời tự động
- Sử dụng API endpoint hoặc script để tự động tạo lời mời
- Hệ thống sẽ tự động:
  - Lấy top 8 đội từ mùa giải trước
  - Tạo lời mời cho 8 đội này (loại: `retained`)
  - Tạo lời mời cho 2 đội thăng hạng (loại: `promoted`)

### Bước 3: Kiểm tra và xác nhận
- Xem danh sách lời mời đã tạo
- Kiểm tra điều kiện tham gia của từng đội
- Đợi các đội phản hồi (accept/decline)

### Bước 4: Xử lý phản hồi
- Các đội có thể accept hoặc decline lời mời
- Admin có thể theo dõi trạng thái qua API

## Điều Kiện Tham Gia

Hệ thống tự động kiểm tra các điều kiện sau:

1. ✅ **Lệ phí tham gia**: 1 tỷ VNĐ đã được thanh toán
2. ✅ **Cơ quan chủ quản**: Phải có trụ sở tại Việt Nam
3. ✅ **Số lượng cầu thủ**: Tối thiểu 16, tối đa 22
4. ✅ **Cầu thủ nước ngoài**: Tối đa 5 khi đăng ký, tối đa 3 khi thi đấu
5. ✅ **Độ tuổi cầu thủ**: Tối thiểu 16 tuổi
6. ✅ **Sân nhà**: 
   - Sức chứa tối thiểu 10,000 chỗ
   - Hạng tối thiểu 2 sao FIFA
   - Nằm tại Việt Nam

## Ví Dụ Sử Dụng

### Tình huống: Tạo mùa giải 2025-2026

1. Mùa giải 2024-2025 đã kết thúc (ID: 1)
2. Tạo mùa giải mới 2025-2026 (ID: 2)
3. Có 2 đội thăng hạng từ giải hạng 2: Team ID 10, 11

**Chạy lệnh:**
```bash
ts-node backend/scripts/autoCreateInvitations.ts \
  --seasonId 2 \
  --previousSeasonId 1 \
  --promotedTeamIds 10,11
```

**Kết quả:**
- Tạo 8 lời mời cho top 8 đội từ mùa 2024-2025
- Tạo 2 lời mời cho 2 đội thăng hạng
- Tổng cộng 10 lời mời được tạo

## Troubleshooting

### Lỗi: "Not enough teams in previous season"
- **Nguyên nhân**: Mùa giải trước chưa có đủ 8 đội
- **Giải pháp**: Kiểm tra bảng xếp hạng của mùa giải trước

### Lỗi: "Promoted teams must be specified manually"
- **Nguyên nhân**: Chưa chỉ định đội thăng hạng
- **Giải pháp**: Thêm tham số `promotedTeamIds` khi gọi API

### Lỗi: "Invitation already exists"
- **Nguyên nhân**: Lời mời đã được tạo trước đó
- **Giải pháp**: Xóa lời mời cũ hoặc sử dụng lời mời hiện có

## Lưu Ý

- Script cần quyền truy cập database
- Đảm bảo user có quyền `manage_rulesets` hoặc `manage_teams`
- Các lời mời sẽ có deadline mặc định là 14 ngày (có thể tùy chỉnh)
- Hệ thống tự động xếp hạng đội dựa trên: Điểm > Hiệu số bàn thắng > Bàn thắng


