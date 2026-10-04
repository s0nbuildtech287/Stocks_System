CREATE TABLE valuation_runs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  model VARCHAR(20) NOT NULL,                    -- CAPM | DDM | DDM2 | RELATIVE
  inputs JSONB NOT NULL,                         -- rf, beta, erp, g, D0, ...
  outputs JSONB NOT NULL,                        -- gia tri theo kich ban + bang do nhay + canh bao
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE job_runs (
  id BIGSERIAL PRIMARY KEY,
  job_name VARCHAR(60) NOT NULL,
  status VARCHAR(10) NOT NULL,                   -- RUNNING | SUCCESS | FAILED
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  rows_affected BIGINT,
  error TEXT
);

CREATE TABLE data_quality_issues (
  id BIGSERIAL PRIMARY KEY,
  symbol_id BIGINT REFERENCES symbols(id),
  trade_date DATE,
  rule VARCHAR(60) NOT NULL,                     -- MISSING_DAY | NEG_PRICE | BIG_JUMP | ZERO_VOLUME | ADJ_MISMATCH
  detail TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);
