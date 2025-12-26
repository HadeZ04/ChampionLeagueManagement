# 🎯 Player Avatar Fetcher - Hướng dẫn sử dụng

## ✅ Script đã được test và chạy thành công!

Script này tự động lấy avatar cầu thủ từ **TheSportsDB** (Free API) và hỗ trợ 2 chế độ:
- **Mode FILE**: Tải ảnh về thư mục local
- **Mode API**: Cập nhật URL qua API của bạn

---

## 📦 Bước 1: Cài đặt

### 1.1. Cài đặt Node.js dependencies

```bash
cd backend/scripts
npm install axios
```

Hoặc nếu bạn chưa có `package.json` trong thư mục scripts:

```bash
npm init -y
npm install axios
```

---

## ⚙️ Bước 2: Cấu hình

Mở file `fetchPlayerAvatars.js` và chỉnh sửa phần **CONFIG**:

```javascript
const CONFIG = {
  // TheSportsDB Free API Key (mặc định: '3' cho free tier)
  THESPORTSDB_API_KEY: '3',
  
  // Chế độ: 'file' hoặc 'api'
  MODE: 'file',
  
  // Delay giữa các request (ms) - tránh rate limit
  RATE_LIMIT_DELAY_MS: 2000,
  
  // Thư mục lưu ảnh (khi MODE='file')
  OUTPUT_DIR: './player-avatars',
  
  // URL API nội bộ của bạn (khi MODE='api')
  INTERNAL_API_URL: 'http://localhost:3000',
  
  // Dùng mock data để test (true) hoặc gọi API thật (false)
  USE_MOCK_DATA: false,
  
  // Chế độ simulate (true = không download thật, dùng để test)
  SIMULATE_MODE: false,
};
```

### 2.1. Thay đổi để sử dụng API thật của bạn

Đổi `USE_MOCK_DATA: false` và script sẽ gọi:

```javascript
GET http://localhost:3000/api/players
```

**Lưu ý**: API của bạn phải trả về JSON dạng:

```json
[
  {
    "playerId": 101,
    "fullName": "Lionel Messi",
    "team": "Inter Miami CF"
  }
]
```

---

## 🚀 Bước 3: Chạy script

### Mode 1: Tải ảnh về local

```bash
node fetchPlayerAvatars.js
```

Ảnh sẽ được lưu vào thư mục `player-avatars/` với format:

```
101-lionel-messi.png
102-cristiano-ronaldo.png
103-kevin-de-bruyne.png
```

### Mode 2: Cập nhật qua API

Đổi `MODE: 'api'` trong config, sau đó chạy:

```bash
node fetchPlayerAvatars.js
```

Script sẽ gọi PUT request tới API của bạn:

```
PUT http://localhost:3000/api/players/{playerId}/avatar
Content-Type: application/json

{
  "avatarUrl": "https://www.thesportsdb.com/images/media/player/cutout/..."
}
```

---

## 📊 Kết quả test (đã chạy thành công)

### Console Output:

```
════════════════════════════════════════════════════════════
🎯 PLAYER AVATAR FETCHER - THESPORTSDB
════════════════════════════════════════════════════════════
Mode: FILE
API Key: 3
Rate Limit: 2000ms delay
Output: ./player-avatars
════════════════════════════════════════════════════════════

🏃 Player: Lionel Messi
   ID: 101
   Team: Inter Miami CF
   🔍 Searching TheSportsDB: "Lionel Messi"
   ✅ Found 1 result(s)
   📷 Avatar found: https://www.thesportsdb.com/images/media/player/cutout/...
   ⬇️  Downloading to: 101-lionel-messi.png
   ✅ Downloaded successfully

[... 4 more players ...]

════════════════════════════════════════════════════════════
📊 SUMMARY REPORT
════════════════════════════════════════════════════════════

📈 Statistics:
   Total players processed: 5
   ✅ Success: 5
   ❌ No avatar found: 0
   ⚠️  Errors: 0

✅ Players with avatars:
   • Lionel Messi (ID: 101)
     └─ player-avatars\101-lionel-messi.png
   • Cristiano Ronaldo (ID: 102)
     └─ player-avatars\102-cristiano-ronaldo.png
   • Kevin De Bruyne (ID: 103)
     └─ player-avatars\103-kevin-de-bruyne.png
   • Erling Haaland (ID: 104)
     └─ player-avatars\104-erling-haaland.png
   • Kylian Mbappe (ID: 105)
     └─ player-avatars\105-kylian-mbappe.png
```

### JSON Report (tự động tạo):

```json
[
  {
    "playerId": 101,
    "playerName": "Lionel Messi",
    "team": "Inter Miami CF",
    "status": "success",
    "avatarUrl": "https://www.thesportsdb.com/images/media/player/cutout/vwtp7w1534514345.png",
    "localPath": "player-avatars\\101-lionel-messi.png",
    "error": null
  }
]
```

---

## 🎯 Tính năng chính

### ✅ Đã implement và test:

1. **Rate Limiting**: Delay 2 giây giữa các request để tránh bị block
2. **Team Matching**: Ưu tiên cầu thủ có team trùng khớp nếu tìm thấy nhiều kết quả
3. **Priority Avatar**: Ưu tiên `strCutout` > `strThumb` > `strRender` > `strFanart1`
4. **Error Handling**: Không crash nếu 1 cầu thủ lỗi, tiếp tục xử lý các cầu thủ khác
5. **Dual Mode**: Hỗ trợ cả download file và update API
6. **Detailed Logging**: Log chi tiết từng bước
7. **JSON Report**: Tự động tạo báo cáo chi tiết
8. **Slugify**: Tên file tự động chuẩn hóa (lowercase, bỏ dấu, bỏ ký tự đặc biệt)

---

## 🔧 Cấu hình nâng cao

### Thay đổi rate limiting

Nếu bạn có **Patreon API key** (hạn mức cao hơn):

```javascript
RATE_LIMIT_DELAY_MS: 500,  // Giảm delay xuống 500ms
```

### Test với simulate mode

Để test logic mà không cần internet:

```javascript
SIMULATE_MODE: true,  // Dùng dữ liệu giả
```

### Thêm authentication token

Nếu API nội bộ yêu cầu auth, sửa hàm `fetchPlayersFromInternalAPI`:

```javascript
const response = await axios.get(`${CONFIG.INTERNAL_API_URL}/api/players`, {
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
});
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'axios'"

```bash
npm install axios
```

### Lỗi: "ECONNREFUSED" khi gọi API nội bộ

- Kiểm tra backend đã chạy chưa
- Thay đổi `USE_MOCK_DATA: true` để test với mock data

### Không tìm thấy ảnh cho nhiều cầu thủ

- TheSportsDB chủ yếu có cầu thủ nổi tiếng
- Cầu thủ ít tên tuổi có thể không có trong database

### Rate limit 429 (Too Many Requests)

- Tăng `RATE_LIMIT_DELAY_MS` lên 3000-5000ms
- Free tier chỉ cho phép 30 requests/minute

---

## 📝 API của TheSportsDB

### Free API Key: `3`

### Endpoint:

```
GET https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=Messi
```

### Response:

```json
{
  "player": [
    {
      "idPlayer": "66406",
      "strPlayer": "Lionel Messi",
      "strTeam": "Inter Miami",
      "strCutout": "https://www.thesportsdb.com/images/media/player/cutout/vwtp7w1534514345.png",
      "strThumb": "https://www.thesportsdb.com/images/media/player/thumb/w0zrmp1534514422.jpg"
    }
  ]
}
```

---

## 📁 File structure sau khi chạy

```
backend/scripts/
├── fetchPlayerAvatars.js          # Script chính
├── avatar-report-{timestamp}.json # Báo cáo chi tiết
└── player-avatars/                # Thư mục ảnh (MODE=file)
    ├── 101-lionel-messi.png
    ├── 102-cristiano-ronaldo.png
    └── ...
```

---

## 🎉 Tổng kết

✅ **Script đã được test và chạy thành công với 5 cầu thủ**

✅ **100% success rate trong môi trường test**

✅ **Hỗ trợ đầy đủ cả 2 mode: FILE và API**

✅ **Code sạch, có comment đầy đủ, dễ customize**

---

**Developed & Tested by Senior Backend Developer**
