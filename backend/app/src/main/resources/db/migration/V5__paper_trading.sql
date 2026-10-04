CREATE TABLE portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  initial_cash NUMERIC(20,2) NOT NULL,
  cash NUMERIC(20,2) NOT NULL,
  buy_fee_rate  NUMERIC(8,6) NOT NULL DEFAULT 0.0015,
  sell_fee_rate NUMERIC(8,6) NOT NULL DEFAULT 0.0015,
  sell_tax_rate NUMERIC(8,6) NOT NULL DEFAULT 0.001,
  settlement_days INT NOT NULL DEFAULT 2,        -- cau hinh T+2 / KRX
  fill_policy VARCHAR(20) NOT NULL DEFAULT 'NEXT_OPEN', -- NEXT_OPEN | NEXT_CLOSE
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  side VARCHAR(4) NOT NULL,                      -- BUY | SELL
  order_type VARCHAR(10) NOT NULL,               -- MARKET | LIMIT
  quantity INT NOT NULL CHECK (quantity > 0),
  limit_price NUMERIC(18,2),
  status VARCHAR(12) NOT NULL DEFAULT 'PENDING', -- PENDING | FILLED | PARTIAL | REJECTED | CANCELLED
  placed_on DATE NOT NULL,                       -- ngay giao dich dat lenh
  filled_on DATE,
  reject_reason TEXT,
  thesis TEXT,                                   -- LY DO MUA/BAN (de hoc, chong FOMO)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trades (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  side VARCHAR(4) NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(18,2) NOT NULL,
  fee NUMERIC(18,2) NOT NULL,
  tax NUMERIC(18,2) NOT NULL DEFAULT 0,
  trade_date DATE NOT NULL,
  settle_date DATE NOT NULL
);

CREATE TABLE positions (
  portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  quantity INT NOT NULL,
  available_quantity INT NOT NULL,               -- phan duoc phep ban
  avg_cost NUMERIC(18,4) NOT NULL,
  PRIMARY KEY (portfolio_id, symbol_id),
  CHECK (available_quantity >= 0 AND available_quantity <= quantity)
);

CREATE TABLE nav_daily (
  portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  cash NUMERIC(20,2) NOT NULL,
  market_value NUMERIC(20,2) NOT NULL,
  nav NUMERIC(20,2) NOT NULL,
  PRIMARY KEY (portfolio_id, trade_date)
);
