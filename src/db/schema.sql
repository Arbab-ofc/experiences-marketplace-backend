-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'host', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Experiences table
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'blocked')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_time CHECK (end_time > start_time)
);
CREATE INDEX idx_experiences_host ON experiences(host_id);
CREATE INDEX idx_experiences_status ON experiences(status);
CREATE INDEX idx_experiences_location ON experiences(location);
CREATE INDEX idx_experiences_start_time ON experiences(start_time);

-- Bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  booking_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, experience_id)
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_experience ON bookings(experience_id);
