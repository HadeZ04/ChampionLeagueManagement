import { useState, useEffect } from 'react';
import { getPlayerAvatar, getAvatarWithFallback } from '../utils/playerAvatar';

/**
 * React hook to fetch and use player avatar
 * @param {number|null} playerId - Player ID
 * @param {string} playerName - Player name for fallback
 * @returns {string} Avatar URL (with fallback if needed)
 */
export function usePlayerAvatar(playerId, playerName = '') {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAvatar() {
      setLoading(true);
      try {
        const url = await getPlayerAvatar(playerId);
        if (!cancelled) {
          setAvatarUrl(url);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setAvatarUrl(null);
          setLoading(false);
        }
      }
    }

    fetchAvatar();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  return {
    avatarUrl: getAvatarWithFallback(avatarUrl, playerName),
    loading,
    hasAvatar: !!avatarUrl
  };
}

/**
 * React hook to batch fetch multiple player avatars
 * @param {number[]} playerIds - Array of player IDs
 * @returns {{ avatars: Record<number, string>, loading: boolean }}
 */
export function useBatchPlayerAvatars(playerIds) {
  const [avatars, setAvatars] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      setAvatars({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAvatars() {
      setLoading(true);
      try {
        const { batchGetPlayerAvatars } = await import('../utils/playerAvatar');
        const result = await batchGetPlayerAvatars(playerIds);
        if (!cancelled) {
          // Convert to map with fallback avatars
          const avatarMap = {};
          playerIds.forEach(id => {
            avatarMap[id] = result[id] || null;
          });
          setAvatars(avatarMap);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setAvatars({});
          setLoading(false);
        }
      }
    }

    fetchAvatars();

    return () => {
      cancelled = true;
    };
  }, [playerIds.join(',')]); // Re-fetch if playerIds change

  return { avatars, loading };
}

