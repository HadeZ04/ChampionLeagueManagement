import { getSeasonStandings, StandingsMode } from "../services/standingsService_v2";
import { query } from "../db/sqlServer";

// Mock the database query function
jest.mock("../db/sqlServer");

const mockQuery = query as jest.MockedFunction<typeof query>;

describe("Standings Service V2 - Tie-Break Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LIVE mode - In-season standings", () => {
    it("should sort by points then goal difference", async () => {
      // Mock raw standings data
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 18,
            goals_against: 6,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 3,
            team_id: 103,
            team_name: "Team C",
            short_name: "TMC",
            matches_played: 10,
            wins: 6,
            draws: 3,
            losses: 1,
            goals_for: 19,
            goals_against: 10,
            goal_difference: 9,
            points: 21,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "live");

      // Team A and B both have 23 points and +12 GD
      // Team A has more goals for (20 > 18), so should rank higher
      expect(standings[0].teamName).toBe("Team A");
      expect(standings[0].rank).toBe(1);
      expect(standings[1].teamName).toBe("Team B");
      expect(standings[1].rank).toBe(2);
      expect(standings[2].teamName).toBe("Team C");
      expect(standings[2].rank).toBe(3);

      // In LIVE mode, no tie-break info should be present
      expect(standings[0].tieBreakInfo).toBeUndefined();
      expect(standings[1].tieBreakInfo).toBeUndefined();
    });

    it("should allow teams with same rank in LIVE mode", async () => {
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "live");

      // Both teams have exact same stats, should still get distinct ranks
      expect(standings[0].rank).toBe(1);
      expect(standings[1].rank).toBe(2);
    });
  });

  describe("FINAL mode - End-of-season with head-to-head", () => {
    it("should apply head-to-head when points and GD are equal", async () => {
      // Mock raw standings
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      // Mock head-to-head: Team A scored 5 goals, Team B scored 3 goals
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            team_a_goals: 5,
            team_b_goals: 3,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");

      // Team A should be ranked higher due to better H2H
      expect(standings[0].teamName).toBe("Team A");
      expect(standings[0].rank).toBe(1);
      expect(standings[0].tieBreakInfo?.usedHeadToHead).toBe(true);
      expect(standings[0].tieBreakInfo?.headToHeadRecords?.[0].teamGoals).toBe(5);
      expect(standings[0].tieBreakInfo?.headToHeadRecords?.[0].opponentGoals).toBe(3);

      expect(standings[1].teamName).toBe("Team B");
      expect(standings[1].rank).toBe(2);
      expect(standings[1].tieBreakInfo?.usedHeadToHead).toBe(true);
    });

    it("should mark draw lots required when H2H is also tied", async () => {
      // Mock raw standings
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      // Mock head-to-head: Both teams scored 4 goals against each other
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            team_a_goals: 4,
            team_b_goals: 4,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");

      // Both teams should be marked for draw lots
      expect(standings[0].tieBreakInfo?.usedHeadToHead).toBe(true);
      expect(standings[0].tieBreakInfo?.drawLotsRequired).toBe(true);
      expect(standings[0].tieBreakInfo?.tieBreakNote).toContain("bốc thăm");

      expect(standings[1].tieBreakInfo?.usedHeadToHead).toBe(true);
      expect(standings[1].tieBreakInfo?.drawLotsRequired).toBe(true);
    });

    it("should mark draw lots for more than 2 teams with same points and GD", async () => {
      // Mock raw standings with 3 teams tied
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 19,
            goals_against: 7,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 3,
            team_id: 103,
            team_name: "Team C",
            short_name: "TMC",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 18,
            goals_against: 6,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");

      // All 3 teams should be marked for draw lots
      expect(standings.length).toBe(3);
      standings.forEach((team) => {
        expect(team.tieBreakInfo?.drawLotsRequired).toBe(true);
        expect(team.tieBreakInfo?.tieBreakNote).toContain("3 đội");
      });
    });

    it("should not apply H2H when only points match but GD differs", async () => {
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 18,
            goals_against: 7,
            goal_difference: 11, // Different GD
            points: 23,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");

      // Team A has better GD, so ranks higher without H2H
      expect(standings[0].teamName).toBe("Team A");
      expect(standings[1].teamName).toBe("Team B");

      // No H2H should be applied since GD is different
      expect(standings[0].tieBreakInfo).toBeUndefined();
      expect(standings[1].tieBreakInfo).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty standings", async () => {
      mockQuery.mockResolvedValueOnce({
        recordset: [],
      } as any);

      const standings = await getSeasonStandings(1, "live");
      expect(standings).toEqual([]);
    });

    it("should handle single team", async () => {
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");
      expect(standings.length).toBe(1);
      expect(standings[0].rank).toBe(1);
      expect(standings[0].tieBreakInfo).toBeUndefined();
    });

    it("should handle teams with zero H2H goals", async () => {
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            season_team_id: 1,
            team_id: 101,
            team_name: "Team A",
            short_name: "TMA",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
          {
            season_team_id: 2,
            team_id: 102,
            team_name: "Team B",
            short_name: "TMB",
            matches_played: 10,
            wins: 7,
            draws: 2,
            losses: 1,
            goals_for: 20,
            goals_against: 8,
            goal_difference: 12,
            points: 23,
          },
        ],
      } as any);

      // Mock H2H with no matches played (both 0-0)
      mockQuery.mockResolvedValueOnce({
        recordset: [
          {
            team_a_goals: 0,
            team_b_goals: 0,
          },
        ],
      } as any);

      const standings = await getSeasonStandings(1, "final");

      // Should mark for draw lots when both have 0 H2H goals
      expect(standings[0].tieBreakInfo?.drawLotsRequired).toBe(true);
      expect(standings[1].tieBreakInfo?.drawLotsRequired).toBe(true);
    });
  });
});
