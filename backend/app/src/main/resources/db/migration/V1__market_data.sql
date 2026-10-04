CREATE TABLE symbols (
  id            BIGSERIAL PRIMARY KEY,
  ticker        VARCHAR(10) NOT NULL UNIQUE,
  name          TEXT,
  exchange      VARCHAR(10) NOT NULL,           -- HOSE | HNX | UPCOM
  industry      TEXT,                            -- nganh (ICB hoac theo nguon)
  industry_group VARCHAR(20),                    -- BANK | SECURITIES | REALESTATE | GENERAL ...
  listing_date  DATE,
  delisting_date DATE,
  status        VARCHAR(20) NOT NULL DEFAULT 'LISTED', -- LISTED | DELISTED | SUSPENDED
  shares_outstanding BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prices_daily (
  symbol_id  BIGINT NOT NULL REFERENCES symbols(id),
  trade_date DATE   NOT NULL,
  open       NUMERIC(18,2) NOT NULL,
  high       NUMERIC(18,2) NOT NULL,
  low        NUMERIC(18,2) NOT NULL,
  close      NUMERIC(18,2) NOT NULL,           -- gia tho, chua dieu chinh
  volume     BIGINT NOT NULL,
  value      NUMERIC(24,2),                    -- gia tri khop
  adj_factor NUMERIC(20,10) NOT NULL DEFAULT 1,-- he so dieu chinh tich luy
  adj_close  NUMERIC(18,4),                    -- close * adj_factor
  PRIMARY KEY (symbol_id, trade_date)
);
CREATE INDEX idx_prices_date ON prices_daily (trade_date);

CREATE TABLE index_prices (
  index_code VARCHAR(20) NOT NULL,             -- VNINDEX | VN30 | HNX | ...
  trade_date DATE NOT NULL,
  close      NUMERIC(18,4) NOT NULL,
  volume     BIGINT,
  value      NUMERIC(24,2),
  PRIMARY KEY (index_code, trade_date)
);

CREATE TABLE index_constituents (            -- de tranh survivorship bias
  index_code VARCHAR(20) NOT NULL,
  symbol_id  BIGINT NOT NULL REFERENCES symbols(id),
  valid_from DATE NOT NULL,
  valid_to   DATE,                              -- NULL = con hieu luc
  PRIMARY KEY (index_code, symbol_id, valid_from)
);

CREATE TABLE corporate_actions (
  id            BIGSERIAL PRIMARY KEY,
  symbol_id     BIGINT NOT NULL REFERENCES symbols(id),
  action_type   VARCHAR(20) NOT NULL,          -- CASH_DIVIDEND | STOCK_DIVIDEND | BONUS | SPLIT | REVERSE_SPLIT | RIGHTS_ISSUE
  ex_date       DATE NOT NULL,                 -- ngay GDKHQ
  record_date   DATE,
  payment_date  DATE,
  cash_per_share NUMERIC(18,4),                -- co tuc tien / cp
  ratio_num     NUMERIC(18,6),                 -- vd 100 cp duoc nhan 10 cp: num=10, den=100
  ratio_den     NUMERIC(18,6),
  exercise_price NUMERIC(18,2),                -- gia phat hanh them / quyen mua
  note          TEXT,
  UNIQUE (symbol_id, action_type, ex_date)
);

CREATE TABLE risk_free_rates (
  rate_date DATE NOT NULL,
  tenor     VARCHAR(10) NOT NULL,              -- 10Y
  yield_pct NUMERIC(8,4) NOT NULL,
  PRIMARY KEY (rate_date, tenor)
);
