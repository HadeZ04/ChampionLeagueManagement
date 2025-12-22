USE ChampionLeagueManagement;
GO
SELECT COUNT(*) as TotalMatches FROM matches;
SELECT TOP 5 match_id, scheduled_kickoff FROM matches ORDER BY scheduled_kickoff DESC;
GO
