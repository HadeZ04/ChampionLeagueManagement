USE ChampionLeagueManagement;
GO
SELECT COUNT(*) as FootballMatchCount FROM FootballMatches;
SELECT TOP 5 utc_date, home_team_name, away_team_name FROM FootballMatches ORDER BY utc_date DESC;
GO
