-- Migration: Create Matches Table
-- Version: 002
-- Description: Creates the matches table with all necessary fields

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    matchday INTEGER NOT NULL CHECK (matchday BETWEEN 1 AND 8),
    competition VARCHAR(50) DEFAULT 'League Phase',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
    
    -- Match officials
    referee VARCHAR(100),
    assistant_referee_1 VARCHAR(100),
    assistant_referee_2 VARCHAR(100),
    fourth_official VARCHAR(100),
    var_referee VARCHAR(100),
    
    -- Match environment
    attendance INTEGER DEFAULT 0,
    temperature VARCHAR(10),
    weather JSONB DEFAULT '{}',
    
    -- Broadcasting and betting
    tv_channels JSONB DEFAULT '[]',
    odds JSONB DEFAULT '{}',
    
    -- Match result
    home_score INTEGER,
    away_score INTEGER,
    extra_time BOOLEAN DEFAULT FALSE,
    penalties JSONB,
    minute INTEGER,
    
    -- Match data
    events JSONB DEFAULT '[]',
    statistics JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    -- Constraints
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id),
    CONSTRAINT valid_scores CHECK (
        (status != 'finished') OR 
        (home_score IS NOT NULL AND away_score IS NOT NULL AND home_score >= 0 AND away_score >= 0)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_matchday ON matches(matchday);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_venue ON matches(venue);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO matches (home_team_id, away_team_id, date, time, venue, city, country, matchday, referee, attendance) VALUES
(1, 2, '2025-01-22', '21:00', 'Anfield', 'Liverpool', 'England', 7, 'Clément Turpin (FRA)', 53394),
(3, 1, '2025-01-22', '21:00', 'Spotify Camp Nou', 'Barcelona', 'Spain', 7, 'Michael Oliver (ENG)', 99354);

COMMENT ON TABLE matches IS 'Stores information about all Champions League matches';
COMMENT ON COLUMN matches.events IS 'JSON array storing match events (goals, cards, substitutions)';
COMMENT ON COLUMN matches.statistics IS 'JSON object storing match statistics (possession, shots, etc.)';
COMMENT ON COLUMN matches.weather IS 'JSON object storing weather conditions during the match';
