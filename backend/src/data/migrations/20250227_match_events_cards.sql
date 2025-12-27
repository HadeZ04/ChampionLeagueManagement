/*
  Migration: Match Events Table for Cards/Disciplinary
  Purpose: Create or update match_events table with full support for cards (yellow/red)
  Date: 2025-02-27
  
  This migration ensures match_events table has all necessary columns for tracking cards:
  - card_type (YELLOW, RED, SECOND_YELLOW)
  - season_player_id (to link to player registrations)
  - ruleset_id (to link to rulesets)
  - All necessary constraints and indexes
*/

SET NOCOUNT ON;

IF DB_NAME() IS NULL
BEGIN
  THROW 50000, 'Please run USE <database> before executing this migration.', 1;
END;

PRINT '>> Checking match_events table...';

-- Check if table exists
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'match_events')
BEGIN
  PRINT '>> Creating match_events table...';
  
  CREATE TABLE match_events (
    match_event_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    match_id INT NOT NULL,
    season_id INT NOT NULL,
    season_team_id INT NOT NULL,
    season_player_id INT NULL,
    related_season_player_id INT NULL,
    ruleset_id INT NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    event_minute TINYINT NOT NULL,
    stoppage_time TINYINT NULL,
    goal_type_code VARCHAR(32) NULL,
    card_type VARCHAR(16) NULL,
    description NVARCHAR(512) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_match_events_type CHECK (event_type IN ('GOAL','ASSIST','CARD','SUBSTITUTION','OWN_GOAL','OTHER')),
    CONSTRAINT CK_match_events_minute CHECK (event_minute BETWEEN 0 AND 90),
    CONSTRAINT CK_match_events_stoppage CHECK (stoppage_time IS NULL OR stoppage_time BETWEEN 0 AND 10),
    CONSTRAINT CK_match_events_card CHECK (
      (event_type = 'CARD' AND card_type IN ('YELLOW','RED','SECOND_YELLOW')) OR
      (event_type <> 'CARD' AND card_type IS NULL)
    ),
    CONSTRAINT CK_match_events_goal_type CHECK (
      (event_type = 'GOAL' AND goal_type_code IS NOT NULL) OR
      (event_type <> 'GOAL' AND goal_type_code IS NULL)
    )
  );
  
  -- Note: Foreign keys will be added separately below to ensure referenced tables exist
  
  PRINT '>> match_events table created.';
END
ELSE
BEGIN
  PRINT '>> match_events table already exists. Checking columns...';
  
  -- Add missing columns if they don't exist
  IF COL_LENGTH('match_events', 'season_player_id') IS NULL
  BEGIN
    ALTER TABLE match_events ADD season_player_id INT NULL;
    PRINT '>> Added season_player_id column.';
  END
  
  IF COL_LENGTH('match_events', 'related_season_player_id') IS NULL
  BEGIN
    ALTER TABLE match_events ADD related_season_player_id INT NULL;
    PRINT '>> Added related_season_player_id column.';
  END
  
  IF COL_LENGTH('match_events', 'ruleset_id') IS NULL
  BEGIN
    ALTER TABLE match_events ADD ruleset_id INT NOT NULL DEFAULT 1;
    PRINT '>> Added ruleset_id column.';
  END
  
  IF COL_LENGTH('match_events', 'stoppage_time') IS NULL
  BEGIN
    ALTER TABLE match_events ADD stoppage_time TINYINT NULL;
    PRINT '>> Added stoppage_time column.';
  END
  
  IF COL_LENGTH('match_events', 'goal_type_code') IS NULL
  BEGIN
    ALTER TABLE match_events ADD goal_type_code VARCHAR(32) NULL;
    PRINT '>> Added goal_type_code column.';
  END
  
  IF COL_LENGTH('match_events', 'card_type') IS NULL
  BEGIN
    ALTER TABLE match_events ADD card_type VARCHAR(16) NULL;
    PRINT '>> Added card_type column.';
  END
  
  IF COL_LENGTH('match_events', 'description') IS NULL OR COL_LENGTH('match_events', 'description') < 512
  BEGIN
    -- Update description to NVARCHAR(512) if it exists but is smaller
    IF COL_LENGTH('match_events', 'description') IS NOT NULL
    BEGIN
      ALTER TABLE match_events ALTER COLUMN description NVARCHAR(512) NULL;
      PRINT '>> Updated description column to NVARCHAR(512).';
    END
    ELSE
    BEGIN
      ALTER TABLE match_events ADD description NVARCHAR(512) NULL;
      PRINT '>> Added description column.';
    END
  END
END

-- Add foreign key constraints if they don't exist
IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys 
  WHERE name = 'FK_match_events_match_season' 
  AND parent_object_id = OBJECT_ID('match_events')
)
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'matches')
  BEGIN
    ALTER TABLE match_events
    ADD CONSTRAINT FK_match_events_match_season 
    FOREIGN KEY (match_id, season_id) 
    REFERENCES matches(match_id, season_id)
    ON DELETE CASCADE;
    PRINT '>> Added FK_match_events_match_season constraint.';
  END
END

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys 
  WHERE name = 'FK_match_events_match_ruleset' 
  AND parent_object_id = OBJECT_ID('match_events')
)
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'matches')
  AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'rulesets')
  BEGIN
    ALTER TABLE match_events
    ADD CONSTRAINT FK_match_events_match_ruleset 
    FOREIGN KEY (match_id, ruleset_id) 
    REFERENCES matches(match_id, ruleset_id);
    PRINT '>> Added FK_match_events_match_ruleset constraint.';
  END
END

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys 
  WHERE name = 'FK_match_events_team' 
  AND parent_object_id = OBJECT_ID('match_events')
)
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'season_team_participants')
  BEGIN
    ALTER TABLE match_events
    ADD CONSTRAINT FK_match_events_team 
    FOREIGN KEY (season_id, season_team_id) 
    REFERENCES season_team_participants(season_id, season_team_id);
    PRINT '>> Added FK_match_events_team constraint.';
  END
END

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys 
  WHERE name = 'FK_match_events_player' 
  AND parent_object_id = OBJECT_ID('match_events')
)
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'season_player_registrations')
  AND COL_LENGTH('match_events', 'season_player_id') IS NOT NULL
  BEGIN
    ALTER TABLE match_events
    ADD CONSTRAINT FK_match_events_player 
    FOREIGN KEY (season_id, season_player_id) 
    REFERENCES season_player_registrations(season_id, season_player_id);
    PRINT '>> Added FK_match_events_player constraint.';
  END
END

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys 
  WHERE name = 'FK_match_events_related_player' 
  AND parent_object_id = OBJECT_ID('match_events')
)
BEGIN
  IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'season_player_registrations')
  AND COL_LENGTH('match_events', 'related_season_player_id') IS NOT NULL
  BEGIN
    ALTER TABLE match_events
    ADD CONSTRAINT FK_match_events_related_player 
    FOREIGN KEY (season_id, related_season_player_id) 
    REFERENCES season_player_registrations(season_id, season_player_id);
    PRINT '>> Added FK_match_events_related_player constraint.';
  END
END

-- Add indexes if they don't exist
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes 
  WHERE name = 'IX_match_events_type' 
  AND object_id = OBJECT_ID('match_events')
)
BEGIN
  CREATE INDEX IX_match_events_type 
  ON match_events (match_id, event_type, event_minute);
  PRINT '>> Created IX_match_events_type index.';
END

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes 
  WHERE name = 'IX_match_events_player_type' 
  AND object_id = OBJECT_ID('match_events')
)
BEGIN
  IF COL_LENGTH('match_events', 'season_player_id') IS NOT NULL
  BEGIN
    CREATE INDEX IX_match_events_player_type 
    ON match_events (season_player_id, event_type);
    PRINT '>> Created IX_match_events_player_type index.';
  END
END

-- Add index for card queries (important for disciplinary service)
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes 
  WHERE name = 'IX_match_events_cards' 
  AND object_id = OBJECT_ID('match_events')
)
BEGIN
  IF COL_LENGTH('match_events', 'card_type') IS NOT NULL
  BEGIN
    CREATE INDEX IX_match_events_cards 
    ON match_events (season_id, event_type, card_type, season_player_id)
    WHERE event_type = 'CARD';
    PRINT '>> Created IX_match_events_cards index.';
  END
END

PRINT '>> match_events table migration completed successfully.';
GO

