USE ChampionLeagueManagement;
GO

-- 1. Schema Update: Add logo_url column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'teams' AND COLUMN_NAME = 'logo_url')
BEGIN
    ALTER TABLE teams ADD logo_url VARCHAR(500) NULL;
    PRINT 'Added logo_url column to teams table.';
END
GO

-- 2. Add a Tournament
IF NOT EXISTS (SELECT 1 FROM tournaments WHERE code = 'UCL')
BEGIN
    INSERT INTO tournaments (code, name, organizer, region, founded_year)
    VALUES ('UCL', 'UEFA Champions League', 'UEFA', 'Europe', 1955);
END

-- 3. Add a Ruleset
IF NOT EXISTS (SELECT 1 FROM rulesets WHERE name = 'Standard Rules')
BEGIN
    INSERT INTO rulesets (name, version_tag, is_active, created_by)
    VALUES ('Standard Rules', '1.0', 1, 1);
END

-- 4. Add a Season
DECLARE @TournamentID INT = (SELECT TOP 1 tournament_id FROM tournaments WHERE code = 'UCL');
DECLARE @RulesetID INT = (SELECT TOP 1 ruleset_id FROM rulesets WHERE name = 'Standard Rules');

IF NOT EXISTS (SELECT 1 FROM seasons WHERE code = 'UCL2526')
BEGIN
    INSERT INTO seasons (tournament_id, ruleset_id, name, code, start_date, end_date, participation_fee, status, created_by)
    VALUES (@TournamentID, @RulesetID, '2025/2026', 'UCL2526', '2025-09-01', '2026-05-30', 0, 'scheduled', 1);
END

DECLARE @SeasonID INT = (SELECT TOP 1 season_id FROM seasons WHERE code = 'UCL2526');

-- 5. Add Stadiums
IF NOT EXISTS (SELECT 1 FROM stadiums WHERE name = 'Wembley Stadium')
BEGIN
    INSERT INTO stadiums (name, city, capacity, is_certified)
    VALUES ('Wembley Stadium', 'London', 90000, 1),
           ('Santiago Bernabéu', 'Madrid', 81044, 1),
           ('Allianz Arena', 'Munich', 75024, 1);
END

-- 6. Add Teams (with Logos)
IF NOT EXISTS (SELECT 1 FROM teams WHERE code = 'RMA')
BEGIN
    INSERT INTO teams (name, short_name, code, country, founded_year, status, logo_url)
    VALUES ('Real Madrid', 'RMA', 'RMA', 'Spain', 1902, 'active', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png');
END
ELSE
BEGIN
    UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' WHERE code = 'RMA';
END

IF NOT EXISTS (SELECT 1 FROM teams WHERE code = 'BAY')
BEGIN
    INSERT INTO teams (name, short_name, code, country, founded_year, status, logo_url)
    VALUES ('Bayern Munich', 'BAY', 'BAY', 'Germany', 1900, 'active', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_München_logo_%282017%29.svg/1200px-FC_Bayern_München_logo_%282017%29.svg.png');
END
ELSE
BEGIN
    UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_München_logo_%282017%29.svg/1200px-FC_Bayern_München_logo_%282017%29.svg.png' WHERE code = 'BAY';
END

IF NOT EXISTS (SELECT 1 FROM teams WHERE code = 'LIV')
BEGIN
    INSERT INTO teams (name, short_name, code, country, founded_year, status, logo_url)
    VALUES ('Liverpool', 'LIV', 'LIV', 'England', 1900, 'active', 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png');
END
ELSE
BEGIN
    UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' WHERE code = 'LIV';
END

IF NOT EXISTS (SELECT 1 FROM teams WHERE code = 'MCI')
BEGIN
    INSERT INTO teams (name, short_name, code, country, founded_year, status, logo_url)
    VALUES ('Manchester City', 'MCI', 'MCI', 'England', 1900, 'active', 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png');
END
ELSE
BEGIN
    UPDATE teams SET logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png' WHERE code = 'MCI';
END

-- 7. Register Teams to Season
DECLARE @RealMadridID INT = (SELECT team_id FROM teams WHERE code = 'RMA');
DECLARE @BayernID INT = (SELECT team_id FROM teams WHERE code = 'BAY');
DECLARE @LiverpoolID INT = (SELECT team_id FROM teams WHERE code = 'LIV');
DECLARE @ManCityID INT = (SELECT team_id FROM teams WHERE code = 'MCI');

-- Helper to insert if not exists
IF NOT EXISTS (SELECT 1 FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @RealMadridID)
    INSERT INTO season_team_participants (season_id, team_id, status) VALUES (@SeasonID, @RealMadridID, 'active');

IF NOT EXISTS (SELECT 1 FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @BayernID)
    INSERT INTO season_team_participants (season_id, team_id, status) VALUES (@SeasonID, @BayernID, 'active');

IF NOT EXISTS (SELECT 1 FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @LiverpoolID)
    INSERT INTO season_team_participants (season_id, team_id, status) VALUES (@SeasonID, @LiverpoolID, 'active');

IF NOT EXISTS (SELECT 1 FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @ManCityID)
    INSERT INTO season_team_participants (season_id, team_id, status) VALUES (@SeasonID, @ManCityID, 'active');

-- 8. Add Round
IF NOT EXISTS (SELECT 1 FROM season_rounds WHERE season_id = @SeasonID AND round_number = 1)
BEGIN
    INSERT INTO season_rounds (season_id, round_number, name, status, start_date)
    VALUES (@SeasonID, 1, 'Group Stage - Matchday 1', 'planned', '2025-09-17');
END

DECLARE @RoundID INT = (SELECT TOP 1 round_id FROM season_rounds WHERE season_id = @SeasonID AND round_number = 1);

-- 9. Add Matches
DECLARE @RMA_SeasonTeamID INT = (SELECT season_team_id FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @RealMadridID);
DECLARE @BAY_SeasonTeamID INT = (SELECT season_team_id FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @BayernID);
DECLARE @LIV_SeasonTeamID INT = (SELECT season_team_id FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @LiverpoolID);
DECLARE @MCI_SeasonTeamID INT = (SELECT season_team_id FROM season_team_participants WHERE season_id = @SeasonID AND team_id = @ManCityID);

DECLARE @BernabeuID INT = (SELECT stadium_id FROM stadiums WHERE name = 'Santiago Bernabéu');
DECLARE @AllianzID INT = (SELECT stadium_id FROM stadiums WHERE name = 'Allianz Arena');

-- Ensure participants exist before inserting matches
IF @RMA_SeasonTeamID IS NOT NULL AND @LIV_SeasonTeamID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM matches WHERE season_id = @SeasonID AND round_id = @RoundID AND home_season_team_id = @RMA_SeasonTeamID)
    BEGIN
        INSERT INTO matches (season_id, round_id, matchday_number, home_season_team_id, away_season_team_id, stadium_id, ruleset_id, scheduled_kickoff, status, match_code)
        VALUES 
        (@SeasonID, @RoundID, 1, @RMA_SeasonTeamID, @LIV_SeasonTeamID, @BernabeuID, @RulesetID, DATEADD(day, 1, GETDATE()), 'scheduled', 'MATCH-001');
    END
END

IF @MCI_SeasonTeamID IS NOT NULL AND @BAY_SeasonTeamID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM matches WHERE season_id = @SeasonID AND round_id = @RoundID AND home_season_team_id = @MCI_SeasonTeamID)
    BEGIN
        INSERT INTO matches (season_id, round_id, matchday_number, home_season_team_id, away_season_team_id, stadium_id, ruleset_id, scheduled_kickoff, status, match_code)
        VALUES 
        (@SeasonID, @RoundID, 1, @MCI_SeasonTeamID, @BAY_SeasonTeamID, @AllianzID, @RulesetID, DATEADD(day, 2, GETDATE()), 'scheduled', 'MATCH-002');
    END
END

PRINT 'Seed data updated successfully.';
GO
