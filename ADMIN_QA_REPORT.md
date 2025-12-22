# Admin QA Report (WEBFOOTBALL)

Scope: Admin portal under `/admin/*` (React/Vite) + backend APIs under `backend/src` (Node/Express/TypeScript + SQL Server).

## 0) Project Context (observed)

- Frontend: React + Vite + Tailwind + `react-router-dom`
- Backend: Node/Express (TypeScript) + `mssql`
- Auth: JWT access token (`Authorization: Bearer ...`), stored in `localStorage.auth_token`
- Permissions used by Admin UI: `manage_users`, `manage_teams`, `manage_matches`, `manage_content`, `manage_rulesets`, `view_audit_logs`

## A) Inventory (Module → Route → Actions → API → Status)

| Module | Route(s) | Main Actions | API(s) Used | Status |
|---|---|---|---|---|
| Auth | `/admin/login`, `/admin/*` | Login, logout, restore session | `POST /api/auth/login`, `GET /api/auth/me` | OK |
| Dashboard | `/admin/dashboard` | View overview metrics | `GET /api/stats/overview`, `GET /api/audit-events` | OK |
| Reports | `/admin/reports` | View report stats | `GET /api/stats/overview` | OK |
| Users | `/admin/users` | CRUD users, roles | `GET/POST/PUT/DELETE /api/users/*`, `GET/PUT /api/roles/*`, `GET /api/permissions` | OK |
| Roles & Permissions | `/admin/roles` | View roles, set permissions | `GET /api/roles`, `PUT /api/roles/:id/permissions`, `GET /api/permissions` | OK |
| Rulesets | `/admin/rulesets` | CRUD, publish, assign season | `GET/POST/PUT/DELETE /api/rulesets/*`, `POST /api/rulesets/seasons/:seasonId/assign` | OK |
| Seasons | `/admin/seasons` | CRUD seasons | `GET/POST/PUT/DELETE /api/seasons/*`, `GET /api/seasons/metadata` | OK |
| Teams | `/admin/teams`, `/admin/teams/:teamId` | List/search, create/edit/delete, view squad | `GET/POST/PUT/DELETE /api/teams/*`, `GET /api/teams/:id/players` | OK |
| Players | `/admin/players` | List/edit/delete, import/sync | `GET/POST/PUT/DELETE /api/players/*`, `POST /api/season-players/import-csv`, `POST /api/season-players/register` | OK (UX: some `alert()` left) |
| Season Player Lookup | `/admin/season-players` | Filter players by season/team | `GET /api/seasons/:seasonId/teams`, `GET /api/seasons/:seasonId/players` | OK |
| Player Registration Approval | `/admin/season-player-approvals` | Approve/reject/approve-all | `GET/POST /api/season-players/*`, `POST /api/season-players/approve-all` | OK (UX: some `alert()` left) |
| Matches | `/admin/matches` | List/edit/delete, sync, bulk delete | `GET/POST/PUT/DELETE /api/matches/*`, `POST /api/matches/sync` | OK (UX: some `alert()` left) |
| Match Day | `/admin/matches-today` | Today fixtures, start live | `GET /api/matches`, `POST /api/matches/sync` | OK |
| Live Match Update | `/admin/matches/:matchId/live` | Add events, update score, finalize | `GET /api/matches/:id`, `GET/POST /api/matches/:id/events` | OK |
| Standings (Admin) | `/admin/standings` | Init/calc/update/reset standings | `GET/POST/PATCH/DELETE /api/admin/standings/*` | OK (guarded) |
| Standings (View) | `/admin/standings/view` | View standings table | `GET /api/teams/standings` | OK |
| Leaderboard | `/admin/leaderboard` | CRUD leaderboard rows | `GET/POST/PUT/DELETE /api/leaderboard` | OK (writes guarded; GET public) |
| Player Stats | `/admin/player-stats` | CRUD player stats | `GET/POST/PUT/DELETE /api/stats/players` | OK (writes guarded) |
| Audit Log | `/admin/audit-log` | Filter audit events | `GET /api/audit-events` | OK |
| News | `/admin/news` | CRUD articles | `GET/POST/PUT/DELETE /api/news/*` | OK |
| Media Library | `/admin/media` | Upload/list/delete media | `POST /api/media/upload`, `GET /api/media`, `DELETE /api/media/:id` | OK |
| Settings | `/admin/settings` | View/update settings | `GET/PUT /api/settings` | OK |
| Website Content | `/admin/content` | CMS wrapper | (still placeholder) | Partial (UI placeholder) |
| Not wired (pages exist) | (no routes/menu) | Invitations/Approvals/Officials… | N/A | Not wired |

## B) Bugs & Missing (Prioritized)

### P0 (must-fix)
- None found blocking admin boot/login after current fixes.

### P1 (should-fix)
- P1-01 | Content (CMS) | `/admin/content` | Page is placeholder (no real API + no persistence).
- P1-02 | UX consistency | Many admin pages still use `alert()` instead of toast + inline error states (Players/Matches/Approvals…).
- P1-03 | Teams list | `playerCount` is always `0` (backend doesn’t return counts; FE shows “Total Players (loaded)” but not accurate).

### P2 (nice-to-have)
- P2-01 | Build warning | Vite warns about PostCSS plugin missing `from` option (doesn’t block build).
- P2-02 | Performance | Main JS chunk > 500kB; consider code-splitting.

## C) Plan Implement (remaining) + Estimate

1) Implement real CMS content module (APIs + persistence + UI CRUD): 4–8h  
2) Replace `alert()` with toasts + standard error/empty/loading states across admin pages: 3–6h  
3) Add `playerCount` to teams list response (SQL aggregation) + show in UI: 1–2h  
4) Optional: add Playwright e2e (login → CRUD News) against real backend: 3–5h  

## D) Code Changes (high-level)

Backend (not exhaustive):
- `backend/src/config/index.ts`: mask secrets when logging dotenv.
- `backend/src/app.ts`: serve `/uploads`, mount `/api/news`, `/api/media`, `/api/settings`, disable `morgan` in tests.
- `backend/src/middleware/errorHandler.ts`: handle `ZodError` as 400 validation error.
- `backend/src/routes/internalTeamRoutes.ts`: add `POST /api/teams` + audit logs, fix update/delete guards.
- `backend/src/routes/matchRoutes.ts`: add match events endpoints, guard writes.
- `backend/src/routes/statsRoutes.ts`: add `GET /api/stats/overview` (guarded read, guarded writes).
- New: `backend/src/routes/newsRoutes.ts`, `backend/src/services/newsService.ts`, `backend/src/routes/mediaRoutes.ts`, `backend/src/routes/settingsRoutes.ts`, `backend/src/utils/jsonStore.ts`.
- Tests: `backend/jest.config.cjs`, `backend/tsconfig.test.json`, `backend/src/__tests__/*`, `backend/src/test/*`.

Frontend (not exhaustive):
- `src/App.jsx`: redirect unauthenticated admin access to `/admin/login` (preserve `from`).
- `src/apps/admin/pages/LoginPage.jsx`: after login, redirect to `state.from`.
- `src/apps/admin/AdminApp.jsx`: add routes for `/admin/media`, `/admin/content`, `/admin/teams/:teamId`, guard standings, add admin wildcard fallback.
- `src/apps/admin/components/AdminSidebar.jsx`: add permissions for standings + active highlight for subroutes.
- `src/apps/admin/pages/TeamsManagement.jsx`: create/edit/delete teams + modal + toasts + navigate to details.
- New: `src/apps/admin/pages/TeamDetailsPage.jsx`, `src/apps/admin/pages/MediaLibrary.jsx`.
- `src/apps/admin/pages/NewsManagement.jsx`, `src/apps/admin/pages/SettingsPage.jsx`: wire to new backend APIs.
- `src/layers/application/services/TeamsService.js`: normalize `id`, fix players mapping.
- `src/layers/application/services/ApiService.js`: support query params for `delete()`.

## E) Test Plan + Commands

### Automated (backend)
- Run backend tests: `cd backend && npm test`
- Build backend: `cd backend && npm run build`

Included test coverage:
- News API: auth guard + CRUD flow (`backend/src/__tests__/newsRoutes.test.ts`)
- Settings API: auth guard + validation + update (`backend/src/__tests__/settingsRoutes.test.ts`)
- Security regression: key write routes must return 401/403 (`backend/src/__tests__/securityGuards.test.ts`)

### Manual smoke (admin UI)
1) Login `/admin/login` → should redirect back to intended page (if opened deep link).  
2) Sidebar: menu items hidden when permission missing.  
3) Teams: create → edit → view details → delete (verify server rejects without `manage_teams`).  
4) News: create/edit/publish/delete (verify server rejects without `manage_content`).  
5) Settings: load/save (verify server rejects without `manage_users`).  
6) Live match: open `/admin/matches/:id/live` → add event → score updates.  

