// Application Configuration
export const APP_CONFIG = {
  // Environment Configuration
  ENVIRONMENT: 'development', // development | staging | production
  
  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5173/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
      // Authentication
      AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile'
      },
      // Teams
      TEAMS: {
        LIST: '/teams',
        DETAIL: '/teams/:id',
        CREATE: '/teams',
        UPDATE: '/teams/:id',
        DELETE: '/teams/:id',
        PLAYERS: '/teams/:id/players'
      },
      // Matches
      MATCHES: {
        LIST: '/matches',
        DETAIL: '/matches/:id',
        CREATE: '/matches',
        UPDATE: '/matches/:id',
        DELETE: '/matches/:id',
        LIVE: '/matches/live',
        RESULTS: '/matches/:id/results'
      },
      // Players
      PLAYERS: {
        LIST: '/players',
        DETAIL: '/players/:id',
        CREATE: '/players',
        UPDATE: '/players/:id',
        DELETE: '/players/:id',
        STATS: '/players/:id/stats'
      },
      // Standings
      STANDINGS: {
        LEAGUE: '/standings/league',
        KNOCKOUT: '/standings/knockout',
        HISTORY: '/standings/history'
      },
      // News
      NEWS: {
        LIST: '/news',
        DETAIL: '/news/:id',
        CREATE: '/news',
        UPDATE: '/news/:id',
        DELETE: '/news/:id',
        CATEGORIES: '/news/categories'
      },
      // Statistics
      STATS: {
        OVERVIEW: '/stats/overview',
        PLAYERS: '/stats/players',
        TEAMS: '/stats/teams',
        MATCHES: '/stats/matches'
      },
      // Media
      MEDIA: {
        UPLOAD: '/media/upload',
        LIST: '/media',
        DELETE: '/media/:id'
      }
    }
  },

  // Database Configuration
  DATABASE: {
    TYPE: 'postgresql', // postgresql | mysql | mongodb
    CONNECTION: {
      HOST: process.env.DB_HOST || 'localhost',
      PORT: process.env.DB_PORT || 5432,
      DATABASE: process.env.DB_NAME || 'uefa_champions_league',
      USERNAME: process.env.DB_USER || 'uefa_admin',
      PASSWORD: process.env.DB_PASS || 'uefa2025'
    },
    POOL: {
      MIN: 2,
      MAX: 10,
      IDLE_TIMEOUT: 30000
    }
  },

  // Security Configuration
  SECURITY: {
    JWT: {
      SECRET: process.env.JWT_SECRET || 'uefa_champions_league_secret_2025',
      EXPIRES_IN: '24h',
      REFRESH_EXPIRES_IN: '7d'
    },
    BCRYPT: {
      SALT_ROUNDS: 12
    },
    CORS: {
      ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
      CREDENTIALS: true
    },
    RATE_LIMITING: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    }
  },

  // Cache Configuration
  CACHE: {
    TYPE: 'redis', // redis | memory
    TTL: {
      STANDINGS: 300, // 5 minutes
      MATCHES: 60,    // 1 minute
      TEAMS: 3600,    // 1 hour
      NEWS: 1800,     // 30 minutes
      STATS: 900      // 15 minutes
    }
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    STORAGE_PATH: process.env.UPLOAD_PATH || './uploads',
    CDN_URL: process.env.CDN_URL || ''
  },

  // Notification Configuration
  NOTIFICATIONS: {
    EMAIL: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT || 587,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS
    },
    PUSH: {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY
    }
  },

  // Feature Flags
  FEATURES: {
    LIVE_TICKER: true,
    FANTASY_FOOTBALL: true,
    VIDEO_STREAMING: true,
    SOCIAL_LOGIN: true,
    PUSH_NOTIFICATIONS: true,
    ANALYTICS: true
  },

  // UI Configuration
  UI: {
    THEME: {
      PRIMARY_COLOR: '#003399',
      SECONDARY_COLOR: '#0066cc',
      SUCCESS_COLOR: '#28a745',
      WARNING_COLOR: '#ffc107',
      ERROR_COLOR: '#dc3545'
    },
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 20,
      MAX_PAGE_SIZE: 100
    },
    ANIMATIONS: {
      DURATION: 300,
      EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

export default APP_CONFIG
