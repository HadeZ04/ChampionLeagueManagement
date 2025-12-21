USE ChampionLeagueManagement;
GO
SELECT * FROM seasons;
SELECT COUNT(*) as TotalMatches FROM matches;
SELECT TOP 5 * FROM matches ORDER BY match_id DESC;
GO
