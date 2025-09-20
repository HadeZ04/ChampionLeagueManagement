-- Migration: Create Teams Table
-- Version: 001
-- Description: Creates the teams table with all necessary fields

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo TEXT,
    country VARCHAR(50) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    country_flag VARCHAR(10),
    city VARCHAR(100) NOT NULL,
    stadium VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    founded INTEGER,
    coach VARCHAR(100),
    website TEXT,
    market_value BIGINT DEFAULT 0,
    average_age DECIMAL(3,1) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Tournament standings data
    position INTEGER,
    points INTEGER DEFAULT 0,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    form JSONB DEFAULT '[]',
    titles INTEGER DEFAULT 0,
    coefficient DECIMAL(6,3) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_position ON teams(position);
CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(points DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO teams (name, logo, country, country_code, country_flag, city, stadium, capacity, founded, coach, position, points, played, won, drawn, lost, goals_for, goals_against, goal_difference, titles) VALUES
('Liverpool', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Liverpool', 'Anfield', 53394, 1892, 'Arne Slot', 1, 18, 6, 6, 0, 0, 13, 1, 12, 6),
('Barcelona', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png', 'Spain', 'ESP', '🇪🇸', 'Barcelona', 'Spotify Camp Nou', 99354, 1899, 'Hansi Flick', 2, 15, 6, 5, 0, 1, 21, 7, 14, 5),
('Arsenal', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png', 'England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'London', 'Emirates Stadium', 60704, 1886, 'Mikel Arteta', 3, 13, 6, 4, 1, 1, 11, 2, 9, 0);

COMMENT ON TABLE teams IS 'Stores information about all teams participating in the Champions League';
COMMENT ON COLUMN teams.form IS 'JSON array storing the last 5 match results (W/D/L)';
COMMENT ON COLUMN teams.coefficient IS 'UEFA coefficient rating for the team';
