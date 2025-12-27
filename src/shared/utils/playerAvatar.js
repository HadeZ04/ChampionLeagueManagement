import apiService from '../../layers/application/services/ApiService';

/**
 * Get player avatar URL from API
 * @param {number} playerId - Player ID
 * @returns {Promise<string|null>} Avatar URL or null if not found
 */
export async function getPlayerAvatar(playerId) {
  if (!playerId || !Number.isInteger(playerId)) {
    return null;
  }

  try {
    const response = await apiService.get(`/players/${playerId}/avatar`);
    return response?.avatarUrl || null;
  } catch (error) {
    console.warn(`Failed to fetch avatar for player ${playerId}:`, error);
    return null;
  }
}

/**
 * Batch fetch player avatars
 * @param {number[]} playerIds - Array of player IDs
 * @returns {Promise<Record<number, string|null>>} Map of playerId -> avatarUrl
 */
export async function batchGetPlayerAvatars(playerIds) {
  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    return {};
  }

  // Filter valid IDs
  const validIds = playerIds
    .map(id => typeof id === 'number' ? id : parseInt(String(id), 10))
    .filter(id => !isNaN(id) && id > 0);

  if (validIds.length === 0) {
    return {};
  }

  try {
    const response = await apiService.post('/players/avatars/batch', {
      playerIds: validIds
    });
    return response?.avatars || {};
  } catch (error) {
    console.warn('Failed to batch fetch avatars:', error);
    return {};
  }
}

/**
 * Get avatar URL with fallback
 * @param {string|null} avatarUrl - Avatar URL from API
 * @param {string} playerName - Player name for fallback
 * @returns {string} Avatar URL or fallback
 */
export function getAvatarWithFallback(avatarUrl, playerName = '') {
  if (avatarUrl) {
    return avatarUrl;
  }

  // Fallback: Generate initials or use placeholder
  if (playerName) {
    const initials = playerName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // Return data URI with initials
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#003399"/>
        <text x="50" y="60" text-anchor="middle" fill="white" font-size="40" font-weight="bold" font-family="Arial">${initials}</text>
      </svg>`
    )}`;
  }

  // Default placeholder
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#cccccc"/>
      <circle cx="50" cy="50" r="30" fill="#999999"/>
    </svg>`
  )}`;
}

