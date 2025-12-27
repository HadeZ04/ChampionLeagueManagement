import React from 'react';
import { usePlayerAvatar } from '../hooks/usePlayerAvatar';

/**
 * Reusable PlayerAvatar component
 * Automatically fetches avatar from API using player ID and name
 * 
 * @param {number} playerId - Player ID
 * @param {string} playerName - Player name (for fallback)
 * @param {string} className - CSS classes
 * @param {string} size - Size: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
 * @param {object} style - Inline styles
 * @param {function} onError - Error handler
 */
export default function PlayerAvatar({
  playerId,
  playerName = '',
  className = '',
  size = 'md',
  style = {},
  onError,
  ...props
}) {
  const { avatarUrl, loading } = usePlayerAvatar(playerId, playerName);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Default classes
  const defaultClasses = `rounded-full object-cover bg-gray-200 flex items-center justify-center overflow-hidden ${sizeClass}`;

  if (loading) {
    return (
      <div
        className={`${defaultClasses} ${className} animate-pulse`}
        style={style}
        {...props}
      >
        <div className="w-full h-full bg-gray-300" />
      </div>
    );
  }

  // If no avatar URL, show initials
  if (!avatarUrl || avatarUrl.startsWith('data:image/svg+xml')) {
    const initials = playerName
      ? playerName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '?';

    return (
      <div
        className={`${defaultClasses} ${className} bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold`}
        style={style}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={playerName || 'Player'}
      className={`${defaultClasses} ${className}`}
      style={style}
      onError={(e) => {
        // Fallback to initials on error
        if (onError) {
          onError(e);
        } else {
          e.target.style.display = 'none';
          const fallback = e.target.nextElementSibling;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }
      }}
      {...props}
    />
  );
}

