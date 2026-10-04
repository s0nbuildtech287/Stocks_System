CREATE TABLE financials (
  id             BIGSERIAL PRIMARY KEY,
  symbol_id      BIGINT NOT NULL REFERENCES symbols(id),
  period_type    VARCHAR(1) NOT NULL,           -- Q | Y
  fiscal_year    INT NOT NULL,
  fiscal_quarter INT,                           -- 1-4, NULL neu nam
  period_end     DATE NOT NULL,
  published_date DATE,                          -- NGAY CONG BO (bat buoc cho backtest; thieu thi uoc luong + gan co)
  published_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  consolidated   BOOLEAN NOT NULL DEFAULT TRUE,
  revenue        NUMERIC(24,2),
  gross_profit   NUMERIC(24,2),
  operating_profit NUMERIC(24,2),
  net_profit     NUMERIC(24,2),                 -- LNST thuoc co dong cong ty me
  total_assets   NUMERIC(24,2),
  total_liabilities NUMERIC(24,2),
  equity         NUMERIC(24,2),                 -- von CSH (cong ty me)
  cfo            NUMERIC(24,2),
  capex          NUMERIC(24,2),
  interest_expense NUMERIC(24,2),
  raw            JSONB,                         -- khoan muc chi tiet / dac thu nganh
  source         VARCHAR(30),
  UNIQUE (symbol_id, period_type, fiscal_year, fiscal_quarter)
);
CREATE INDEX idx_fin_pub ON financials (symbol_id, published_date);
