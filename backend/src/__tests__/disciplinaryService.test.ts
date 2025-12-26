/**
 * disciplinaryService.test.ts
 * Unit tests for Disciplinary Service
 */

import {
  getCardSummary,
  getSuspensionsForSeason,
  isPlayerSuspendedForMatch,
  recalculateDisciplinaryForSeason
} from '../disciplinaryService';
import { getPool } from '../../config/database';

// Mock database
jest.mock('../../config/database');

const mockPool = {
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  begin: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

describe('DisciplinaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPool as jest.Mock).mockResolvedValue(mockPool);
    mockPool.transaction.mockReturnValue(mockTransaction);
  });

  describe('getCardSummary', () => {
    it('should return card summary for all players', async () => {
      const mockData = [
        {
          season_player_id: 1,
          player_id: 101,
          player_name: 'Sergio Ramos',
          shirt_number: 4,
          team_id: 1,
          team_name: 'Real Madrid',
          yellow_cards: 3,
          red_cards: 1,
          matches_played: 8
        },
        {
          season_player_id: 2,
          player_id: 102,
          player_name: 'Casemiro',
          shirt_number: 14,
          team_id: 2,
          team_name: 'Manchester United',
          yellow_cards: 4,
          red_cards: 0,
          matches_played: 8
        }
      ];

      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await getCardSummary(1);

      expect(result).toHaveLength(2);
      expect(result[0].playerName).toBe('Sergio Ramos');
      expect(result[0].yellowCards).toBe(3);
      expect(result[0].redCards).toBe(1);
      expect(result[1].yellowCards).toBe(4);
      expect(result[1].redCards).toBe(0);
    });

    it('should return empty array when no cards issued', async () => {
      mockPool.query.mockResolvedValue({ recordset: [] });

      const result = await getCardSummary(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('getSuspensionsForSeason', () => {
    it('should return suspensions with match info', async () => {
      const mockData = [
        {
          suspension_id: 1,
          season_player_id: 1,
          player_id: 101,
          player_name: 'Sergio Ramos',
          shirt_number: 4,
          team_id: 1,
          team_name: 'Real Madrid',
          reason: 'RED_CARD',
          trigger_match_id: 10,
          trigger_match_info: 'Barcelona vs Real Madrid (15/12/2025)',
          matches_banned: 1,
          start_match_id: 11,
          start_match_info: 'Real Madrid vs PSG (22/12/2025)',
          served_matches: 0,
          status: 'active',
          notes: null,
          created_at: new Date('2025-12-15')
        }
      ];

      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await getSuspensionsForSeason(1);

      expect(result).toHaveLength(1);
      expect(result[0].playerName).toBe('Sergio Ramos');
      expect(result[0].reason).toBe('RED_CARD');
      expect(result[0].status).toBe('active');
      expect(result[0].matchesBanned).toBe(1);
    });

    it('should filter by status when provided', async () => {
      mockPool.query.mockResolvedValue({ recordset: [] });

      await getSuspensionsForSeason(1, 'active');

      expect(mockPool.input).toHaveBeenCalledWith('status', expect.anything(), 'active');
    });
  });

  describe('isPlayerSuspendedForMatch', () => {
    it('should return true when player is suspended', async () => {
      const mockData = [
        {
          suspension_id: 1,
          reason: 'RED_CARD'
        }
      ];

      mockPool.query.mockResolvedValue({ recordset: mockData });

      const result = await isPlayerSuspendedForMatch(1, 11, 1);

      expect(result.suspended).toBe(true);
      expect(result.reason).toBe('RED_CARD');
      expect(result.suspensionId).toBe(1);
    });

    it('should return false when player is not suspended', async () => {
      mockPool.query.mockResolvedValue({ recordset: [] });

      const result = await isPlayerSuspendedForMatch(1, 11, 1);

      expect(result.suspended).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('recalculateDisciplinaryForSeason', () => {
    it('should archive old suspensions and create new ones', async () => {
      // Mock archive operation
      mockTransaction.query
        .mockResolvedValueOnce({ rowsAffected: [2] }) // Archive 2 old records
        .mockResolvedValueOnce({ // Get card counts
          recordset: [
            {
              season_player_id: 1,
              season_team_id: 1,
              yellow_count: 2,
              red_count: 0,
              last_yellow_match: 10,
              last_red_match: null
            }
          ]
        })
        .mockResolvedValueOnce({ recordset: [{ match_id: 12 }] }) // Next match
        .mockResolvedValueOnce({ rowsAffected: [1] }); // Insert suspension

      const result = await recalculateDisciplinaryForSeason(1);

      expect(result.archived).toBe(2);
      expect(result.created).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockTransaction.query.mockRejectedValue(new Error('Database error'));

      await expect(recalculateDisciplinaryForSeason(1)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should create suspension for red card', async () => {
      mockTransaction.query
        .mockResolvedValueOnce({ rowsAffected: [0] })
        .mockResolvedValueOnce({
          recordset: [{
            season_player_id: 1,
            season_team_id: 1,
            yellow_count: 0,
            red_count: 1,
            last_yellow_match: null,
            last_red_match: 10
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ match_id: 11 }] })
        .mockResolvedValueOnce({ rowsAffected: [1] });

      const result = await recalculateDisciplinaryForSeason(1);

      expect(result.created).toBe(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should create suspension for two yellow cards', async () => {
      mockTransaction.query
        .mockResolvedValueOnce({ rowsAffected: [0] })
        .mockResolvedValueOnce({
          recordset: [{
            season_player_id: 1,
            season_team_id: 1,
            yellow_count: 2,
            red_count: 0,
            last_yellow_match: 10,
            last_red_match: null
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ match_id: 11 }] })
        .mockResolvedValueOnce({ recordset: [] }) // No existing red card suspension
        .mockResolvedValueOnce({ rowsAffected: [1] });

      const result = await recalculateDisciplinaryForSeason(1);

      expect(result.created).toBe(1);
    });

    it('should not create yellow suspension if red card exists', async () => {
      mockTransaction.query
        .mockResolvedValueOnce({ rowsAffected: [0] })
        .mockResolvedValueOnce({
          recordset: [{
            season_player_id: 1,
            season_team_id: 1,
            yellow_count: 2,
            red_count: 1,
            last_yellow_match: 10,
            last_red_match: 10
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ match_id: 11 }] })
        .mockResolvedValueOnce({ rowsAffected: [1] }) // Red card suspension
        .mockResolvedValueOnce({ recordset: [{ match_id: 11 }] })
        .mockResolvedValueOnce({ recordset: [{ suspension_id: 1 }] }); // Existing red card

      const result = await recalculateDisciplinaryForSeason(1);

      // Should only create 1 suspension (red card), not 2
      expect(result.created).toBe(1);
    });
  });
});
