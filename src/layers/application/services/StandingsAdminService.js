import ApiService from './ApiService';
import logger from '../../../shared/utils/logger';

/**
 * Admin service for managing standings
 */
class StandingsAdminService {
  /**
   * Get standings for a season
   * @param {number} seasonId 
   * @param {string} mode - "live" or "final" (default: "live")
   */
  async getStandingsBySeason(seasonId, mode = 'live') {
    try {
      const response = await ApiService.get(`/admin/standings/season/${seasonId}?mode=${mode}`);
      return response;
    } catch (error) {
      logger.error('Failed to get standings by season:', error);
      throw new Error(error.message || 'Failed to get standings');
    }
  }

  /**
   * Get standings for a specific team
   * @param {number} seasonTeamId 
   */
  async getTeamStandings(seasonTeamId) {
    try {
      const response = await ApiService.get(`/admin/standings/team/${seasonTeamId}`);
      return response;
    } catch (error) {
      logger.error('Failed to get team standings:', error);
      throw new Error(error.message || 'Failed to get team standings');
    }
  }

  /**
   * Initialize standings for all teams in a season
   * @param {number} seasonId 
   */
  async initializeStandings(seasonId) {
    try {
      const response = await ApiService.post(`/admin/standings/season/${seasonId}/initialize`);
      return response;
    } catch (error) {
      logger.error('Failed to initialize standings:', error);
      throw new Error(error.message || 'Failed to initialize standings');
    }
  }

  /**
   * Calculate standings from match results
   * @param {number} seasonId 
   */
  async calculateStandings(seasonId) {
    try {
      const response = await ApiService.post(`/admin/standings/season/${seasonId}/calculate`);
      return response;
    } catch (error) {
      logger.error('Failed to calculate standings:', error);
      throw new Error(error.message || 'Failed to calculate standings');
    }
  }

  /**
   * Update team standings manually
   * @param {number} seasonTeamId 
   * @param {Object} updates - { wins, draws, losses, goalsFor, goalsAgainst, points }
   */
  async updateTeamStandings(seasonTeamId, updates) {
    try {
      const response = await ApiService.patch(`/admin/standings/team/${seasonTeamId}`, updates);
      return response;
    } catch (error) {
      logger.error('Failed to update team standings:', error);
      throw new Error(error.message || 'Failed to update team standings');
    }
  }

  /**
   * Reset team standings to zero
   * @param {number} seasonTeamId 
   */
  async resetTeamStandings(seasonTeamId) {
    try {
      const response = await ApiService.delete(`/admin/standings/team/${seasonTeamId}`);
      return response;
    } catch (error) {
      logger.error('Failed to reset team standings:', error);
      throw new Error(error.message || 'Failed to reset team standings');
    }
  }

  /**
   * Get seasons list for selection
   */
  async getSeasons() {
    try {
      const response = await ApiService.get('/teams/seasons');
      return response;
    } catch (error) {
      logger.error('Failed to get seasons:', error);
      throw new Error(error.message || 'Failed to get seasons');
    }
  }
}

export default new StandingsAdminService();


