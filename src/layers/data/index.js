// Data Layer - Database Models & Data Access
// This layer handles all data persistence and database operations

// Database Models
export { default as TeamModel } from './models/TeamModel'
export { default as MatchModel } from './models/MatchModel'
export { default as PlayerModel } from './models/PlayerModel'
export { default as NewsModel } from './models/NewsModel'
export { default as UserModel } from './models/UserModel'

// Data Access Objects (DAOs)
export { default as TeamDAO } from './dao/TeamDAO'
export { default as MatchDAO } from './dao/MatchDAO'
export { default as PlayerDAO } from './dao/PlayerDAO'
export { default as NewsDAO } from './dao/NewsDAO'
export { default as UserDAO } from './dao/UserDAO'

// Database Configuration
export { default as DatabaseConfig } from './config/DatabaseConfig'
export { default as MigrationRunner } from './migrations/MigrationRunner'

// Data Layer Configuration
export const DATA_CONFIG = {
  TABLES: {
    TEAMS: 'teams',
    MATCHES: 'matches',
    PLAYERS: 'players',
    NEWS: 'news',
    USERS: 'users',
    STANDINGS: 'standings',
    MATCH_EVENTS: 'match_events',
    PLAYER_STATS: 'player_stats'
  },
  
  RELATIONSHIPS: {
    TEAM_PLAYERS: 'team_players',
    MATCH_TEAMS: 'match_teams',
    MATCH_EVENTS: 'match_events',
    USER_ROLES: 'user_roles'
  },

  INDEXES: {
    TEAMS: ['name', 'country', 'status'],
    MATCHES: ['date', 'status', 'matchday'],
    PLAYERS: ['name', 'team_id', 'position'],
    NEWS: ['category', 'published_date', 'status'],
    USERS: ['username', 'email', 'role']
  },

  CONSTRAINTS: {
    TEAM_NAME_UNIQUE: true,
    PLAYER_TEAM_LIMIT: 25,
    MATCH_TEAMS_DIFFERENT: true,
    USER_EMAIL_UNIQUE: true
  }
}
