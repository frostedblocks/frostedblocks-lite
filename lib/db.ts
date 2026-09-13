import { neon } from "@neondatabase/serverless";

export function dbUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

export function sql() {
  const url = dbUrl();
  if (!url) throw new Error("Database URL is missing. Connect ice-lite in Vercel Storage, then Redeploy.");
  return neon(url);
}

export async function ensureSchema() {
  const q = sql();
  await q`CREATE TABLE IF NOT EXISTS lite_users (
    id BIGSERIAL PRIMARY KEY,
    door TEXT NOT NULL DEFAULT 'lite',
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
  )`;
  await q`ALTER TABLE lite_users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0`;
  await q`ALTER TABLE lite_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`;
  await q`ALTER TABLE lite_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`;
  await q`CREATE TABLE IF NOT EXISTS lite_sessions (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_email_tokens (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_posts (
    id BIGSERIAL PRIMARY KEY,
    door TEXT NOT NULL DEFAULT 'lite',
    author_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_follows (
    follower_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    followee_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_message_reads (
    user_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    peer_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, peer_id)
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_rate (
    key TEXT PRIMARY KEY,
    hits INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_replies (
    id BIGSERIAL PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`CREATE INDEX IF NOT EXISTS lite_replies_post_idx ON lite_replies (post_id)`;

  // Privacy circles — separate from public lite_posts (never mixed).
  await q`CREATE TABLE IF NOT EXISTS lite_circles (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    invite_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`ALTER TABLE lite_circles ADD COLUMN IF NOT EXISTS purpose TEXT`;
  await q`CREATE TABLE IF NOT EXISTS lite_circle_members (
    circle_id BIGINT NOT NULL REFERENCES lite_circles(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (circle_id, user_id)
  )`;
  await q`CREATE TABLE IF NOT EXISTS lite_circle_posts (
    id BIGSERIAL PRIMARY KEY,
    circle_id BIGINT NOT NULL REFERENCES lite_circles(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES lite_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await q`ALTER TABLE lite_circle_posts ADD COLUMN IF NOT EXISTS image_url TEXT`;
  await q`CREATE INDEX IF NOT EXISTS lite_circle_posts_circle_idx ON lite_circle_posts (circle_id, created_at DESC)`;
}
