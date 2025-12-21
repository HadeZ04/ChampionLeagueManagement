USE ChampionLeagueManagement;
GO
-- Delete fake matches scheduled for 2025 (The synced data is 2024)
DELETE FROM match_events WHERE match_id IN (SELECT match_id FROM matches WHERE scheduled_kickoff > '2025-01-01');
DELETE FROM match_team_statistics WHERE match_id IN (SELECT match_id FROM matches WHERE scheduled_kickoff > '2025-01-01');
DELETE FROM match_mvps WHERE match_id IN (SELECT match_id FROM matches WHERE scheduled_kickoff > '2025-01-01');
DELETE FROM matches WHERE scheduled_kickoff > '2025-01-01';

-- Also checking what seasons are there
SELECT * FROM seasons;
GO
