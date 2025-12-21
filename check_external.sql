USE ChampionLeagueManagement;
GO
SELECT COUNT(*) as ExternalMatchCount FROM external_matches;
SELECT TOP 5 utc_date, home_team_name, away_team_name FROM external_matches ORDER BY utc_date DESC;
GO
