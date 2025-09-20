<<<<<<< HEAD
# UEFA Champions League Website - 3-Tier Architecture

## 🏗️ Architecture Overview

This project implements a **3-Tier Architecture** with **Dual-Frontend** design for the UEFA Champions League website.

### Architecture Layers

#### 1. Presentation Layer (`src/layers/presentation/`)
- **Public Portal** (`src/apps/public/`) - Fan-facing website
- **Admin Dashboard** (`src/apps/admin/`) - Management interface

#### 2. Application Layer (`src/layers/application/`)
- **Services** - API communication and business logic
- **Store** - State management
- **Logic** - Business rules and calculations
- **Utils** - Utility functions and validation

#### 3. Data Layer (`src/layers/data/`)
- **Models** - Data structure definitions
- **DAO** - Database access objects
- **Migrations** - Database schema management
- **Config** - Database configuration
- 
#### 4. Enviroment
npm install @radix-ui/react-slot @radix-ui/react-toggle-group @radix-ui/react-toggle canvas-confetti class-variance-authority date-fns framer-motion lucide-react react-dom react-intersection-observer react-router-dom react react-hot-toast
## 📁 Project Structure

```
src/
├── config/
│   └── app.config.js              # Application configuration
├── layers/
│   ├── presentation/              # Presentation Layer
│   │   └── index.js               # Layer exports
│   ├── application/               # Application Layer
│   │   ├── services/              # API services
│   │   │   ├── ApiService.js
│   │   │   ├── AuthService.js
│   │   │   ├── TeamsService.js
│   │   │   └── MatchesService.js
│   │   ├── logic/                 # Business logic
│   │   │   └── TournamentLogic.js
│   │   ├── store/                 # State management
│   │   │   └── AppStore.js
│   │   ├── utils/                 # Utilities
│   │   │   └── DataValidator.js
│   │   └── index.js               # Layer exports
│   └── data/                      # Data Layer
│       ├── models/                # Data models
│       │   ├── TeamModel.js
│       │   └── MatchModel.js
│       ├── dao/                   # Data access objects
│       │   └── TeamDAO.js
│       ├── migrations/            # Database migrations
│       │   ├── 001_create_teams_table.sql
│       │   ├── 002_create_matches_table.sql
│       │   └── 003_create_players_table.sql
│       ├── config/                # Database config
│       │   └── DatabaseConfig.js
│       └── index.js               # Layer exports
├── apps/
│   ├── public/                    # Public Portal
│   │   ├── PublicApp.jsx
│   │   ├── components/
│   │   │   ├── PublicHeader.jsx
│   │   │   ├── PublicFooter.jsx
│   │   │   ├── StandingsTable.jsx
│   │   │   ├── MatchCard.jsx
│   │   │   ├── NewsCard.jsx
│   │   │   ├── TopScorers.jsx
│   │   │   ├── UpcomingMatches.jsx
│   │   │   └── LiveTicker.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── StandingsPage.jsx
│   │       ├── MatchesPage.jsx
│   │       ├── TeamsPage.jsx
│   │       ├── StatsPage.jsx
│   │       ├── NewsPage.jsx
│   │       ├── VideoPage.jsx
│   │       └── GamingPage.jsx
│   └── admin/                     # Admin Dashboard
│       ├── AdminApp.jsx
│       ├── components/
│       │   ├── AdminHeader.jsx
│       │   ├── AdminSidebar.jsx
│       │   ├── StatCard.jsx           *
│       │   ├── TopPerformerCard.jsx   *
│       │   └── PlaceholderReport.jsx  *
│       └── pages/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── TeamsManagement.jsx
│           ├── MatchesManagement.jsx
│           ├── PlayersManagement.jsx
│           ├── NewsManagement.jsx
│           ├── UsersManagement.jsx
│           ├── SettingsPage.jsx
│           └── ReportsPage.jsx        *
├── shared/
│   ├── components/                # Shared components
│   │   ├── ErrorBoundary.jsx
│   │   └── LoadingSpinner.jsx
│   └── utils/                     # Shared utilities
│       └── constants.js
└── App.jsx                        # Main application entry

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL/MySQL (for production)

### Installation
```bash
npm install
npm run dev
```

### Environment Variables
Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uefa_champions_league
DB_USER=uefa_admin
DB_PASS=uefa2025
JWT_SECRET=uefa_champions_league_secret_2025
```

## 🔧 Configuration

### Application Configuration (`src/config/app.config.js`)
- API endpoints and settings
- Database connection
- Security configuration
- Feature flags
- UI settings

### Layer Configuration
Each layer has its own configuration:
- **Presentation**: Routes and UI settings
- **Application**: Business rules and validation
- **Data**: Database schema and relationships

## 🏛️ Architecture Benefits

### Separation of Concerns
- **Presentation**: UI/UX only
- **Application**: Business logic only  
- **Data**: Database operations only

### Scalability
- Easy to add new features
- Independent layer scaling
- Microservices ready

### Maintainability
- Clear code organization
- Easy testing
- Independent deployments

### Security
- Role-based access control
- Input validation at multiple layers
- Secure authentication

## 🔐 Authentication

### Public Portal
- No authentication required
- Guest access to all content

### Admin Dashboard
- Secure login required
- Role-based permissions
- Session management

**Demo Credentials:**
- Username: `admin`
- Password: `uefa2025`

## 📊 Database Schema

### Core Tables
- `teams` - Team information and standings
- `matches` - Match fixtures and results
- `players` - Player profiles and statistics
- `news` - News articles and content
- `users` - Admin users and permissions

### Relationships
- Teams → Players (One-to-Many)
- Matches → Teams (Many-to-Many)
- Users → Roles (Many-to-Many)

## 🔄 Data Flow

1. **User Interaction** (Presentation Layer)
2. **Business Logic** (Application Layer)
3. **Data Persistence** (Data Layer)

### Example: View Standings
1. User clicks "Standings" → `StandingsPage.jsx`
2. Component calls → `TeamsService.getAllTeams()`
3. Service calls → `TeamDAO.findAll()`
4. DAO queries → Database
5. Data flows back through layers
6. UI updates with standings

## 🧪 Testing Strategy

### Unit Tests
- Models validation
- Business logic functions
- Utility functions

### Integration Tests
- API service calls
- Database operations
- Component interactions

### E2E Tests
- User workflows
- Admin workflows
- Cross-browser testing

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment-Specific Configs
- Development: Mock data, debug logging
- Staging: Test database, limited features
- Production: Live database, full features

## 📈 Monitoring & Analytics

### Error Tracking
- Error boundaries
- API error logging
- User action tracking

### Performance Monitoring
- Page load times
- API response times
- Database query performance

## 🔮 Future Enhancements

### Microservices Migration
- Split application layer into microservices
- API Gateway implementation
- Service mesh architecture

### Real-time Features
- WebSocket integration
- Live match updates
- Push notifications

### Advanced Analytics
- Machine learning predictions
- Advanced statistics
- Performance analytics

## 📝 Contributing

1. Follow the 3-tier architecture
2. Add new features in appropriate layers
3. Update configuration files
4. Add tests for new functionality
5. Update documentation

## 📞 Support

For technical support or questions about the architecture:
- Email: dev-team@uefa.com
- Documentation: `/docs`
- API Documentation: `/api/docs`
=======
# ChampionLeagueManagement
>>>>>>> df085cfff729d0191a42a1358632fb64414c851d
