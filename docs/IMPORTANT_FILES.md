# Important Files Reference

## 🔥 Critical Files - DO NOT DELETE

### Backend Core
```
backend/src/
├── routes/
│   ├── awardsRoutes.ts         ⭐ NEW: Awards API
│   ├── disciplineRoutes.ts     ⭐ NEW: Discipline API
│   └── matchDetailRoutes.ts    (Updated with suspension check)
├── services/
│   ├── awardService.ts         ⭐ NEW: Awards logic
│   ├── disciplinaryService.ts  ⭐ NEW: Discipline logic
│   └── matchLineupService.ts   (Integrated with suspension)
└── data/migrations/
    └── 20250226_player_suspensions.sql  ⭐ NEW: Suspensions table
```

### Frontend Core
```
src/apps/admin/
├── pages/
│   ├── SeasonAwardsPage.jsx      ⭐ NEW: Awards UI
│   └── SeasonDisciplinePage.jsx  ⭐ NEW: Discipline UI
├── components/
│   └── AdminSidebar.jsx          (Updated with new menu items)
└── AdminApp.jsx                  (Updated with new routes)
```

### Configuration
```
.env                    ⚠️ NEVER commit - Contains secrets
backend/.env            ⚠️ NEVER commit - Contains DB credentials
.gitignore              ✅ Protects sensitive files
package.json            ✅ Dependencies
backend/package.json    ✅ Backend dependencies
```

---

## 🛠️ Utility Files - Safe to Modify

### Maintenance Scripts
```
backend/scripts/
├── audit/
│   └── audit_matches.js        ⚠️ IMPORTANT: Run periodically
├── schema/
│   └── *.ts                    ℹ️  Schema check utilities
└── debug/
    └── *.ts                    ℹ️  Debug helpers (one-time use)
```

### Documentation
```
docs/
├── reports/
│   └── AWARDS_DISCIPLINE_*.md  📄 Implementation report
├── QUICK_START.md              📄 Setup guide
├── I18N_GUIDE.md               📄 Translation guide
└── PROJECT_STRUCTURE.md        📄 Structure reference
```

---

## ⚠️ Files to NEVER Commit

### Generated/Output Files (in .gitignore)
```
❌ backend/debug_*.json
❌ backend/output_*.json
❌ backend/fks_*.json
❌ backend/*.txt
❌ backend/columns_*.json
❌ Any *.log files
```

### Sensitive Files (in .gitignore)
```
❌ .env
❌ backend/.env
❌ Any file containing passwords/secrets
```

### Build Output (in .gitignore)
```
❌ dist/
❌ build/
❌ backend/dist/
❌ node_modules/
```

---

## 📋 Periodic Tasks

### Weekly
- [ ] Run `node backend/scripts/audit/audit_matches.js` to verify scores
- [ ] Check backend logs for errors
- [ ] Review suspension data accuracy

### Before Deployment
- [ ] Run all tests: `cd backend && npm test`
- [ ] Check .env files are configured correctly
- [ ] Verify database migrations are applied
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `cd backend && npm run build`

### After Major Changes
- [ ] Update documentation in `docs/`
- [ ] Run schema check scripts if DB changed
- [ ] Add new migration if schema modified
- [ ] Update this reference if file structure changed

---

## 🔍 Quick Search Commands

```bash
# Find all service files
find backend/src/services -name "*.ts"

# Find all route files
find backend/src/routes -name "*.ts"

# Find all test files
find backend/src/__tests__ -name "*.test.ts"

# Find all pages
find src/apps/admin/pages -name "*.jsx"

# Find all documentation
find docs -name "*.md"
```

---

## 📞 Troubleshooting

### If output files appear again:
```bash
# Clean them manually
cd backend
rm -f debug_*.json output_*.json *.txt fks_*.json
```

### If scripts fail:
```bash
# Check if in correct directory
pwd

# For Node.js scripts
node backend/scripts/audit/audit_matches.js

# For TypeScript scripts
cd backend
npm run ts-node scripts/schema/check_columns.ts
```

### If imports break after moving files:
- Check import paths in affected files
- Update relative paths (../../../ etc.)
- Restart dev server

---

**Last Updated:** December 26, 2025
