# Import Path Migration Guide

## 🎯 Mục tiêu

Chuẩn hóa tất cả imports trong frontend để sử dụng `@/` alias thay vì relative paths.

---

## ❌ Vấn đề hiện tại

```javascript
// ❌ BAD - Relative paths rất dài và khó maintain
import AuthService from '../../../layers/application/services/AuthService'
import logger from '../../../shared/utils/logger'
import uefaLogo from '../../../assets/images/UEFA_CHAMPIONS_LEAGUE.png'
```

**Problems:**
- Khó đọc và maintain
- Dễ sai khi move files
- Phải đếm số lượng `../`
- Khó refactor

---

## ✅ Giải pháp

```javascript
// ✅ GOOD - Clean and consistent
import AuthService from '@/layers/application/services/AuthService'
import logger from '@/shared/utils/logger'
import uefaLogo from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png'
```

**Benefits:**
- Dễ đọc, rõ ràng
- Không phụ thuộc vào vị trí file
- Dễ refactor và move files
- IDE autocomplete tốt hơn

---

## 🔧 Alias Configuration

### vite.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

### jsconfig.json (for IDE support)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 📋 Migration Checklist

### Files to Update (Priority order)

#### 🔴 High Priority (Services & Core)
- [ ] `src/layers/application/services/*.js`
- [ ] `src/layers/application/context/*.jsx`
- [ ] `src/layers/application/store/*.js`
- [ ] `src/apps/admin/AdminApp.jsx`
- [ ] `src/apps/public/PublicApp.jsx`

#### 🟡 Medium Priority (Components)
- [ ] `src/apps/admin/components/*.jsx`
- [ ] `src/apps/admin/pages/*.jsx`
- [ ] `src/apps/public/components/*.jsx`
- [ ] `src/apps/public/pages/*.jsx`

#### 🟢 Low Priority (Others)
- [ ] `src/components/*.jsx`
- [ ] `src/utils/*.js`

---

## 🛠️ Find & Replace Patterns

### Pattern 1: Services
```bash
# Find
import (.*) from ['"]\.\.\/\.\.\/\.\.\/layers\/application\/services\/(.*)['"]

# Replace with
import $1 from '@/layers/application/services/$2'
```

### Pattern 2: Shared Utils
```bash
# Find
import (.*) from ['"]\.\.\/\.\.\/\.\.\/shared\/utils\/(.*)['"]

# Replace with
import $1 from '@/shared/utils/$2'
```

### Pattern 3: Assets
```bash
# Find
import (.*) from ['"]\.\.\/\.\.\/\.\.\/assets\/(.*)['"]

# Replace with
import $1 from '@/assets/$2'
```

### Pattern 4: Config
```bash
# Find
import (.*) from ['"]\.\.\/\.\.\/\.\.\/config\/(.*)['"]

# Replace with
import $1 from '@/config/$2'
```

---

## 📝 Import Patterns Guide

### Services
```javascript
// Authentication
import AuthService from '@/layers/application/services/AuthService'

// API calls
import ApiService from '@/layers/application/services/ApiService'
import MatchesService from '@/layers/application/services/MatchesService'
import PlayersService from '@/layers/application/services/PlayersService'
import SeasonService from '@/layers/application/services/SeasonService'
```

### Context & Store
```javascript
import { AuthContext } from '@/layers/application/context/AuthContext'
import AppStore from '@/layers/application/store/AppStore'
```

### Shared Utilities
```javascript
import logger from '@/shared/utils/logger'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
```

### Components
```javascript
// Shared components
import Button from '@/components/Button'
import Modal from '@/components/Modal'

// App-specific components
import AdminSidebar from '@/apps/admin/components/AdminSidebar'
import LiveMatchTicker from '@/apps/public/components/LiveMatchTicker'
```

### Assets
```javascript
import uefaLogo from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png'
import trophyImage from '@/assets/images/cup.avif'
import footballImage from '@/assets/images/trai_bong.jpg'
```

### Config & Constants
```javascript
import APP_CONFIG from '@/config/app.config'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
```

### Internationalization
```javascript
import { useTranslation } from 'react-i18next'
import '@/i18n/i18n'
```

---

## 🧪 Testing After Migration

### 1. Check Build
```bash
npm run build
```

### 2. Check Dev Server
```bash
npm run dev
```

### 3. Test Key Pages
- [ ] Admin Dashboard
- [ ] Season Management
- [ ] Awards Page
- [ ] Discipline Page
- [ ] Public Homepage
- [ ] Standings Page

### 4. Check Console
- [ ] No import errors
- [ ] No 404 for assets
- [ ] All images load correctly

---

## ⚠️ Common Issues & Fixes

### Issue 1: IDE not recognizing @/ alias
**Solution:** Create/update `jsconfig.json` in root:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

### Issue 2: Import not found after migration
**Check:**
1. File exists at that path?
2. Correct file extension (.js/.jsx)?
3. Export is named or default?

### Issue 3: Assets not loading
**Check:**
1. File path is correct (case-sensitive)
2. File exists in `src/assets/`
3. Try absolute path: `/src/assets/...`

---

## 🎬 Quick Start Script

Create a script to find all problematic imports:

```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | 
  Select-String -Pattern "from ['\`"]\.\.\/\.\.\/\.\.\/" | 
  Select-Object Path, Line, LineNumber | 
  Export-Csv -Path "imports_to_fix.csv"
```

This will generate a CSV with all files that need updates.

---

## ✅ Success Criteria

- [ ] No relative paths with 3+ levels (`../../../`)
- [ ] All imports use `@/` alias
- [ ] Build succeeds without errors
- [ ] Dev server runs without warnings
- [ ] All pages load correctly
- [ ] All images/assets display properly

---

**Status:** 🟡 IN PROGRESS  
**Last Updated:** December 26, 2025

---

## 📞 Need Help?

If you encounter issues during migration:
1. Check Vite dev server console for errors
2. Verify file paths are correct
3. Ensure jsconfig.json is configured
4. Restart dev server after config changes
5. Clear browser cache if assets don't load
