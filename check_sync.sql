USE ChampionLeagueManagement;
GO
SELECT * FROM seasons ORDER BY start_date DESC;
SELECT COUNT(*) as MatchCount FROM matches;
SELECT TOP 5 * FROM matches ORDER BY match_id DESC;
GO
