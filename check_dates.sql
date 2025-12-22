USE ChampionLeagueManagement;
GO
SELECT MIN(scheduled_kickoff) as FirstMatch, MAX(scheduled_kickoff) as LastMatch FROM matches;
SELECT TOP 5 scheduled_kickoff, status FROM matches ORDER BY scheduled_kickoff DESC;
GO
