# Project Structure

##  Cấu trúc dự án sau khi tổ chức lại

```
ChampionLeagueManagement/
  backend/                      # Backend API (Node.js + Express + SQL Server)
│   ├── 📁 src/
│   │   ├── 📁 routes/               # API endpoints
        services/             # Business logic
          awardService.ts      #  NEW: Awards (Top Scorers, MVP)
          disciplinaryService.ts #  NEW: Discipline (Cards, Suspensions)
          ...
        data/
          migrations/          # Database migrations
        config/               # Configuration
        middleware/           # Express middleware
        __tests__/            # Unit tests
   
     scripts/                  # Utility & maintenance scripts
        audit/                # Score audit & verification
          audit_matches.js     #  QUAN TRỌNG: Auto-fix match scores
          check_score.js
          fix_and_verify.js
          fix_match_score.js
      
        schema/               # Database schema checks
          check_columns.ts
          check_fks_node.js
          list_*_fks.ts
          ...
      
        debug/                # Debug utilities (one-time use)
          debug_*.ts
          find_*.ts
          check_team_34.*
      
       execute_sql.ts           # SQL executor utility
       initializeStandings.ts   # Initialize standings
       README.md                # Scripts documentation
   
     uploads/                  # File uploads (PDFs, media)
    package.json
    tsconfig.json
    jest.config.cjs

  src/                          #  FRONTEND (React + Vite)
   
     apps/                     #  Multi-app architecture
      
        admin/                # Admin Dashboard Application
           pages/
             DashboardPage.jsx
             SeasonManagement.jsx
             SeasonAwardsPage.jsx      #  NEW: Awards page
             SeasonDisciplinePage.jsx  #  NEW: Discipline page
             TeamsManagement.jsx
             MatchesManagement.jsx
             PlayersManagement.jsx
             NewsManagement.jsx
             UsersManagement.jsx
             StandingsManagement.jsx
             ...
         
           components/
             AdminLayout.jsx
             AdminSidebar.jsx          # (Updated with Awards/Discipline menu)
             AdminHeader.jsx
             SeasonFormModal.jsx
             ConfirmationModal.jsx
             AccessGuard.jsx
             ...
         
          AdminApp.jsx                  # Admin app routes
          utils/                        # Admin-specific utilities
      
        public/                        # Public Portal Application
            pages/
              HomePage.jsx
              StandingsPage.jsx
              MatchesPage.jsx
              NewsListPage.jsx
              HistoryPage.jsx
              ...
          
            components/
              PublicLayout.jsx
              PublicHeader.jsx
              LiveMatchTicker.jsx
              ...
          
           PublicApp.jsx                 # Public app routes
   
     layers/                   #  Application layers (DDD/Clean Architecture)
        application/          # Application layer
           services/         # Frontend services (API calls)
             ApiService.js
             AuthService.js
             SeasonService.js
             MatchesService.js
             PlayersService.js
             ...
         
           context/          # React contexts
             AuthContext.jsx
             ...
         
           store/            # State management
              AppStore.js
      
        data/                 # Data layer
           config/
               DatabaseConfig.js
   
     components/               #  Shared components (cross-app)
       Button.jsx
       Modal.jsx
       Table.jsx
       ...
   
     shared/                   #  Shared utilities & helpers
        utils/
          logger.js
          formatters.js
          ...
      
        hooks/                # Custom React hooks
           ...
   
     assets/                   #  Static assets
        images/
          UEFA_CHAMPIONS_LEAGUE.png
          cup.avif
          ...
      
        fonts/
   
     i18n/                     #  Internationalization
       i18n.js
        locales/
           en/
              common.json
           vi/
               common.json
   
     config/                   #  Configuration
       app.config.js
       routes.config.js
   
     constants/                #  Constants
       apiEndpoints.js
       ...
   
     utils/                    #  General utilities
       ...
   
    App.jsx                      # Main app component
    main.jsx                     # Entry point
    index.css                    # Global styles

  docs/                         #  Documentation
     reports/                  # Technical reports
       AWARDS_DISCIPLINE_IMPLEMENTATION_REPORT.md
   
     archive/                  # Old reports (archived)
       ADMIN_QA_REPORT.md
       FRONTEND_*.md
       HEADER_*.md
       LOW_PRIORITY_FIXES.md
   
    README.md                    # Docs index
    QUICK_START.md               # Quick start guide
    I18N_GUIDE.md                # Internationalization guide
    PROJECT_STRUCTURE.md         # This file
    IMPORTANT_FILES.md           # Important files reference

  public/                       # Static public assets
    teams/                       # Team logos

 README.md                        # Main project readme
 package.json                     # Frontend dependencies
 vite.config.ts                   # Vite configuration (with @/ alias)
 tsconfig.json                    # TypeScript config
 tailwind.config.js               # Tailwind CSS config
 .gitignore                       # Git ignore rules
 seed_data.sql                    # Database seed data
```

---

##  Import Path Rules

###  ALWAYS use @/ alias (configured in vite.config.ts)

```javascript
//  CORRECT - Using @/ alias
import AuthService from '@/layers/application/services/AuthService'
import Button from '@/components/Button'
import uefaLogo from '@/assets/images/UEFA_CHAMPIONS_LEAGUE.png'
import logger from '@/shared/utils/logger'

//  WRONG - Using relative paths
import AuthService from '../../../layers/application/services/AuthService'
import Button from '../../components/Button'
```

### Alias Configuration (vite.config.ts)
```typescript
resolve: {
  alias: {
    \"@\": path.resolve(__dirname, \"src\"),
  },
}
```

---

##  Frontend Architecture Explained

### Multi-App Structure
Dự án sử dụng **multi-app architecture** với 2 ứng dụng độc lập:

1. **Admin App** (\src/apps/admin/\)
   - Route prefix: \/admin\
   - Users: Admin, Team Admin, Officials
   - Features: Season management, player registration, match management, awards, discipline

2. **Public Portal** (\src/apps/public/\)
   - Route prefix: \/\
   - Users: Public visitors
   - Features: View standings, matches, news, history

### Layered Architecture
```
apps/            Presentation layer (UI)
 admin/
 public/

layers/          Business logic layer
 application/   Services, Context, Store
 data/          Data access config

components/      Shared UI components
shared/          Shared utilities
```

---

##  Quick Commands

### Development
```bash
# Backend
cd backend
npm install
npm run dev           # Port 4001

# Frontend
npm install
npm run dev           # Port 3000 (proxies /api to backend:4001)
```

### Build
```bash
# Frontend
npm run build         # Output: dist/

# Backend
cd backend
npm run build         # Output: backend/dist/
```

---

##  Notes

### Frontend Structure is CORRECT
-  \src/apps/\ is the proper structure for multi-app frontend
-  NOT a mistake - This is modern frontend architecture
-  Each app (admin/public) is self-contained with its own pages & components
-  Shared code lives in root \src/\ folders

### Import Best Practices
-  Always use \@/\ alias for cleaner imports
-  Configure IDE to resolve \@/\ alias (jsconfig.json or tsconfig.json)
-  Avoid relative paths like \../../../\ - use \@/\ instead

---

**Last Updated:** December 26, 2025
