CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" VARCHAR(255) NOT NULL,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_token (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  identifier TEXT,
  token TEXT,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, token),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  about TEXT CHECK (char_length(about) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  image VARCHAR
);

CREATE TABLE profile_image (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR NOT NULL,
  file_id VARCHAR NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE profile_likes (
  source_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (source_profile_id, target_profile_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date_read TIMESTAMPTZ,
  sender_deleted BOOLEAN DEFAULT FALSE,
  recipient_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  description VARCHAR,
  image VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR NOT NULL,
  price INT DEFAULT 0,
  title VARCHAR(70) NOT NULL CHECK (char_length(title) >= 50 AND char_length(title) <= 70),
  slug VARCHAR UNIQUE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  image VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE notice_likes (
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE,
  source_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notice_id, source_profile_id)
);

CREATE TABLE notice_image (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR NOT NULL,
  file_id VARCHAR NOT NULL,
  notice_id UUID REFERENCES notices(id) ON DELETE CASCADE
);

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notices
BEFORE UPDATE ON notices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_messages
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_notices_title ON notices(title);
CREATE INDEX idx_notices_type ON notices(type);
CREATE INDEX idx_notices_category ON notices(category_id);
CREATE INDEX idx_notices_price ON notices(price);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_name ON profiles(name);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

CREATE INDEX CONCURRENTLY idx_notices_author ON notices(author_id);
CREATE INDEX CONCURRENTLY idx_notices_status ON notices(status);
