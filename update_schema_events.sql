USE ChampionLeagueManagement;
GO

-- =============================================
-- BATCH 1: SCHEMA UPDATES
-- =============================================

-- 1. Match Events Table & Columns
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'match_events')
BEGIN
    CREATE TABLE match_events (
        match_event_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        match_id INT NOT NULL,
        season_id INT NOT NULL,
        season_team_id INT NOT NULL,
        player_name NVARCHAR(100) NULL, -- Added directly in CREATE
        event_type VARCHAR(32) NOT NULL, 
        event_minute TINYINT NOT NULL,
        description NVARCHAR(255) NULL,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT 'Created match_events table.';
END
ELSE
BEGIN
    -- If table exists, check for player_name column
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'match_events' AND COLUMN_NAME = 'player_name')
    BEGIN
        ALTER TABLE match_events ADD player_name NVARCHAR(100) NULL;
        PRINT 'Added player_name column to match_events.';
    END
END

-- 2. Match Team Statistics Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'match_team_statistics')
BEGIN
    CREATE TABLE match_team_statistics (
        stat_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        match_id INT NOT NULL,
        season_team_id INT NOT NULL,
        possession_percent DECIMAL(5,2),
        shots_total TINYINT,
        shots_on_target TINYINT,
        corners TINYINT,
        fouls_committed TINYINT,
        created_at DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    PRINT 'Created match_team_statistics table.';
END

-- 3. Match MVPs Table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'match_mvps')
BEGIN
     CREATE TABLE match_mvps (
        mvp_id INT IDENTITY(1,1) PRIMARY KEY,
        match_id INT NOT NULL,
        player_name NVARCHAR(100) NOT NULL,
        team_name NVARCHAR(100) NOT NULL
     );
     PRINT 'Created match_mvps table.';
END

-- 4. Constraints
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_season_round_number')
BEGIN
    PRINT 'Adding constraint CK_season_round_number...';
    ALTER TABLE season_rounds WITH CHECK ADD CONSTRAINT CK_season_round_number CHECK (round_number BETWEEN 1 AND 18);
END
GO

-- =============================================
-- BATCH 2: DATA POPULATION
-- =============================================

DECLARE @RMA_SeasonTeamID INT = (SELECT TOP 1 season_team_id FROM season_team_participants stp JOIN teams t ON stp.team_id = t.team_id WHERE t.code = 'RMA');
DECLARE @LIV_SeasonTeamID INT = (SELECT TOP 1 season_team_id FROM season_team_participants stp JOIN teams t ON stp.team_id = t.team_id WHERE t.code = 'LIV');
DECLARE @MCI_SeasonTeamID INT = (SELECT TOP 1 season_team_id FROM season_team_participants stp JOIN teams t ON stp.team_id = t.team_id WHERE t.code = 'MCI');
DECLARE @BAY_SeasonTeamID INT = (SELECT TOP 1 season_team_id FROM season_team_participants stp JOIN teams t ON stp.team_id = t.team_id WHERE t.code = 'BAY');

DECLARE @SeasonID INT = (SELECT TOP 1 season_id FROM seasons WHERE code = 'UCL2526');
DECLARE @RulesetID INT = (SELECT TOP 1 ruleset_id FROM rulesets); -- Assuming single ruleset or default

-- Find Matches
DECLARE @MatchRMA_LIV INT = (SELECT TOP 1 match_id FROM matches WHERE home_season_team_id = @RMA_SeasonTeamID AND away_season_team_id = @LIV_SeasonTeamID);
DECLARE @MatchMCI_BAY INT = (SELECT TOP 1 match_id FROM matches WHERE home_season_team_id = @MCI_SeasonTeamID AND away_season_team_id = @BAY_SeasonTeamID);


-- RMA vs LIV Data
IF @MatchRMA_LIV IS NOT NULL
BEGIN
    -- Clear existing
    DELETE FROM match_events WHERE match_id = @MatchRMA_LIV;
    DELETE FROM match_team_statistics WHERE match_id = @MatchRMA_LIV;
    DELETE FROM match_mvps WHERE match_id = @MatchRMA_LIV;

    -- Update Score
    UPDATE matches SET home_score = 3, away_score = 1, status = 'completed' WHERE match_id = @MatchRMA_LIV;

    -- Insert Events (Added ruleset_id)
    INSERT INTO match_events (match_id, season_id, season_team_id, player_name, event_type, event_minute, description, ruleset_id)
    VALUES 
    (@MatchRMA_LIV, @SeasonID, @RMA_SeasonTeamID, 'Vinicius Jr', 'GOAL', 15, 'Beautiful curl shot', @RulesetID),
    (@MatchRMA_LIV, @SeasonID, @LIV_SeasonTeamID, 'Mohamed Salah', 'GOAL', 28, 'Penalty kick', @RulesetID),
    (@MatchRMA_LIV, @SeasonID, @RMA_SeasonTeamID, 'Jude Bellingham', 'GOAL', 55, 'Header from corner', @RulesetID),
    (@MatchRMA_LIV, @SeasonID, @LIV_SeasonTeamID, 'Virgil van Dijk', 'card_yellow', 60, 'Tactical foul', @RulesetID),
    (@MatchRMA_LIV, @SeasonID, @RMA_SeasonTeamID, 'Rodrygo', 'GOAL', 82, 'Counter attack finish', @RulesetID);

    -- Insert Stats (Added season_id)
    INSERT INTO match_team_statistics (match_id, season_team_id, possession_percent, shots_total, shots_on_target, corners, fouls_committed, season_id)
    VALUES
    (@MatchRMA_LIV, @RMA_SeasonTeamID, 55.5, 12, 6, 5, 8, @SeasonID),
    (@MatchRMA_LIV, @LIV_SeasonTeamID, 44.5, 10, 4, 3, 12, @SeasonID);

    -- Insert MVP
    INSERT INTO match_mvps (match_id, player_name, team_name) VALUES (@MatchRMA_LIV, 'Jude Bellingham', 'Real Madrid');
END

-- MCI vs BAY Data
IF @MatchMCI_BAY IS NOT NULL
BEGIN
    -- Clear existing
    DELETE FROM match_events WHERE match_id = @MatchMCI_BAY;
    DELETE FROM match_team_statistics WHERE match_id = @MatchMCI_BAY;
    DELETE FROM match_mvps WHERE match_id = @MatchMCI_BAY;

    -- Update Score
    UPDATE matches SET home_score = 2, away_score = 2, status = 'completed' WHERE match_id = @MatchMCI_BAY;

    -- Insert Events (Added ruleset_id)
    INSERT INTO match_events (match_id, season_id, season_team_id, player_name, event_type, event_minute, description, ruleset_id)
    VALUES 
    (@MatchMCI_BAY, @SeasonID, @MCI_SeasonTeamID, 'Erling Haaland', 'GOAL', 10, NULL, @RulesetID),
    (@MatchMCI_BAY, @SeasonID, @BAY_SeasonTeamID, 'Harry Kane', 'GOAL', 40, NULL, @RulesetID),
    (@MatchMCI_BAY, @SeasonID, @BAY_SeasonTeamID, 'Harry Kane', 'GOAL', 65, NULL, @RulesetID),
    (@MatchMCI_BAY, @SeasonID, @MCI_SeasonTeamID, 'Kevin De Bruyne', 'GOAL', 88, 'Free kick stunner', @RulesetID);

    -- Insert Stats (Added season_id)
    INSERT INTO match_team_statistics (match_id, season_team_id, possession_percent, shots_total, shots_on_target, corners, fouls_committed, season_id)
    VALUES
    (@MatchMCI_BAY, @MCI_SeasonTeamID, 62.0, 18, 8, 8, 5, @SeasonID),
    (@MatchMCI_BAY, @BAY_SeasonTeamID, 38.0, 7, 3, 2, 9, @SeasonID);

    -- Insert MVP
    INSERT INTO match_mvps (match_id, player_name, team_name) VALUES (@MatchMCI_BAY, 'Harry Kane', 'Bayern Munich');
END

PRINT 'Schema updated and data populated successfully.';
GO
