-- Migration: Create Players Table
-- Version: 003
-- Description: Creates the players table with all necessary fields

CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    nationality_code VARCHAR(3),
    nationality_flag VARCHAR(10),
    position VARCHAR(20) NOT NULL CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
    jersey_number INTEGER CHECK (jersey_number BETWEEN 1 AND 99),
    height INTEGER, -- in centimeters
    weight INTEGER, -- in kilograms
    foot VARCHAR(10) CHECK (foot IN ('Left', 'Right', 'Both')),
    market_value BIGINT DEFAULT 0,
    contract_until DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'injured', 'suspended', 'inactive')),
    
    -- Player statistics for current season
    appearances INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0, -- for goalkeepers
    saves INTEGER DEFAULT 0, -- for goalkeepers
    
    -- Player profile
    photo TEXT,
    biography TEXT,
    social_media JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    
    -- Constraints
    UNIQUE(team_id, jersey_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_players_goals ON players(goals DESC);
CREATE INDEX IF NOT EXISTS idx_players_assists ON players(assists DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON players 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO players (team_id, name, first_name, last_name, date_of_birth, nationality, nationality_code, position, jersey_number, goals, assists, appearances) VALUES
(1, 'Mohamed Salah', 'Mohamed', 'Salah', '1992-06-15', 'Egypt', 'EGY', 'Forward', 11, 5, 3, 6),
(1, 'Virgil van Dijk', 'Virgil', 'van Dijk', '1991-07-08', 'Netherlands', 'NED', 'Defender', 4, 1, 0, 6),
(2, 'Robert Lewandowski', 'Robert', 'Lewandowski', '1988-08-21', 'Poland', 'POL', 'Forward', 9, 7, 2, 6),
(2, 'Raphinha', 'Raphinha', '', '1996-12-14', 'Brazil', 'BRA', 'Forward', 22, 4, 4, 6);

COMMENT ON TABLE players IS 'Stores information about all players in the Champions League';
COMMENT ON COLUMN players.social_media IS 'JSON object storing social media handles and URLs';
COMMENT ON COLUMN players.jersey_number IS 'Player jersey number, unique within each team';
