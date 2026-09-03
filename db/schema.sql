-- ICE Lite database (Web2)
-- Later ICE Network can live in a second database or in rows with door = 'network'.
-- Do not mix canister principals into lite_users.email.

CREATE TABLE IF NOT EXISTS lite_users (
  id            BIGSERIAL PRIMARY KEY,
  door          TEXT NOT NULL DEFAULT 'lite',
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lite_posts (
  id          BIGSERIAL PRIMARY KEY,
  door        TEXT NOT NULL DEFAULT 'lite',
  author_id   BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  category    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lite_follows (
  follower_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
  followee_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

CREATE TABLE IF NOT EXISTS lite_messages (
  id          BIGSERIAL PRIMARY KEY,
  sender_id   BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
  receiver_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lite_posts_created_idx ON lite_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS lite_messages_pair_idx ON lite_messages (sender_id, receiver_id, created_at);
