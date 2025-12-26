-- Migration: Player Suspensions Table
-- Purpose: Track player suspensions due to yellow/red cards
-- Date: 2025-12-26

CREATE TABLE player_suspensions (
    suspension_id INT IDENTITY(1,1) PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons(season_id),
    season_player_id INT NOT NULL REFERENCES season_player_registrations(season_player_id),
    season_team_id INT NOT NULL REFERENCES season_team_participants(season_team_id),
    reason VARCHAR(32) NOT NULL,
    trigger_match_id INT NULL REFERENCES matches(match_id),
    matches_banned TINYINT NOT NULL DEFAULT 1 CHECK (matches_banned BETWEEN 1 AND 10),
    start_match_id INT NULL REFERENCES matches(match_id),
    served_matches TINYINT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    notes NVARCHAR(512) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NULL,
    CONSTRAINT CK_player_suspensions_reason CHECK (reason IN ('RED_CARD', 'TWO_YELLOW_CARDS', 'VIOLENT_CONDUCT', 'ACCUMULATION', 'OTHER')),
    CONSTRAINT CK_player_suspensions_status CHECK (status IN ('active', 'served', 'cancelled', 'archived')),
    CONSTRAINT CK_player_suspensions_served CHECK (served_matches <= matches_banned),
    CONSTRAINT FK_player_suspensions_season_player FOREIGN KEY (season_id, season_player_id) 
        REFERENCES season_player_registrations(season_id, season_player_id),
    CONSTRAINT FK_player_suspensions_team FOREIGN KEY (season_id, season_team_id) 
        REFERENCES season_team_participants(season_id, season_team_id)
);
GO

CREATE INDEX IX_player_suspensions_player ON player_suspensions (season_player_id, status);
GO
CREATE INDEX IX_player_suspensions_season ON player_suspensions (season_id, status);
GO
CREATE INDEX IX_player_suspensions_match ON player_suspensions (start_match_id);
GO
