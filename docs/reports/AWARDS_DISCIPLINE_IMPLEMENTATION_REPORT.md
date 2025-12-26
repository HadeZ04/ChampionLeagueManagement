# BÁO CÁO HOÀN THIỆN HỆ THỐNG AWARDS & DISCIPLINE

**Ngày hoàn thành:** 26/12/2025  
**Người thực hiện:** AI Senior Fullstack Engineer

---

## 📋 TỔNG QUAN

Đã hoàn thiện 4 chức năng chính cho hệ thống quản lý mùa giải:

1. ✅ **Vua phá lưới (Top Scorers)**
2. ✅ **Cầu thủ xuất sắc (MVP - Player of the Match)**
3. ✅ **Danh sách thẻ vàng / đỏ**
4. ✅ **Tự động treo giò cầu thủ**

---

## 🗄️ I. DATABASE CHANGES

### 1. Migration mới: `player_suspensions` table

**File:** `backend/src/data/migrations/20250226_player_suspensions.sql`

```sql
CREATE TABLE player_suspensions (
    suspension_id INT IDENTITY(1,1) PRIMARY KEY,
    season_id INT NOT NULL,
    season_player_id INT NOT NULL,
    season_team_id INT NOT NULL,
    reason VARCHAR(32) NOT NULL, -- RED_CARD, TWO_YELLOW_CARDS, etc.
    trigger_match_id INT NULL,
    matches_banned TINYINT NOT NULL DEFAULT 1,
    start_match_id INT NULL,
    served_matches TINYINT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    notes NVARCHAR(512) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NULL,
    ...
);
```

**Các trạng thái:**
- `active`: Đang hiệu lực (cầu thủ bị cấm)
- `served`: Đã thi hành xong
- `cancelled`: Đã hủy
- `archived`: Lưu trữ

**Các lý do treo giò:**
- `RED_CARD`: Thẻ đỏ
- `TWO_YELLOW_CARDS`: Tích lũy 2 thẻ vàng
- `VIOLENT_CONDUCT`: Hành vi bạo lực
- `ACCUMULATION`: Tích lũy
- `OTHER`: Khác

---

## 🔧 II. BACKEND IMPLEMENTATION

### 1. Services Created

#### A. `awardService.ts`

**Chức năng:**
- `getTopScorers(seasonId, limit)`: Lấy danh sách vua phá lưới
- `getTopMVPs(seasonId, limit)`: Lấy danh sách cầu thủ xuất sắc
- `getSeasonAwardsSummary(seasonId)`: Tóm tắt giải thưởng mùa

**Logic tính Vua phá lưới:**
```typescript
// Từ bảng match_events
// Lọc: event_type = 'GOAL', match.status = 'COMPLETED'
// Không tính: OWN_GOAL (đã có event_type riêng)
// GROUP BY season_player_id
// ORDER BY goals DESC, matches_played ASC (ít trận hơn xếp trước)
```

**Logic tính MVP:**
```typescript
// Từ bảng player_match_stats
// Lọc: player_of_match = 1, match.status = 'COMPLETED'
// GROUP BY season_player_id
// ORDER BY mvp_count DESC
```

#### B. `disciplinaryService.ts`

**Chức năng:**
- `getCardSummary(seasonId)`: Tổng hợp thẻ phạt theo cầu thủ
- `getSuspensionsForSeason(seasonId, status?)`: Danh sách treo giò
- `getActiveSuspensions(seasonId)`: Treo giò đang hiệu lực
- `isPlayerSuspendedForMatch(seasonId, matchId, seasonPlayerId)`: Kiểm tra treo giò
- `recalculateDisciplinaryForSeason(seasonId)`: Tính toán lại toàn bộ

**Logic tự động treo giò:**

```typescript
// Luật 1: 1 thẻ đỏ → Treo 1 trận kế tiếp
if (red_count >= 1) {
  // Tạo suspension với reason = 'RED_CARD'
  // start_match_id = trận tiếp theo của đội sau khi nhận thẻ đỏ
}

// Luật 2: 2 thẻ vàng (tích lũy toàn mùa) → Treo 1 trận kế tiếp
if (yellow_count >= 2 && !hasRedCardSuspension) {
  // Tạo suspension với reason = 'TWO_YELLOW_CARDS'
  // start_match_id = trận tiếp theo của đội sau thẻ vàng thứ 2
}

// Ưu tiên: Nếu có cả thẻ đỏ và 2 vàng, chỉ tạo 1 suspension (thẻ đỏ)
```

**Giả định quan trọng:**
- ⚠️ **2 thẻ vàng = tích lũy TOÀN MÙA**, không phải trong 1 trận
- ⚠️ Một cầu thủ chỉ bị treo 1 trận cho mỗi milestone (đơn giản hóa)
- ⚠️ Nếu muốn logic phức tạp hơn (mỗi 2 vàng thêm 1 trận), có thể mở rộng sau

### 2. API Routes Created

#### A. `awardsRoutes.ts`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seasons/:seasonId/awards/top-scorers` | GET | Vua phá lưới (query: limit) |
| `/api/seasons/:seasonId/awards/top-mvps` | GET | Cầu thủ xuất sắc (query: limit) |
| `/api/seasons/:seasonId/awards/summary` | GET | Tóm tắt giải thưởng |

**Quyền:** Tất cả cần `authenticate` middleware

#### B. `disciplineRoutes.ts`

| Endpoint | Method | Description | Quyền |
|----------|--------|-------------|-------|
| `/api/seasons/:seasonId/discipline/cards` | GET | Tổng hợp thẻ phạt | authenticate |
| `/api/seasons/:seasonId/discipline/suspensions` | GET | Danh sách treo giò (query: status) | authenticate |
| `/api/seasons/:seasonId/discipline/suspensions/active` | GET | Treo giò đang hiệu lực | authenticate |
| `/api/seasons/:seasonId/discipline/check-suspension` | GET | Kiểm tra treo giò (query: matchId, seasonPlayerId) | authenticate |
| `/api/seasons/:seasonId/discipline/recalculate` | POST | Tính toán lại kỷ luật | admin/super_admin |

### 3. Integration với Lineup Submission

**File:** `backend/src/routes/matchDetailRoutes.ts`

**Logic:**
```typescript
// POST /:matchId/lineups
// Trước khi lưu lineup:

for (const player of lineup) {
  const check = await isPlayerSuspendedForMatch(
    seasonId, 
    matchId, 
    player.seasonPlayerId
  );
  
  if (check.suspended) {
    return res.status(400).json({
      error: 'Lineup contains suspended players',
      suspendedPlayers: [...]
    });
  }
}

// Nếu pass → Tiếp tục lưu lineup
```

**Response khi có cầu thủ bị treo:**
```json
{
  "error": "Lineup contains suspended players",
  "suspendedPlayers": [
    {
      "seasonPlayerId": 123,
      "reason": "RED_CARD",
      "message": "Player suspended due to red card"
    }
  ]
}
```

---

## 💻 III. FRONTEND IMPLEMENTATION

### 1. Admin Pages Created

#### A. `SeasonAwardsPage.jsx`

**Path:** `/admin/awards`

**Features:**
- Dropdown chọn mùa giải
- 2 tabs:
  - **Vua phá lưới:** Top 20 cầu thủ ghi bàn nhiều nhất
  - **Cầu thủ xuất sắc:** Top 20 cầu thủ có số lần MVP cao nhất
- Hiển thị:
  - Rank (với icon huy chương cho top 3)
  - Tên cầu thủ + quốc tịch
  - Đội bóng
  - Số áo
  - Bàn thắng / Số lần MVP
  - Số trận đấu
  - Trung bình/trận (cho scorers)
- Loading state, error handling

#### B. `SeasonDisciplinePage.jsx`

**Path:** `/admin/discipline`

**Features:**
- Dropdown chọn mùa giải
- Nút "Tính lại kỷ luật" (admin only)
  - Gọi API recalculate
  - Confirmation dialog
  - Hiển thị kết quả (số bản ghi archived, created)
- 2 tabs:
  
  **Tab 1: Thống kê thẻ phạt**
  - Filter theo đội
  - Table hiển thị:
    - Cầu thủ, đội, số áo
    - Số thẻ vàng (highlight đỏ nếu >= 2)
    - Số thẻ đỏ (highlight nếu > 0)
    - Số trận đấu
  
  **Tab 2: Danh sách treo giò**
  - Filter theo trạng thái (active/served/cancelled/archived)
  - Badge hiển thị số cầu thủ đang treo giò (tab badge)
  - Table hiển thị:
    - Cầu thủ, đội, số áo
    - Lý do (Thẻ đỏ / 2 thẻ vàng)
    - Trận bị cấm (tên trận + ngày)
    - Số trận (served/total)
    - Trạng thái (badge màu)

### 2. Router Integration

**File:** `src/apps/admin/AdminApp.jsx`

```jsx
<Route path="awards" element={
  <AccessGuard permission="view_reports" currentUser={currentUser}>
    <SeasonAwardsPage />
  </AccessGuard>
} />

<Route path="discipline" element={
  <AccessGuard permission="manage_matches" currentUser={currentUser}>
    <SeasonDisciplinePage />
  </AccessGuard>
} />
```

### 3. Sidebar Menu

**File:** `src/apps/admin/components/AdminSidebar.jsx`

Thêm 2 menu items vào section "Quản lý giải đấu":
- **Giải thưởng** (icon: Award) - `/admin/awards`
- **Kỷ luật** (icon: AlertTriangle) - `/admin/discipline`

---

## 🧪 IV. TESTING

### Test Files Created

1. **`backend/src/__tests__/awardService.test.ts`**
   - Test getTopScorers với ranking
   - Test getTopMVPs
   - Test getSeasonAwardsSummary
   - Edge cases: empty data

2. **`backend/src/__tests__/disciplinaryService.test.ts`**
   - Test getCardSummary
   - Test getSuspensionsForSeason với filter
   - Test isPlayerSuspendedForMatch (true/false)
   - Test recalculateDisciplinaryForSeason:
     - Archive old records
     - Create red card suspensions
     - Create yellow card suspensions
     - Không tạo duplicate (red + yellow)
     - Rollback on error

**Chạy tests:**
```bash
cd backend
npm test awardService.test.ts
npm test disciplinaryService.test.ts
```

---

## 📂 V. FILES CHANGED/CREATED

### Backend Files

**Created:**
1. `backend/src/data/migrations/20250226_player_suspensions.sql`
2. `backend/src/services/awardService.ts`
3. `backend/src/services/disciplinaryService.ts`
4. `backend/src/routes/awardsRoutes.ts`
5. `backend/src/routes/disciplineRoutes.ts`
6. `backend/src/__tests__/awardService.test.ts`
7. `backend/src/__tests__/disciplinaryService.test.ts`

**Modified:**
1. `backend/src/app.ts` - Đăng ký routes mới
2. `backend/src/routes/matchDetailRoutes.ts` - Thêm suspension check

### Frontend Files

**Created:**
1. `src/apps/admin/pages/SeasonAwardsPage.jsx`
2. `src/apps/admin/pages/SeasonDisciplinePage.jsx`

**Modified:**
1. `src/apps/admin/AdminApp.jsx` - Thêm routes
2. `src/apps/admin/components/AdminSidebar.jsx` - Thêm menu items

---

## 🔄 VI. DEPLOYMENT CHECKLIST

### 1. Database Setup
```sql
-- Chạy migration
USE ChampionLeagueDB;
GO
-- Paste nội dung 20250226_player_suspensions.sql
```

### 2. Backend
```bash
cd backend
npm install  # Nếu có dependencies mới
npm run build
npm restart  # hoặc restart service
```

### 3. Frontend
```bash
cd ..  # root project
npm install  # Nếu có dependencies mới
npm run build
# Deploy build folder
```

### 4. Initial Data Setup

Sau khi deploy, cho mỗi mùa giải active:
```bash
# Gọi API recalculate để tạo dữ liệu treo giò ban đầu
POST /api/seasons/{seasonId}/discipline/recalculate
```

---

## 📊 VII. BUSINESS LOGIC SUMMARY

### A. Vua phá lưới

**Nguồn dữ liệu:**
- Bảng `match_events` với `event_type = 'GOAL'`
- Chỉ tính trận `COMPLETED`
- Không tính `OWN_GOAL`

**Xếp hạng:**
1. Số bàn thắng (nhiều hơn xếp trước)
2. Số trận (ít trận hơn xếp trước - hiệu quả cao)
3. Tên cầu thủ (alphabet)

### B. Cầu thủ xuất sắc

**Nguồn dữ liệu:**
- Bảng `player_match_stats` với `player_of_match = 1`
- Hoặc `match_reports.player_of_match_id`
- Chỉ tính trận `COMPLETED`

**Xếp hạng:**
1. Số lần được chọn MVP (nhiều hơn xếp trước)
2. Số trận (ít trận hơn xếp trước)
3. Tên cầu thủ

### C. Thẻ phạt

**Nguồn dữ liệu:**
- Bảng `match_events` với `event_type = 'CARD'`
- `card_type IN ('YELLOW', 'RED', 'SECOND_YELLOW')`

**Tổng hợp:**
- Yellow cards: COUNT card_type = 'YELLOW'
- Red cards: COUNT card_type IN ('RED', 'SECOND_YELLOW')

### D. Tự động treo giò

**Luật hiện tại (có thể điều chỉnh):**

1. **Thẻ đỏ:**
   - 1 thẻ đỏ → Treo 1 trận kế tiếp
   - Áp dụng ngay sau trận nhận thẻ

2. **2 Thẻ vàng:**
   - Tích lũy 2 thẻ vàng trong TOÀN MÙA → Treo 1 trận kế tiếp
   - ⚠️ Không phải 2 thẻ vàng trong 1 trận (đó sẽ là SECOND_YELLOW → thẻ đỏ)

3. **Ưu tiên:**
   - Nếu cầu thủ có cả thẻ đỏ và 2 thẻ vàng → Chỉ tạo 1 suspension (thẻ đỏ)

4. **Trận bị cấm:**
   - `start_match_id` = Trận tiếp theo của đội sau khi trigger
   - Nếu không còn trận → `start_match_id = NULL` (có thể xử lý cho mùa sau)

5. **Thi hành:**
   - Cầu thủ KHÔNG được xuất hiện trong lineup của trận `start_match_id`
   - Backend reject nếu submit lineup có cầu thủ bị treo

---

## 🎯 VIII. NEXT STEPS / ENHANCEMENTS

### Có thể mở rộng sau:

1. **Luật kỷ luật phức tạp hơn:**
   - Mỗi 2 thẻ vàng → thêm 1 trận cấm (4 vàng = 2 trận)
   - Thẻ đỏ trực tiếp = 2-3 trận
   - Thẻ đỏ vì bạo lực = 3-5 trận

2. **Lịch sử chi tiết:**
   - Xem lại từng thẻ phạt: trận nào, phút nào, lý do
   - Timeline của suspension

3. **Thông báo:**
   - Notify team admin khi cầu thủ bị treo giò
   - Email/notification trước trận

4. **Portal công khai:**
   - Public view cho top scorers, MVP
   - Không hiển thị discipline (nội bộ)

5. **Export reports:**
   - PDF awards certificates
   - Excel export cho admin

6. **Tích hợp AI/ML:**
   - Dự đoán vua phá lưới dựa trên form
   - Risk score cho cầu thủ dễ nhận thẻ

---

## ✅ IX. TESTING CHECKLIST

### Manual Testing

- [ ] Chạy migration thành công
- [ ] API awards/top-scorers trả về data đúng
- [ ] API awards/top-mvps trả về data đúng
- [ ] API discipline/cards trả về data đúng
- [ ] API discipline/suspensions trả về data đúng
- [ ] API discipline/recalculate hoạt động (admin only)
- [ ] Submit lineup với cầu thủ bị treo → Reject với message rõ ràng
- [ ] Submit lineup không có cầu thủ treo → Success
- [ ] Frontend Awards page hiển thị đúng
- [ ] Frontend Discipline page hiển thị đúng
- [ ] Sidebar menu links hoạt động
- [ ] Filter và tabs hoạt động

### Automated Testing

- [ ] Run `npm test awardService.test.ts` → All pass
- [ ] Run `npm test disciplinaryService.test.ts` → All pass

---

## 📞 X. SUPPORT

Nếu có vấn đề:

1. **Kiểm tra migration:** Bảng `player_suspensions` đã tạo chưa?
2. **Kiểm tra API:** Dùng Postman test từng endpoint
3. **Kiểm tra logs:** Backend console có error không?
4. **Kiểm tra permissions:** User có quyền `view_reports`, `manage_matches`?

**Common Issues:**

- **"Cannot read property of undefined"**: Kiểm tra DB có data không (trận đã COMPLETED?)
- **"Permission denied"**: User cần quyền phù hợp
- **"Suspension not working"**: Gọi `recalculate` trước để tạo data

---

## 📝 XI. NOTES

1. **Performance:** Các query đã có INDEX phù hợp (season_player_id, match_id)
2. **Transaction Safety:** Recalculate dùng transaction, rollback nếu lỗi
3. **Data Consistency:** Suspension luôn dựa trên match_events (source of truth)
4. **Scalability:** Có thể cache awards data (update mỗi đêm)

---

**End of Report**

✨ Hệ thống Awards & Discipline đã hoàn thiện và sẵn sàng deploy!
