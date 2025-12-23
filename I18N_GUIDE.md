# Hướng dẫn sử dụng i18n trong Champions League Portal

## Tổng quan
Dự án đã tích hợp **react-i18next** để hỗ trợ 2 ngôn ngữ:
- **vi** (Tiếng Việt) - Mặc định
- **en** (English)

## Cách sử dụng

### 1. Trong Component
```jsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('standings.title')}</h1>
      <p>{t('standings.subtitle')}</p>
    </div>
  )
}
```

### 2. Chuyển đổi ngôn ngữ
Component `<LanguageSwitcher />` đã được tích hợp vào Header.
- Click "VI" để chuyển sang Tiếng Việt
- Click "EN" để chuyển sang English
- Ngôn ngữ được lưu tự động vào localStorage

### 3. Thêm key dịch mới
Khi cần thêm text mới cần dịch:

**File: src/i18n/locales/vi/common.json**
```json
{
  "myFeature": {
    "title": "Tiêu đề mới",
    "description": "Mô tả tính năng"
  }
}
```

**File: src/i18n/locales/en/common.json**
```json
{
  "myFeature": {
    "title": "New Title",
    "description": "Feature description"
  }
}
```

**Sử dụng trong component:**
```jsx
<h1>{t('myFeature.title')}</h1>
<p>{t('myFeature.description')}</p>
```

## Cấu trúc file dịch

### Nguyên tắc đặt tên key:
- **nav.*** - Navigation items
- **standings.*** - Standings page
- **matches.*** - Matches/Fixtures page
- **teams.*** - Teams page
- **stats.*** - Statistics page
- **news.*** - News page
- **common.*** - Common words (loading, error, save, etc.)
- **errors.*** - Error messages

### Ví dụ:
```json
{
  "nav": {
    "home": "Trang chủ",
    "standings": "Bảng xếp hạng"
  },
  "standings": {
    "title": "Bảng xếp hạng UEFA Champions League",
    "heroTitle": "Bảng xếp hạng vòng phân hạng"
  },
  "common": {
    "loading": "Đang tải...",
    "save": "Lưu"
  }
}
```

## Components đã tích hợp i18n

✅ **Header** - Navigation, language switcher
✅ **Footer** - Footer sections
✅ **Standings Page** - Phases, groups, table headers
✅ **Teams Page** - Country filter
✅ **News Page** - Categories
✅ **StandingsTable** - Table headers

## Lưu ý khi phát triển

### ❌ Không làm thế này:
```jsx
<h1>Bảng xếp hạng</h1>  // Hard-code text
```

### ✅ Làm thế này:
```jsx
<h1>{t('standings.title')}</h1>  // Dùng translation key
```

### Nội dung động từ API:
```jsx
// ✅ Đúng - Không dịch dữ liệu từ backend
<p>{team.name}</p>  // "Liverpool", "Barcelona"...

// ✅ Đúng - Chỉ dịch UI labels
<label>{t('teams.coach')}:</label> {team.coach}
```

## Kiểm tra

1. **Chạy dev server:**
```bash
npm run dev
```

2. **Test chuyển ngôn ngữ:**
   - Mở browser tại http://localhost:5173
   - Click nút "EN" ở header
   - Kiểm tra UI text chuyển sang English
   - Click "VI" để quay về Tiếng Việt
   - Reload page - ngôn ngữ vẫn được giữ

3. **Test các pages:**
   - Standings: `/standings`
   - Teams: `/teams`
   - Matches: `/matches`
   - News: `/news`
   - Stats: `/stats`

## Mở rộng

### Thêm ngôn ngữ mới (VD: Tiếng Tây Ban Nha)

1. **Tạo file:** `src/i18n/locales/es/common.json`
2. **Cập nhật config:** `src/i18n/index.js`
```js
import es from './locales/es/common.json'

i18n.init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    es: { translation: es }  // Thêm Spanish
  }
})
```
3. **Cập nhật LanguageSwitcher** để thêm nút "ES"

## Troubleshooting

### Translation key không hoạt động:
1. Kiểm tra key có tồn tại trong cả 2 file vi/common.json và en/common.json
2. Đảm bảo đã import `useTranslation` từ 'react-i18next'
3. Check console browser xem có error không

### Ngôn ngữ không được lưu:
- Kiểm tra localStorage trong DevTools
- Key: `i18nextLng`
- Value: `vi` hoặc `en`

### Component không re-render khi đổi ngôn ngữ:
- Đảm bảo component dùng `useTranslation()` hook
- Text phải dùng `t()` function, không hard-code
