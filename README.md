

# UEFA Champions League Website 

## Demo
[https://champion-league-management.vercel.app/](https://champion-league-management.vercel.app/)


# UEFA Champions League Website - 3-Tier Architecture
 3b2587c (Updated full database and feature admin)

## 🏗️ Architecture Overview

This project implements a **3-Tier Architecture** with **Dual-Frontend** design for the UEFA Champions League website.

### Architecture Layers

#### 1. Presentation Layer (`src/layers/presentation/`)
- **Public Portal** (`src/apps/public/`) - Fan-facing website
- **Admin Dashboard** (`src/apps/admin/`) - Management interface

#### 2. Application Layer (`src/layers/application/`)
- **Services** - API communication and business logic
- **Store** - State management
- **Logic** - Business rules and calculations
- **Utils** - Utility functions and validation

#### 3. Data Layer (`src/layers/data/`)
- **Models** - Data structure definitions
- **DAO** - Database access objects
- **Migrations** - Database schema management
- **Config** - Database configuration




#### 4. Enviroment
npm install @radix-ui/react-slot @radix-ui/react-toggle-group @radix-ui/react-toggle canvas-confetti class-variance-authority date-fns framer-motion lucide-react react-dom react-intersection-observer react-router-dom react react-hot-toast
 
>>>>>>> 3b2587c (Updated full database and feature admin)
## 📁 Project Structure

```
src/
├── apps/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── SeasonForm.jsx              # (Mới) Module 2.1 - Form quản lý mùa giải
│   │   │   ├── RulesetForm.jsx             # (Mới) Module 2.7 - Form quản lý bộ điều lệ
│   │   │   ├── TeamApprovalConsole.jsx     # (Mới) Module 2.2 - Giao diện phê duyệt đội bóng
│   │   │   ├── ScheduleGenerator.jsx       # (Mới) Module 2.3 - Component tạo lịch tự động
│   │   │   └── LiveMatchUpdater.jsx        # (Mới) Module 2.4 - Giao diện cập nhật trận đấu live
│   │   │
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MatchesManagement.jsx     # (Cần mở rộng) Module 2.4 - Quản lý trận đấu
│   │   │   ├── NewsManagement.jsx        # (Cần mở rộng) Module 2.8 - Quản lý tin tức, media
│   │   │   ├── PlayersManagement.jsx     # (Cần mở rộng) Module 2.2 - Quản lý cầu thủ
│   │   │   ├── ReportsPage.jsx           # (Cần mở rộng) Module 2.6 - Báo cáo, thống kê
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── TeamsManagement.jsx       # (Cần mở rộng) Module 2.2 - Quản lý đội bóng
│   │   │   ├── SeasonManagement.jsx      # (Mới) Module 2.1 - Quản lý mùa giải
│   │   │   ├── RulesetManagement.jsx     # (Mới) Module 2.7 - Quản lý bộ điều lệ
│   │   │   ├── ScheduleManagement.jsx    # (Mới) Module 2.3 - Lập và quản lý lịch
│   │   │   ├── UserManagement.jsx        # (Mới) Module 2.7 - Quản lý người dùng
│   │   │   └── AuditLog.jsx              # (Mới) Module 2.7 - Nhật ký hoạt động
│   │   │
│   │   └── AdminApp.jsx
│   │
│   └── public/
│       ├── components/
│       │   ├── LiveTicker.jsx
│       │   ├── MatchCard.jsx
│       │   ├── MatchPreview.jsx
│       │   ├── NewsCard.jsx
│       │   ├── PublicFooter.jsx
│       │   ├── PublicHeader.jsx
│       │   ├── StandingsTable.jsx
│       │   ├── TopScorers.jsx
│       │   ├── UpcomingMatches.jsx
│       │   └── WeatherWidget.jsx
│       │
│       ├── pages/
│       │   ├── GamingPage.jsx            # (Cần mở rộng) Module 2.8 - Bình chọn, dự đoán
│       │   ├── HomePage.jsx
│       │   ├── MatchesPage.jsx
│       │   ├── NewsPage.jsx
│       │   ├── StandingsPage.jsx
│       │   ├── StatsPage.jsx
│       │   ├── TeamsPage.jsx
│       │   ├── VideoPage.jsx
│       │   ├── PlayerProfilePage.jsx     # (Mới) Module 2.5 - Trang hồ sơ cầu thủ
│       │   ├── TeamProfilePage.jsx       # (Mới) Module 2.5 - Trang hồ sơ đội bóng
│       │   └── ArticleDetailPage.jsx     # (Mới) Module 2.8 - Trang đọc tin chi tiết
│       │
│       └── PublicApp.jsx
│
├── config/
│   └── app.config.js
│
├── layers/
│   ├── application/
│   │   ├── logic/
│   │   │   └── TournamentLogic.js
│   │   ├── services/
│   │   │   ├── ApiService.js
│   │   │   ├── AuthService.js
│   │   │   ├── MatchesService.js
│   │   │   ├── TeamsService.js
│   │   │   ├── SeasonService.js          # (Mới) Logic cho mùa giải, điều lệ
│   │   │   ├── ContentService.js         # (Mới) Logic cho CMS, tin tức
│   │   │   └── UserService.js            # (Mới) Logic cho người dùng
│   │   ├── store/
│   │   │   └── AppStore.js
│   │   └── utils/
│   │       └── index.js
│   │
│   └── data/
│       ├── config/
│       │   └── DatabaseConfig.js
│       ├── dao/
│       │   └── TeamDAO.js
│       ├── migrations/
│       │   ├── ... (các file sql)
│       └── models/
│           ├── MatchModel.js
│           ├── TeamModel.js
│           ├── PlayerModel.js            # (Mới)
│           ├── SeasonModel.js            # (Mới)
│           └── RulesetModel.js           # (Mới)
│
└── shared/
    ├── components/
    │   ├── ErrorBoundary.jsx
    │   └── LoadingSpinner.jsx
    └── utils/
        └── constants.js
## 🚀 Getting Started


### Module 2.7 - System Administration Data Schema

The database artefacts for ruleset governance, user administration, and audit logging are documented under:

- src/data/migrations/20250125_module_2_7.sql - executable DDL for new tables.
- src/data/models/module_2_7_tables.md - tabular breakdown of every column and constraint.

Key entities:

- **Rulesets**: rulesets, ruleset_player_constraints, ruleset_scoring_rules, ruleset_ranking_rules, ruleset_audit_log, season_ruleset_assignments.
- **User Administration**: user_accounts, roles, permissions, role_permissions, user_role_assignments, user_session_lockouts.
- **Audit Trail**: audit_events capturing high-level administrative actions with severity metadata and JSON payload snapshots.

### Backend (Module 2.7)

A Node.js/Express TypeScript backend skeleton lives in ackend/. It covers database connectivity, auth/session flow, user & role management, ruleset governance, and audit logging with MSSQL.

**Key entry points**
- ackend/src/server.ts - bootstraps the Express server.
- ackend/src/db/sqlServer.ts - shared SQL Server connection + helpers.
- ackend/src/routes/ - route handlers for auth, users, roles, rulesets, audit events.

**Getting started**
1. cd backend`n2. 
pm install`n3. Copy .env.example to .env and update connection credentials.
4. 
pm run dev`n
The services assume the SQL schema created by src/data/migrations/20250125_module_2_7.sql. Adjust permissions strings (manage_users, manage_rulesets, iew_audit_logs) to align with your seed data.

