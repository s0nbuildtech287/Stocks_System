CREATE TABLE metrics_daily (
  symbol_id   BIGINT NOT NULL REFERENCES symbols(id),
  trade_date  DATE NOT NULL,
  market_cap  NUMERIC(24,2),
  avg_value_20d NUMERIC(24,2),                  -- thanh khoan
  pe_ttm      NUMERIC(14,4),
  pb          NUMERIC(14,4),
  ps_ttm      NUMERIC(14,4),
  eps_ttm     NUMERIC(18,4),
  bvps        NUMERIC(18,4),
  roe_ttm     NUMERIC(10,4),
  roa_ttm     NUMERIC(10,4),
  net_margin_ttm NUMERIC(10,4),
  debt_to_equity NUMERIC(14,4),
  revenue_growth_yoy NUMERIC(10,4),
  profit_growth_yoy  NUMERIC(10,4),
  dividend_yield_ttm NUMERIC(10,4),
  beta_1y     NUMERIC(10,4),
  beta_3y     NUMERIC(10,4),
  volatility_60d NUMERIC(10,4),
  return_1m   NUMERIC(10,4),
  return_3m   NUMERIC(10,4),
  return_12m  NUMERIC(10,4),
  PRIMARY KEY (symbol_id, trade_date)
);
CREATE INDEX idx_metrics_date ON metrics_daily (trade_date);
