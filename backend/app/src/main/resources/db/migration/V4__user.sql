CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE watchlist_items (
  watchlist_id BIGINT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  PRIMARY KEY (watchlist_id, symbol_id)
);

CREATE TABLE screener_presets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- NULL = preset he thong
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
