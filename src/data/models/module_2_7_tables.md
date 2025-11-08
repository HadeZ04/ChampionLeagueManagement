# Module 2.7 - System Administration Data Model

## 1. Table: `rulesets`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `ruleset_id` | INT | PK, IDENTITY | Unique identifier for each ruleset bundle. |
| 2 | `name` | VARCHAR(255) | NOT NULL, UNIQUE | Display name of the ruleset (e.g. "Điều lệ 2025"). |
| 3 | `version_tag` | VARCHAR(64) | NOT NULL | Semantic version label (e.g. `2025.v1`). |
| 4 | `description` | NVARCHAR(MAX) | NULL | Optional governance notes. |
| 5 | `is_active` | BIT | NOT NULL, DEFAULT 0 | Whether the bundle is the active reference. |
| 6 | `effective_from` | DATE | NULL | Inclusive start date of applicability. |
| 7 | `effective_to` | DATE | NULL | Inclusive end date of applicability. |
| 8 | `created_by` | INT | NOT NULL, FK (`user_accounts.user_id`) | User who created the ruleset. |
| 9 | `created_at` | DATETIME2 | NOT NULL, DEFAULT now | Creation timestamp (UTC). |
|10 | `updated_by` | INT | NULL, FK | Last editor (nullable). |
|11 | `updated_at` | DATETIME2 | NULL | Last update timestamp. |

## 2. Table: `ruleset_player_constraints`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `constraint_id` | INT | PK, IDENTITY | Internal identifier. |
| 2 | `ruleset_id` | INT | FK → `rulesets.ruleset_id`, ON DELETE CASCADE | Parent ruleset bundle. |
| 3 | `min_age` | TINYINT | NOT NULL, CHECK ≥ 12 | Minimum eligible player age. |
| 4 | `max_age` | TINYINT | NOT NULL, CHECK > `min_age` | Maximum eligible player age. |
| 5 | `max_players` | TINYINT | NOT NULL, CHECK BETWEEN 11 AND 40 | Squad size limit. |
| 6 | `max_foreign_players` | TINYINT | NOT NULL, CHECK ≤ `max_players` | Foreign player quota. |
| 7 | `squad_registration_deadline` | DATE | NULL | Deadline to submit squad list. |

## 3. Table: `ruleset_scoring_rules`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `scoring_id` | INT | PK, IDENTITY | Internal identifier. |
| 2 | `ruleset_id` | INT | FK, ON DELETE CASCADE | Parent ruleset. |
| 3 | `max_goal_time` | TINYINT | NOT NULL, CHECK BETWEEN 30 AND 150 | Latest minute eligible for validation. |
| 4 | `accepted_goal_types` | NVARCHAR(MAX) | NOT NULL, JSON | Accepted goal type codes, aligned with QĐ3. |

## 4. Table: `ruleset_ranking_rules`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `ranking_id` | INT | PK, IDENTITY | Internal identifier. |
| 2 | `ruleset_id` | INT | FK, ON DELETE CASCADE | Parent ruleset. |
| 3 | `points_for_win` | TINYINT | NOT NULL | Points awarded for victory (QĐ5). |
| 4 | `points_for_draw` | TINYINT | NOT NULL | Points awarded for draw. |
| 5 | `points_for_loss` | TINYINT | NOT NULL | Points awarded for loss. |
| 6 | `tie_breaking_order` | NVARCHAR(MAX) | NOT NULL, JSON | Ordered metrics used for ranking. |

## 5. Table: `ruleset_audit_log`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `audit_id` | INT | PK, IDENTITY | Unique record identifier. |
| 2 | `ruleset_id` | INT | FK, ON DELETE CASCADE | Ruleset that was changed. |
| 3 | `action` | VARCHAR(64) | NOT NULL | Action type (CREATED, UPDATED, PUBLISHED). |
| 4 | `actor_id` | INT | NOT NULL | Administrator performing the action. |
| 5 | `actor_username` | VARCHAR(150) | NOT NULL | Username snapshot. |
| 6 | `details` | NVARCHAR(MAX) | NULL | Optional JSON or narrative description. |
| 7 | `created_at` | DATETIME2 | NOT NULL | Timestamp of the audit event. |

## 6. Table: `season_ruleset_assignments`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `season_ruleset_id` | INT | PK, IDENTITY | Internal identifier. |
| 2 | `season_id` | INT | NOT NULL, FK (`seasons.season_id`) | Target season. |
| 3 | `ruleset_id` | INT | NOT NULL, FK, ON DELETE RESTRICT | Assigned ruleset bundle. |
| 4 | `assigned_at` | DATETIME2 | NOT NULL | Assignment timestamp. |
| 5 | `assigned_by` | INT | NOT NULL, FK (`user_accounts.user_id`) | Administrator who linked the ruleset. |

## 7. Table: `user_accounts`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `user_id` | INT | PK, IDENTITY | Internal user identifier. |
| 2 | `username` | VARCHAR(150) | NOT NULL, UNIQUE | Login name. |
| 3 | `email` | VARCHAR(255) | NOT NULL, UNIQUE | Contact email. |
| 4 | `password_hash` | VARBINARY(512) | NOT NULL | Secure password storage. |
| 5 | `first_name` | NVARCHAR(100) | NOT NULL | Given name. |
| 6 | `last_name` | NVARCHAR(100) | NOT NULL | Family name. |
| 7 | `status` | VARCHAR(32) | NOT NULL, DEFAULT `active` | Account state (active/inactive/suspended). |
| 8 | `last_login_at` | DATETIME2 | NULL | Last authenticated time. |
| 9 | `must_reset_password` | BIT | NOT NULL, DEFAULT 0 | Force password reset flag. |
|10 | `mfa_enabled` | BIT | NOT NULL, DEFAULT 0 | Whether MFA is enforced. |
|11 | `created_at` | DATETIME2 | NOT NULL | Creation timestamp. |
|12 | `created_by` | INT | NULL, FK | Administrator who created the account. |
|13 | `updated_at` | DATETIME2 | NULL | Last update time. |
|14 | `updated_by` | INT | NULL, FK | Administrator who updated the account. |

## 8. Table: `roles`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `role_id` | INT | PK, IDENTITY | Role identifier. |
| 2 | `code` | VARCHAR(100) | NOT NULL, UNIQUE | Machine-friendly role key. |
| 3 | `name` | NVARCHAR(150) | NOT NULL | Human-readable name. |
| 4 | `description` | NVARCHAR(512) | NULL | Summary of permissions. |
| 5 | `is_system_role` | BIT | NOT NULL, DEFAULT 0 | Protects built-in roles from deletion. |

## 9. Table: `permissions`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `permission_id` | INT | PK, IDENTITY | Identifier. |
| 2 | `code` | VARCHAR(150) | NOT NULL, UNIQUE | Permission key (e.g. `ruleset.publish`). |
| 3 | `name` | NVARCHAR(150) | NOT NULL | Human label. |
| 4 | `description` | NVARCHAR(512) | NULL | Usage notes. |

## 10. Table: `role_permissions`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `role_id` | INT | PK(FK) → `roles.role_id` | Role reference. |
| 2 | `permission_id` | INT | PK(FK) → `permissions.permission_id` | Permission reference. |

## 11. Table: `user_role_assignments`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `user_id` | INT | PK(FK) → `user_accounts.user_id` | Assigned user. |
| 2 | `role_id` | INT | PK(FK) → `roles.role_id` | Assigned role. |
| 3 | `assigned_at` | DATETIME2 | NOT NULL | Timestamp of assignment. |
| 4 | `assigned_by` | INT | NOT NULL, FK | Administrator who performed the assignment. |

## 12. Table: `user_session_lockouts`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `user_id` | INT | PK(FK) | Locked account reference. |
| 2 | `locked_until` | DATETIME2 | NOT NULL | Lock expiry timestamp. |
| 3 | `failed_attempts` | TINYINT | NOT NULL | Failed login counter. |

## 13. Table: `audit_events`
| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | `audit_event_id` | BIGINT | PK, IDENTITY | Unique audit record. |
| 2 | `event_type` | VARCHAR(100) | NOT NULL | Event taxonomy. |
| 3 | `severity` | VARCHAR(32) | NOT NULL | Info/Warning/Critical classification. |
| 4 | `actor_id` | INT | NULL | Performing user id (nullable for system events). |
| 5 | `actor_username` | VARCHAR(150) | NULL | Snapshot of username. |
| 6 | `actor_role` | VARCHAR(100) | NULL | Snapshot of primary role. |
| 7 | `entity_type` | VARCHAR(100) | NOT NULL | Domain entity affected. |
| 8 | `entity_id` | VARCHAR(100) | NOT NULL | Identifier of the entity. |
| 9 | `correlation_id` | UNIQUEIDENTIFIER | NOT NULL, DEFAULT NEWID() | Event correlation token. |
|10 | `payload` | NVARCHAR(MAX) | NULL | JSON payload snapshot. |
|11 | `metadata` | NVARCHAR(MAX) | NULL | Additional attributes (IP, device, etc.). |
|12 | `created_at` | DATETIME2 | NOT NULL | Logged timestamp (UTC). |

## Relationships Overview
- `rulesets` ← `ruleset_player_constraints`, `ruleset_scoring_rules`, `ruleset_ranking_rules`, and `ruleset_audit_log` (cascade delete ensures child records follow the parent bundle).
- `seasons` (existing) link to `rulesets` through `season_ruleset_assignments` with a unique constraint to prevent multiple bundles per season.
- `user_accounts` connect to `roles` via `user_role_assignments`; permissions are granted via `role_permissions`.
- `audit_events` stores the chronological trail for every administrative action and references actors by snapshot to preserve history even if accounts are later removed.
