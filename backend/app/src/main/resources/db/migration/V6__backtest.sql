CREATE TABLE backtest_runs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150),
  definition JSONB NOT NULL,                     -- universe, rules, rebalance, sizing, costs
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  benchmark VARCHAR(20) NOT NULL DEFAULT 'VNINDEX',
  status VARCHAR(12) NOT NULL DEFAULT 'QUEUED',  -- QUEUED | RUNNING | DONE | FAILED
  error TEXT,
  metrics JSONB,                                 -- CAGR, vol, Sharpe, maxDD, turnover...
  split_info JSONB,                              -- in-sample / out-of-sample
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE backtest_equity (
  run_id BIGINT NOT NULL REFERENCES backtest_runs(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  nav NUMERIC(20,4) NOT NULL,
  benchmark_nav NUMERIC(20,4),
  drawdown NUMERIC(10,6),
  PRIMARY KEY (run_id, trade_date)
);

CREATE TABLE backtest_trades (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES backtest_runs(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  side VARCHAR(4) NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC(18,2) NOT NULL,
  fee NUMERIC(18,2) NOT NULL,
  tax NUMERIC(18,2) NOT NULL DEFAULT 0,
  trade_date DATE NOT NULL
);
CREATE INDEX idx_bt_trades_run ON backtest_trades (run_id);
