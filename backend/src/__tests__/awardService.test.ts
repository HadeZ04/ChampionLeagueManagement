/**
 * awardService.test.ts
 * Unit tests for Award Service
 */

import { getTopScorers, getTopMVPs, getSeasonAwardsSummary } from '../awardService';
import { getPool } from '../../config/database';

// Mock database
jest.mock('../../config/database');

const mockPool = {
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

describe('AwardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPool as jest.Mock).mockResolvedValue(mockPool);
  });

  describe('getTopScorers', () => {
    it('should return top scorers with correct ranking', async () => {
      const mockData = [
        {
          season_player_id: 1,
          player_id: 101,
          player_name: 'Erling Haaland',
          shirt_number: 9,
          team_id: 1,
          team_name: 'Manchester City',
          nationality: 'Norway',
          goals: 12,
          matches_played: 8
        },
        {
          season_player_id: 2,
          player_id: 102,
          player_name: 'Harry Kane',
          shirt_number: 10,
          team_id: 2,
          team_name: 'Bayern Munich',
          nationality: 'England',
          goals: 10,
          matches_played: 8
        }
      ];

      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await getTopScorers(1, 10);

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].playerName).toBe('Erling Haaland');
      expect(result[0].goals).toBe(12);
      expect(result[1].rank).toBe(2);
      expect(result[1].playerName).toBe('Harry Kane');
      expect(mockPool.input).toHaveBeenCalledWith('seasonId', expect.anything(), 1);
      expect(mockPool.input).toHaveBeenCalledWith('limit', expect.anything(), 10);
    });

    it('should return empty array when no goals scored', async () => {
      mockPool.query.mockResolvedValue({ recordset: [] });

      const result = await getTopScorers(1, 10);

      expect(result).toHaveLength(0);
    });
  });

  describe('getTopMVPs', () => {
    it('should return top MVPs with correct ranking', async () => {
      const mockData = [
        {
          season_player_id: 1,
          player_id: 101,
          player_name: 'Kevin De Bruyne',
          shirt_number: 17,
          team_id: 1,
          team_name: 'Manchester City',
          nationality: 'Belgium',
          mvp_count: 5,
          matches_played: 8
        },
        {
          season_player_id: 2,
          player_id: 102,
          player_name: 'Vinicius Junior',
          shirt_number: 20,
          team_id: 3,
          team_name: 'Real Madrid',
          nationality: 'Brazil',
          mvp_count: 4,
          matches_played: 8
        }
      ];

      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await getTopMVPs(1, 10);

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].playerName).toBe('Kevin De Bruyne');
      expect(result[0].mvpCount).toBe(5);
      expect(result[1].rank).toBe(2);
    });
  });

  describe('getSeasonAwardsSummary', () => {
    it('should return summary with top scorer and MVP', async () => {
      const mockScorerData = [{
        season_player_id: 1,
        player_id: 101,
        player_name: 'Erling Haaland',
        shirt_number: 9,
        team_id: 1,
        team_name: 'Manchester City',
        nationality: 'Norway',
        goals: 12,
        matches_played: 8
      }];

      const mockMVPData = [{
        season_player_id: 2,
        player_id: 102,
        player_name: 'Kevin De Bruyne',
        shirt_number: 17,
        team_id: 1,
        team_name: 'Manchester City',
        nationality: 'Belgium',
        mvp_count: 5,
        matches_played: 8
      }];

      mockPool.query
        .mockResolvedValueOnce({ recordset: mockScorerData })
        .mockResolvedValueOnce({ recordset: mockMVPData });

      const result = await getSeasonAwardsSummary(1);

      expect(result.topScorer).toBeDefined();
      expect(result.topScorer?.playerName).toBe('Erling Haaland');
      expect(result.topMVP).toBeDefined();
      expect(result.topMVP?.playerName).toBe('Kevin De Bruyne');
    });

    it('should return null when no data available', async () => {
      mockPool.query
        .mockResolvedValueOnce({ recordset: [] })
        .mockResolvedValueOnce({ recordset: [] });

      const result = await getSeasonAwardsSummary(1);

      expect(result.topScorer).toBeNull();
      expect(result.topMVP).toBeNull();
    });
  });
});
