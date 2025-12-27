import axios from 'axios';
import { query } from '../db/sqlServer';

const THESPORTSDB_API_KEY = '3';
const THESPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

interface TheSportsDBPlayer {
  strPlayer: string;
  strTeam: string;
  strCutout?: string;
  strThumb?: string;
  strRender?: string;
  strFanart1?: string;
}

interface TheSportsDBResponse {
  player: TheSportsDBPlayer[] | null;
}

/**
 * Normalize team name for comparison
 */
function normalizeTeamName(teamName: string | null): string {
  if (!teamName) return '';
  return teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if teams match (fuzzy matching)
 */
function isTeamMatch(team1: string | null, team2: string | null): boolean {
  const normalized1 = normalizeTeamName(team1);
  const normalized2 = normalizeTeamName(team2);
  return normalized1.includes(normalized2) || normalized2.includes(normalized1);
}

/**
 * Get avatar URL from TheSportsDB player data
 */
function getAvatarUrl(player: TheSportsDBPlayer): string | null {
  // Priority: strCutout > strThumb > strRender > strFanart1
  return player.strCutout || player.strThumb || player.strRender || player.strFanart1 || null;
}

/**
 * Search player in TheSportsDB
 */
async function searchPlayerInSportsDB(
  playerName: string,
  teamName: string | null
): Promise<string | null> {
  try {
    const searchUrl = `${THESPORTSDB_BASE_URL}/${THESPORTSDB_API_KEY}/searchplayers.php`;
    
    const response = await axios.get<TheSportsDBResponse>(searchUrl, {
      params: { p: playerName },
      timeout: 10000,
    });

    if (!response.data.player || response.data.player.length === 0) {
      return null;
    }

    const players = response.data.player;

    // Try to match by team first
    let bestMatch = players[0];
    if (teamName && players.length > 1) {
      const teamMatch = players.find((p) => isTeamMatch(p.strTeam, teamName));
      if (teamMatch) {
        bestMatch = teamMatch;
      }
    }

    return getAvatarUrl(bestMatch);
  } catch (error) {
    console.error('Error searching TheSportsDB:', error);
    return null;
  }
}

/**
 * Get player avatar URL from database or fetch from TheSportsDB
 */
export async function getPlayerAvatar(
  playerId: number,
  playerName?: string,
  teamName?: string | null
): Promise<string | null> {
  try {
    // First, check if avatar_url exists in database
    const dbResult = await query<{ avatar_url: string | null }>(
      `SELECT avatar_url FROM players WHERE player_id = @playerId;`,
      { playerId }
    );

    const existingAvatarUrl = dbResult.recordset[0]?.avatar_url;

    if (existingAvatarUrl) {
      return existingAvatarUrl;
    }

    // If not in database and we have player info, fetch from TheSportsDB
    if (playerName) {
      const avatarUrl = await searchPlayerInSportsDB(playerName, teamName || null);

      // Save to database if found
      if (avatarUrl) {
        await query(
          `UPDATE players SET avatar_url = @avatarUrl WHERE player_id = @playerId;`,
          { avatarUrl, playerId }
        );
      }

      return avatarUrl;
    }

    return null;
  } catch (error) {
    console.error('Error getting player avatar:', error);
    return null;
  }
}

/**
 * Get player info for avatar lookup
 */
async function getPlayerInfo(playerId: number): Promise<{
  full_name: string;
  team_name: string | null;
} | null> {
  try {
    const result = await query<{
      full_name: string;
      team_name: string | null;
    }>(
      `SELECT 
        p.full_name,
        t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.team_id
      WHERE p.player_id = @playerId;`,
      { playerId }
    );

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error getting player info:', error);
    return null;
  }
}

/**
 * Get or fetch player avatar (main function)
 */
export async function getOrFetchPlayerAvatar(playerId: number): Promise<string | null> {
  const playerInfo = await getPlayerInfo(playerId);
  
  if (!playerInfo) {
    return null;
  }

  return getPlayerAvatar(playerId, playerInfo.full_name, playerInfo.team_name);
}

/**
 * Batch fetch avatars for multiple players
 */
export async function batchFetchPlayerAvatars(
  playerIds: number[]
): Promise<Record<number, string | null>> {
  const result: Record<number, string | null> = {};

  // Get all player info first
  const playerIdsStr = playerIds.filter(id => Number.isInteger(id) && id > 0).join(',');
  
  if (playerIdsStr === '') {
    return result;
  }

  const playersResult = await query<{
    player_id: number;
    full_name: string;
    team_name: string | null;
    avatar_url: string | null;
  }>(
    `SELECT 
      p.player_id,
      p.full_name,
      t.name as team_name,
      p.avatar_url
    FROM players p
    LEFT JOIN teams t ON p.current_team_id = t.team_id
    WHERE p.player_id IN (${playerIdsStr});`
  );

  const players = playersResult.recordset;

  // Process players that don't have avatar_url
  const playersToFetch = players.filter(p => !p.avatar_url);

  // Fetch avatars with rate limiting (2 seconds between requests)
  for (const player of playersToFetch) {
    const avatarUrl = await searchPlayerInSportsDB(player.full_name, player.team_name);
    
    if (avatarUrl) {
      await query(
        `UPDATE players SET avatar_url = @avatarUrl WHERE player_id = @playerId;`,
        { avatarUrl, playerId: player.player_id }
      );
      result[player.player_id] = avatarUrl;
    } else {
      result[player.player_id] = null;
    }

    // Rate limiting delay
    if (playersToFetch.indexOf(player) < playersToFetch.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Add existing avatars to result
  players.forEach(player => {
    if (player.avatar_url) {
      result[player.player_id] = player.avatar_url;
    } else if (!(player.player_id in result)) {
      result[player.player_id] = null;
    }
  });

  return result;
}

