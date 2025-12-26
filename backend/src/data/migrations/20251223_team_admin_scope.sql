/*
  Team Admin + Player Registration Support
  ----------------------------------------------------
  Idempotent SQL Server migration to support:
    - TEAM_ADMIN scoped to one or more teams (user_team_assignments)
    - Player registration metadata (created_by, reject_reason)

  How to run:
    1) USE <your_database>;
    2) Execute this script.
*/

SET NOCOUNT ON;

IF DB_NAME() IS NULL
BEGIN
  THROW 50000, 'Please run USE <database> before executing this migration.', 1;
END;

PRINT '>> Ensuring user_team_assignments exists...';
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_NAME = 'user_team_assignments'
)
BEGIN
  CREATE TABLE user_team_assignments (
    user_id     INT       NOT NULL,
    team_id     INT       NOT NULL,
    assigned_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    assigned_by INT       NULL,
    CONSTRAINT PK_user_team_assignments PRIMARY KEY (user_id, team_id),
    CONSTRAINT FK_user_team_assignments_user FOREIGN KEY (user_id)
      REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_user_team_assignments_team FOREIGN KEY (team_id)
      REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT FK_user_team_assignments_actor FOREIGN KEY (assigned_by)
      REFERENCES user_accounts(user_id)
  );
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_user_team_assignments_team'
    AND object_id = OBJECT_ID(N'dbo.user_team_assignments')
)
BEGIN
  CREATE INDEX IX_user_team_assignments_team
    ON user_team_assignments (team_id);
END;

PRINT '>> Ensuring season_player_registrations metadata columns exist...';

IF COL_LENGTH('season_player_registrations', 'created_by') IS NULL
BEGIN
  ALTER TABLE season_player_registrations
    ADD created_by INT NULL;

  ALTER TABLE season_player_registrations
    ADD CONSTRAINT FK_season_player_registrations_created_by
      FOREIGN KEY (created_by) REFERENCES user_accounts(user_id);
END;

IF COL_LENGTH('season_player_registrations', 'reject_reason') IS NULL
BEGIN
  ALTER TABLE season_player_registrations
    ADD reject_reason NVARCHAR(255) NULL;
END;

PRINT '>> Team admin scope migration completed.';

