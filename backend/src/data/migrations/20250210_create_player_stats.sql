/* ============================================================================
   PLAYER STATS PERSISTENCE
   ----------------------------------------------------------------------------
   Creates the player_stats table used by the admin portal and public site.
   The table stores leaderboard style statistics across supported categories.
   ============================================================================
*/

IF OBJECT_ID('dbo.player_stats', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping existing player_stats table to recreate schema...';
    DROP TABLE dbo.player_stats;
END;
GO

CREATE TABLE dbo.player_stats (
    stat_id            UNIQUEIDENTIFIER    NOT NULL CONSTRAINT PK_player_stats PRIMARY KEY DEFAULT NEWID(),
    category           NVARCHAR(32)        NOT NULL CONSTRAINT CK_player_stats_category CHECK (category IN ('goals', 'assists', 'clean-sheets', 'minutes')),
    rank               INT                 NOT NULL CONSTRAINT CK_player_stats_rank CHECK (rank > 0),
    player_name        NVARCHAR(255)       NOT NULL,
    team_name          NVARCHAR(255)       NOT NULL,
    team_logo          NVARCHAR(512)       NULL,
    stat_value         INT                 NOT NULL CONSTRAINT CK_player_stats_value CHECK (stat_value >= 0),
    matches_played     INT                 NOT NULL CONSTRAINT CK_player_stats_matches CHECK (matches_played >= 0),
    season             NVARCHAR(16)        NOT NULL,
    position           NVARCHAR(64)        NULL,
    nationality        NVARCHAR(64)        NULL,
    age                INT                 NULL,
    avatar_url         NVARCHAR(1024)      NULL,
    bio                NVARCHAR(MAX)       NULL,
    preferred_foot     NVARCHAR(32)        NULL,
    height             NVARCHAR(32)        NULL,
    recent_matches     NVARCHAR(MAX)       NULL,
    created_at         DATETIME2           NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2           NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_player_stats_category_rank ON dbo.player_stats (category, rank);
CREATE INDEX IX_player_stats_season_category ON dbo.player_stats (season, category);
GO

/* Optional seed data to help during local development */
INSERT INTO dbo.player_stats (
    category, rank, player_name, team_name, team_logo,
    stat_value, matches_played, season, position, nationality, age, avatar_url,
    bio, preferred_foot, height, recent_matches
) VALUES
('goals', 1, 'Kylian Mbappé', 'Paris Saint-Germain', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png',
 8, 6, '2025-2026', 'Forward', 'France', 26, 'https://img.uefa.com/imgml/TP/players/1/2023/324x324/250046432.jpg',
 'Clinical finisher leading PSG''s continental charge.', 'Right', '178 cm',
 '[{"opponent":"Barcelona","result":"2-1 W","contribution":"2 goals"},{"opponent":"Liverpool","result":"1-1 D","contribution":"Scored equaliser"}]'),
('assists', 1, 'Phil Foden', 'Manchester City', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52919.png',
 6, 6, '2025-2026', 'Midfielder', 'England', 25, 'https://img.uefa.com/imgml/TP/players/1/2023/324x324/250073237.jpg',
 'City''s creative hub finding pockets between the lines.', 'Left', '171 cm',
 '[{"opponent":"Real Madrid","result":"3-2 W","contribution":"2 assists"}]'),
('clean-sheets', 1, 'Diogo Costa', 'Porto', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50064.png',
 4, 6, '2025-2026', 'Goalkeeper', 'Portugal', 26, 'https://img.uefa.com/imgml/TP/players/1/2023/324x324/250145128.jpg',
 'Commanding presence with elite reflexes.', 'Right', '193 cm',
 '[{"opponent":"Benfica","result":"1-0 W","contribution":"6 saves"}]'),
('minutes', 1, 'Rodri', 'Manchester City', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52919.png',
 540, 6, '2025-2026', 'Midfielder', 'Spain', 28, 'https://img.uefa.com/imgml/TP/players/1/2023/324x324/250103708.jpg',
 'Anchor man dictating City''s tempo every European night.', 'Right', '191 cm',
 NULL);
GO
