
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_stake DECIMAL(18,2) NOT NULL,
    daily_yield DECIMAL(5,4) NOT NULL
);


INSERT INTO packages (name, min_stake, daily_yield) VALUES
('Daily Ride', 100, 0.0010),
('Weekly Pass', 500, 0.0020),
('Economy Car', 1000, 0.0030),
('Business Fleet', 5000, 0.0040),
('Personal EV', 10000, 0.0050),
('Luxury Fleet', 50000, 0.0060),
('Corporate Mobility Hub', 100000, 0.0070)
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet VARCHAR(42) UNIQUE NOT NULL,
    balance_egd DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS stakings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES packages(id),
    staked_amount DECIMAL(18,8) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'unlocked'))
);


CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    staking_id INTEGER REFERENCES stakings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    claimed BOOLEAN DEFAULT FALSE
);


CREATE TABLE IF NOT EXISTS revenue_pool (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_fee DECIMAL(18,8) DEFAULT 0,
    distributed BOOLEAN DEFAULT FALSE
);


CREATE INDEX idx_stakings_user ON stakings(user_id);
CREATE INDEX idx_stakings_status ON stakings(status);
CREATE INDEX idx_rewards_staking ON rewards(staking_id);
CREATE INDEX idx_rewards_date ON rewards(date);

 
CREATE OR REPLACE FUNCTION get_total_staked() RETURNS DECIMAL AS $$  
SELECT SUM(staked_amount) FROM stakings WHERE status = 'active';
  $$ LANGUAGE SQL;

