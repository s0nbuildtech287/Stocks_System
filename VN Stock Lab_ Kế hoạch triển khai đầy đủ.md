# VN Stock Lab: Kế hoạch triển khai đầy đủ

Web app phân tích chứng khoán Việt Nam: dashboard, screener, paper trading, backtest, định giá (CAPM/DDM). Dùng cá nhân/học tập trước. Không đưa ra khuyến nghị mua/bán.

> **Giả định của plan này:** backend viết bằng **Java 21 + Spring Boot 3** (đúng ý bạn). Vì thư viện lấy dữ liệu chứng khoán VN chủ yếu là Python, thêm **một service Python nhỏ chỉ để thu thập dữ liệu**. Toàn bộ tính toán (điều chỉnh giá, chỉ số, backtest, định giá) viết bằng Java trong module riêng, không phụ thuộc Spring.

---

## 1. Kiến trúc tổng thể

```
                 ┌──────────────┐
  Nguồn dữ liệu →│  ingestion   │ (Python, cron 16:00 T2-T6)
  (vnstock/API)  │  (collector) │
                 └──────┬───────┘
                        │ ghi bảng gốc + gọi POST /internal/jobs/recompute
                        ▼
┌──────────┐   ┌──────────────────────────────┐   ┌──────────────┐
│ Frontend │──►│ Backend (Spring Boot)         │──►│ PostgreSQL   │
│ Next.js  │   │  app  ──► core (engine thuần) │   │ (Flyway)     │
└──────────┘   └──────────────────────────────┘   └──────────────┘
```

Nguyên tắc:

- **`core` là Java thuần** (không Spring, không DB). Nhận dữ liệu vào, trả kết quả ra. Dễ test và dễ tối ưu riêng.
- **`app` là lớp mỏng**: REST, security, truy cập DB, job, gọi `core`.
- Dữ liệu cuối ngày (EOD). Chỉ số và ranking **tính sẵn** vào DB, không tính khi user truy cập.
- Backtest chạy **bất đồng bộ** (job + trạng thái), frontend poll kết quả.

## 2. Stack

| Tầng | Công nghệ |
| --- | --- |
| Backend | Java 21, Spring Boot 3.x, Gradle (multi-module), Spring Web, Spring Data JPA + JdbcTemplate (query screener động), Spring Security + JWT, Flyway, springdoc-openapi, Caffeine cache |
| Tính toán | Java thuần + Apache Commons Math (hồi quy, thống kê) |
| Test | JUnit 5, AssertJ, Testcontainers (PostgreSQL) |
| DB | PostgreSQL 16 |
| Ingestion | Python 3.11+, `vnstock`, pandas, SQLAlchemy/psycopg, APScheduler |
| Frontend | Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, TanStack Query, TanStack Table, react-hook-form + zod, `openapi-typescript` (sinh client từ OpenAPI) |
| Biểu đồ | TradingView Lightweight Charts (nến/giá), ECharts (dashboard, heatmap, equity curve) |
| Hạ tầng | Docker Compose (dev), VPS + Caddy/Nginx (prod) |

---

## 3. Cấu trúc thư mục (monorepo)

```
vn-stock-lab/
├─ AGENTS.md                     # quy ước cho AI agent (mục 14)
├─ README.md
├─ docker-compose.yml
├─ .env.example
├─ docs/
│  ├─ architecture.md
│  ├─ data-dictionary.md         # đơn vị, múi giờ, tên cột, nguồn
│  ├─ valuation-notes.md         # công thức + giả định
│  └─ decisions/                 # ADR: mỗi quyết định lớn 1 file ngắn
│
├─ backend/
│  ├─ settings.gradle
│  ├─ build.gradle
│  ├─ core/                      # JAVA THUẦN, không Spring
│  │  └─ src/
│  │     ├─ main/java/com/stocklab/core/
│  │     │  ├─ common/          # Money, DateRange, TradingCalendar, Result
│  │     │  ├─ adjust/          # PriceAdjuster, AdjustmentFactorCalculator
│  │     │  ├─ metrics/         # RatioCalculator, TtmCalculator, BetaCalculator, GrowthCalculator
│  │     │  ├─ screener/        # CriteriaModel, CriteriaValidator
│  │     │  ├─ trading/         # Order, Fill, FillPolicy, FeeModel, LotRules, PriceLimitRules, Portfolio
│  │     │  ├─ backtest/        # BacktestEngine, Strategy, RankingStrategy, Rebalancer, PerformanceMetrics
│  │     │  └─ valuation/       # Capm, GordonDdm, TwoStageDdm, SensitivityGrid
│  │     └─ test/java/...       # test cho từng module (bắt buộc)
│  │
│  └─ app/                       # SPRING BOOT
│     └─ src/
│        ├─ main/java/com/stocklab/app/
│        │  ├─ StockLabApplication.java
│        │  ├─ config/          # SecurityConfig, CacheConfig, OpenApiConfig, SchedulingConfig
│        │  ├─ common/          # ApiError, GlobalExceptionHandler, PageResponse
│        │  ├─ auth/            # controller, JwtService, UserDetailsImpl
│        │  ├─ user/            # User entity/repo
│        │  ├─ marketdata/      # symbols, prices, index, corporate actions (controller/service/repo/dto)
│        │  ├─ fundamentals/    # financials + công bố
│        │  ├─ metrics/         # MetricsRecomputeService, MetricsQueryService
│        │  ├─ screener/        # ScreenerController, DynamicSqlBuilder (whitelist cột), PresetService
│        │  ├─ watchlist/
│        │  ├─ papertrading/    # PortfolioService, OrderService, SettlementJob, NavJob
│        │  ├─ backtest/        # BacktestController, BacktestRunner (@Async), BacktestRepository
│        │  ├─ valuation/       # ValuationController, ValuationService
│        │  ├─ jobs/            # InternalJobController, RecomputeOrchestrator, JobRunRepository
│        │  └─ dataquality/     # checker + endpoint xem issue
│        ├─ main/resources/
│        │  ├─ application.yml
│        │  ├─ application-dev.yml
│        │  └─ db/migration/    # V1__init.sql, V2__... (Flyway)
│        └─ test/               # integration test (Testcontainers)
│
├─ ingestion/                    # PYTHON, chỉ thu thập dữ liệu
│  ├─ pyproject.toml
│  └─ src/ingestion/
│     ├─ main.py                # APScheduler entry
│     ├─ config.py
│     ├─ providers/
│     │  ├─ base.py             # DataProvider (interface)
│     │  └─ vnstock_provider.py
│     ├─ jobs/
│     │  ├─ load_symbols.py
│     │  ├─ load_prices.py
│     │  ├─ load_corporate_actions.py
│     │  ├─ load_financials.py
│     │  └─ load_index_and_rates.py
│     ├─ db.py                  # upsert helpers
│     ├─ notify.py              # gọi POST /internal/jobs/recompute
│     └─ tests/
│
├─ frontend/
│  ├─ package.json
│  ├─ next.config.ts
│  ├─ tailwind.config.ts
│  └─ src/
│     ├─ app/
│     │  ├─ layout.tsx
│     │  ├─ (auth)/login/page.tsx
│     │  └─ (app)/
│     │     ├─ layout.tsx                   # sidebar + header
│     │     ├─ page.tsx                     # Tổng quan thị trường
│     │     ├─ symbols/[ticker]/page.tsx    # chi tiết mã
│     │     ├─ screener/page.tsx
│     │     ├─ watchlists/page.tsx
│     │     ├─ portfolios/page.tsx
│     │     ├─ portfolios/[id]/page.tsx
│     │     ├─ backtests/page.tsx           # danh sách
│     │     ├─ backtests/new/page.tsx
│     │     ├─ backtests/[id]/page.tsx
│     │     ├─ valuation/[ticker]/page.tsx
│     │     └─ settings/page.tsx
│     ├─ components/
│     │  ├─ ui/                 # shadcn
│     │  ├─ charts/             # PriceChart, EquityCurve, DrawdownChart, SensitivityHeatmap
│     │  ├─ tables/             # DataTable, columns định nghĩa theo feature
│     │  └─ layout/
│     ├─ features/
│     │  ├─ market/  ├─ symbol/  ├─ screener/  ├─ portfolio/  ├─ backtest/  └─ valuation/
│     │       (mỗi feature: components/, hooks/, api.ts, types.ts, schema.ts)
│     ├─ lib/
│     │  ├─ api/client.ts       # fetch wrapper + JWT
│     │  ├─ api/generated/      # openapi-typescript output (không sửa tay)
│     │  ├─ format.ts           # định dạng số/tiền/% theo vi-VN
│     │  └─ utils.ts
│     └─ styles/
│
└─ scripts/
   ├─ dev-up.sh
   ├─ gen-api-client.sh         # OpenAPI → TS types
   └─ seed-demo.sh
```

---

## 4. Database schema (PostgreSQL)

Quy ước: `snake_case`, giá trị tiền dùng `NUMERIC`, ngày dùng `DATE`, thời điểm dùng `TIMESTAMPTZ`. **Đơn vị giá: đồng (VND)** (chốt trong `data-dictionary.md`, tránh lẫn nghìn đồng).

### 4.1 Dữ liệu thị trường (V1\_\_market_data.sql)

```sql
CREATE TABLE symbols (
  id            BIGSERIAL PRIMARY KEY,
  ticker        VARCHAR(10) NOT NULL UNIQUE,
  name          TEXT,
  exchange      VARCHAR(10) NOT NULL,           -- HOSE | HNX | UPCOM
  industry      TEXT,                            -- ngành (ICB hoặc theo nguồn)
  industry_group VARCHAR(20),                    -- BANK | SECURITIES | REALESTATE | GENERAL ... (quyết định cách tính chỉ số)
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
  close      NUMERIC(18,2) NOT NULL,           -- giá thô, chưa điều chỉnh
  volume     BIGINT NOT NULL,
  value      NUMERIC(24,2),                    -- giá trị khớp
  adj_factor NUMERIC(20,10) NOT NULL DEFAULT 1,-- hệ số điều chỉnh tích lũy
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

CREATE TABLE index_constituents (            -- để tránh survivorship bias khi test theo VN30/VN100
  index_code VARCHAR(20) NOT NULL,
  symbol_id  BIGINT NOT NULL REFERENCES symbols(id),
  valid_from DATE NOT NULL,
  valid_to   DATE,                              -- NULL = còn hiệu lực
  PRIMARY KEY (index_code, symbol_id, valid_from)
);

CREATE TABLE corporate_actions (
  id            BIGSERIAL PRIMARY KEY,
  symbol_id     BIGINT NOT NULL REFERENCES symbols(id),
  action_type   VARCHAR(20) NOT NULL,          -- CASH_DIVIDEND | STOCK_DIVIDEND | BONUS | SPLIT | REVERSE_SPLIT | RIGHTS_ISSUE
  ex_date       DATE NOT NULL,                 -- ngày GDKHQ
  record_date   DATE,
  payment_date  DATE,
  cash_per_share NUMERIC(18,4),                -- cổ tức tiền / cp
  ratio_num     NUMERIC(18,6),                 -- vd 100 cp được nhận 10 cp: num=10, den=100
  ratio_den     NUMERIC(18,6),
  exercise_price NUMERIC(18,2),                -- giá phát hành thêm / quyền mua
  note          TEXT,
  UNIQUE (symbol_id, action_type, ex_date)
);

CREATE TABLE risk_free_rates (
  rate_date DATE NOT NULL,
  tenor     VARCHAR(10) NOT NULL,              -- 10Y
  yield_pct NUMERIC(8,4) NOT NULL,
  PRIMARY KEY (rate_date, tenor)
);
```

### 4.2 Báo cáo tài chính (V2\_\_fundamentals.sql)

Dùng bảng rộng cho các khoản mục chính + `raw` JSONB cho phần đặc thù ngành (ngân hàng, chứng khoán...).

```sql
CREATE TABLE financials (
  id             BIGSERIAL PRIMARY KEY,
  symbol_id      BIGINT NOT NULL REFERENCES symbols(id),
  period_type    VARCHAR(1) NOT NULL,           -- Q | Y
  fiscal_year    INT NOT NULL,
  fiscal_quarter INT,                           -- 1-4, NULL nếu năm
  period_end     DATE NOT NULL,
  published_date DATE,                          -- NGÀY CÔNG BỐ (bắt buộc cho backtest; thiếu thì ước lượng + gắn cờ)
  published_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  consolidated   BOOLEAN NOT NULL DEFAULT TRUE,
  revenue        NUMERIC(24,2),
  gross_profit   NUMERIC(24,2),
  operating_profit NUMERIC(24,2),
  net_profit     NUMERIC(24,2),                 -- LNST thuộc cổ đông công ty mẹ
  total_assets   NUMERIC(24,2),
  total_liabilities NUMERIC(24,2),
  equity         NUMERIC(24,2),                 -- vốn CSH (công ty mẹ)
  cfo            NUMERIC(24,2),
  capex          NUMERIC(24,2),
  interest_expense NUMERIC(24,2),
  raw            JSONB,                         -- khoản mục chi tiết/đặc thù ngành
  source         VARCHAR(30),
  UNIQUE (symbol_id, period_type, fiscal_year, fiscal_quarter)
);
CREATE INDEX idx_fin_pub ON financials (symbol_id, published_date);
```

### 4.3 Chỉ số tính sẵn (V3\_\_metrics.sql)

```sql
CREATE TABLE metrics_daily (
  symbol_id   BIGINT NOT NULL REFERENCES symbols(id),
  trade_date  DATE NOT NULL,
  market_cap  NUMERIC(24,2),
  avg_value_20d NUMERIC(24,2),                  -- thanh khoản
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
-- Chỉ số tại thời điểm T chỉ dùng BCTC có published_date <= T (point-in-time).
```

### 4.4 User, watchlist, screener (V4\_\_user.sql)

```sql
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
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- NULL = preset hệ thống
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.5 Paper trading (V5\_\_paper_trading.sql)

```sql
CREATE TABLE portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  initial_cash NUMERIC(20,2) NOT NULL,
  cash NUMERIC(20,2) NOT NULL,
  buy_fee_rate  NUMERIC(8,6) NOT NULL DEFAULT 0.0015,
  sell_fee_rate NUMERIC(8,6) NOT NULL DEFAULT 0.0015,
  sell_tax_rate NUMERIC(8,6) NOT NULL DEFAULT 0.001,
  settlement_days INT NOT NULL DEFAULT 2,        -- cấu hình; kiểm tra lại quy định hiện hành
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
  placed_on DATE NOT NULL,                       -- ngày giao dịch đặt lệnh
  filled_on DATE,
  reject_reason TEXT,
  thesis TEXT,                                   -- LÝ DO MUA/BÁN (để học, chống FOMO)
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
  available_quantity INT NOT NULL,               -- phần được phép bán
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
```

### 4.6 Backtest (V6\_\_backtest.sql)

```sql
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
```

### 4.7 Định giá, job, chất lượng dữ liệu (V7\_\_misc.sql)

```sql
CREATE TABLE valuation_runs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol_id BIGINT NOT NULL REFERENCES symbols(id),
  model VARCHAR(20) NOT NULL,                    -- CAPM | DDM | DDM2 | RELATIVE
  inputs JSONB NOT NULL,                         -- rf, beta, erp, g, D0, ...
  outputs JSONB NOT NULL,                        -- giá trị theo kịch bản + bảng độ nhạy + cảnh báo
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
```

---

## 5. Thuật toán và quy tắc cho từng module `core`

### 5.1 Điều chỉnh giá (`adjust`)

- Giá thô giữ nguyên trong `close`. `adj_factor` là hệ số **tích lũy từ ngày GDKHQ trở về trước**.
- Cổ tức tiền: `factor = (P_prev_close - D) / P_prev_close`.
- Cổ tức/thưởng cổ phiếu, tách: `factor = 1 / (1 + ratio)` (ratio = num/den).
- Quyền mua giá thấp: dùng công thức theoretical ex-rights price rồi suy ra factor.
- `adj_close = close * adj_factor`. Khi có corporate action mới, **tính lại toàn bộ lịch sử mã đó**.
- Test: mã có cổ tức/thưởng đã biết, đối chiếu với nguồn.

### 5.2 Chỉ số (`metrics`) — point-in-time

- **TTM** = tổng 4 quý gần nhất **đã công bố tại ngày T** (`published_date <= T`).
- `EPS_ttm = LNST_ttm / số cp lưu hành`, `PE = giá / EPS_ttm`, `PB = giá / BVPS`.
- `ROE_ttm = LNST_ttm / vốn CSH bình quân`.
- Tăng trưởng YoY so cùng kỳ năm trước.
- **Beta:** hồi quy lợi suất tuần (hoặc ngày) của mã theo VN-Index, cửa sổ 1 năm và 3 năm; cần tối thiểu N quan sát, không đủ thì NULL.
- Ngân hàng/chứng khoán/BĐS: tập chỉ số riêng (`industry_group`), không so thẳng nợ/vốn giữa các nhóm.

### 5.3 Screener

- Criteria JSON:

  ```json
  { "asOf": "latest",
    "universe": {"exchange": ["HOSE"], "industryGroup": ["GENERAL"], "minAvgValue20d": 5e9},
    "logic": "AND",
    "conditions": [
      {"field": "roe_ttm", "op": ">=", "value": 0.15},
      {"field": "pe_ttm",  "op": "between", "value": [5, 15]},
      {"field": "debt_to_equity", "op": "<=", "value": 1.5}
    ],
    "sort": {"field": "roe_ttm", "dir": "desc"}, "limit": 50 }
  ```
- **Bảo mật:** `DynamicSqlBuilder` chỉ cho phép cột trong **whitelist** và toán tử cố định; giá trị luôn dùng tham số, không nối chuỗi.

### 5.4 Paper trading (`trading`)

- Lô chẵn 100 cp (cấu hình), biên độ giá theo sàn (HOSE ±7%, HNX ±10%, UPCoM ±15%; cấu hình được), bước giá theo mức giá.
- Lệnh đặt trong ngày T khớp theo `fill_policy` (mặc định giá mở cửa T+1), từ chối nếu: không đủ tiền, bán quá `available_quantity`, giá ngoài biên, khối lượng vượt X% volume ngày (mặc định 5-10%).
- Phí mua/bán + thuế bán áp dụng khi khớp.
- `settle_date = trade_date + settlement_days` (ngày giao dịch). Job hằng ngày chuyển `quantity → available_quantity` khi đến hạn. **Kiểm tra quy định hiện hành khi hệ thống KRX áp dụng** và chỉnh cấu hình.
- `nav_daily` = tiền + Σ(số cp × giá đóng cửa); job chạy sau khi có giá.

### 5.5 Backtest (`backtest`)

- Dùng **chung** `FillPolicy`, `FeeModel`, `LotRules`, `Portfolio` với paper trading.
- Định nghĩa chiến lược (MVP): **xếp hạng nhân tố**.

  ```json
  { "universe": {"index": "VN100", "pointInTime": true},
    "filters": [{"field": "pe_ttm", "op": ">", "value": 0}],
    "ranking": {"field": "roe_ttm", "dir": "desc"},
    "topN": 15, "weighting": "EQUAL",
    "rebalance": "QUARTERLY", "costs": {"buyFee":0.0015,"sellFee":0.0015,"sellTax":0.001} }
  ```
- Vòng lặp: mỗi ngày giao dịch → xử lý lệnh chờ → cập nhật NAV; ngày rebalance → lọc → xếp hạng → sinh lệnh (khớp ở T+1).
- **Chống bias:** point-in-time theo `published_date`; universe gồm cả mã sau này hủy niêm yết (dựa `index_constituents`, `listing/delisting_date`); dùng `adj_close` để tính lợi suất nhưng khớp lệnh trên **giá thô** khi cần tính lô/giá; có phí, thanh khoản, lô 100.
- **Chỉ số:** tổng lợi nhuận, CAGR, volatility năm hóa (√252), Sharpe (trừ rf), max drawdown, win rate, turnover, so với benchmark.
- **Kiểm tra overfitting:** chia in-sample/out-of-sample; chạy lưới tham số lân cận và hiển thị độ ổn định.

### 5.6 Định giá (`valuation`)

- **CAPM:** `r = rf + β × ERP`. rf lấy từ `risk_free_rates` (10Y), β từ `metrics_daily`, ERP là **tham số người dùng chỉnh** (mặc định có ghi chú là giả định).
- **Gordon DDM:** `P = D0(1+g) / (r − g)`. Điều kiện `g < r`, nếu vi phạm trả cảnh báo, không trả giá trị.
- **DDM 2 giai đoạn:** g cao N năm rồi g bền vững.
- Đầu ra luôn gồm: 3 kịch bản (g thấp/trung/cao), **bảng độ nhạy r × g**, danh sách **cảnh báo** (không trả cổ tức tiền mặt đều, β thiếu/ít quan sát, r − g quá nhỏ, ngành không hợp mô hình).
- Hiển thị khoảng giá trị, không hiển thị "nên mua". Có thể thêm góc nhìn tương đối (P/E, P/B so trung vị ngành).

---

## 6. REST API (prefix `/api/v1`)

| Nhóm | Endpoint |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Market | `GET /market/overview`, `GET /market/indices/{code}/prices`, `GET /market/top-movers` |
| Symbols | `GET /symbols?query=&exchange=`, `GET /symbols/{ticker}`, `GET /symbols/{ticker}/prices?from=&to=&adjusted=`, `GET /symbols/{ticker}/metrics`, `GET /symbols/{ticker}/financials?period=Q`, `GET /symbols/{ticker}/peers` |
| Screener | `POST /screener/run`, `GET/POST/DELETE /screener/presets` |
| Watchlist | `GET/POST /watchlists`, `POST/DELETE /watchlists/{id}/items` |
| Portfolio | `GET/POST /portfolios`, `GET /portfolios/{id}` (positions, NAV), `POST /portfolios/{id}/orders`, `DELETE /portfolios/{id}/orders/{oid}`, `GET /portfolios/{id}/trades`, `GET /portfolios/{id}/nav` |
| Backtest | `POST /backtests` (202 + id), `GET /backtests`, `GET /backtests/{id}`, `GET /backtests/{id}/equity`, `GET /backtests/{id}/trades` |
| Valuation | `POST /valuation/capm`, `POST /valuation/ddm`, `GET /valuation/{ticker}/defaults` |
| Internal | `POST /internal/jobs/recompute` (header `X-Internal-Key`), `GET /admin/data-quality`, `GET /admin/jobs` |

Quy ước: lỗi trả `ApiError {code, message, details}`; phân trang `PageResponse`; OpenAPI tự sinh, FE sinh type từ đó.

---

## 7. Job và lịch chạy (T2-T6, giờ Việt Nam)

| Giờ | Job | Nơi chạy |
| --- | --- | --- |
| 15:30 | Tải giá EOD, index | ingestion |
| 16:00 | Tải corporate actions mới | ingestion |
| 16:15 | Gọi `/internal/jobs/recompute` | ingestion → backend |
| 16:15+ | Tính lại `adj_factor`/`adj_close` (mã có sự kiện) → `metrics_daily` → khớp lệnh paper trading → `nav_daily` → data quality check | backend |
| Hằng tuần | Cập nhật danh sách mã, thành phần chỉ số | ingestion |
| Theo mùa BCTC | Tải BCTC mới + ngày công bố | ingestion |

Mỗi job ghi `job_runs`; lỗi thì log rõ, có trang admin xem trạng thái. Job phải **idempotent** (chạy lại không nhân đôi dữ liệu, dùng upsert).

---

## 8. Frontend: màn hình và thành phần

| Trang | Nội dung |
| --- | --- |
| Tổng quan | VN-Index/VN30, top tăng/giảm, thanh khoản, heatmap ngành |
| Chi tiết mã | Biểu đồ giá (chọn điều chỉnh/thô), chỉ số, BCTC theo quý, so với VN-Index/ngành, nút thêm watchlist / đặt lệnh ảo / định giá |
| Screener | Form điều kiện động, preset, bảng kết quả (TanStack Table), xuất CSV |
| Portfolios | Danh sách, chi tiết (vị thế, NAV, so benchmark), form đặt lệnh (kèm ô **lý do mua**), nhật ký lệnh |
| Backtest | Form định nghĩa chiến lược, trạng thái chạy, kết quả: equity vs benchmark, drawdown, bảng chỉ số, danh sách giao dịch |
| Định giá | Nhập/chỉnh giả định, kịch bản, bảng độ nhạy (heatmap), danh sách cảnh báo |

Kỹ thuật: dữ liệu qua TanStack Query (cache, refetch), form dùng react-hook-form + zod, định dạng số theo `vi-VN`, hỗ trợ dark mode, loading/empty/error state cho mọi trang.

Khung disclaimer hiển thị cố định: *"Công cụ phân tích và học tập, không phải khuyến nghị đầu tư. Dữ liệu cuối ngày, có thể có sai lệch."*

---

## 9. Docker Compose (dev)

```yaml
services:
  db:
    image: postgres:16
    environment: { POSTGRES_DB: stocklab, POSTGRES_USER: stocklab, POSTGRES_PASSWORD: ${DB_PASSWORD} }
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/stocklab
      SPRING_DATASOURCE_USERNAME: stocklab
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      INTERNAL_KEY: ${INTERNAL_KEY}
    depends_on: [db]
    ports: ["8080:8080"]
  ingestion:
    build: ./ingestion
    environment:
      DATABASE_URL: postgresql://stocklab:${DB_PASSWORD}@db:5432/stocklab
      BACKEND_URL: http://backend:8080
      INTERNAL_KEY: ${INTERNAL_KEY}
    depends_on: [db, backend]
  frontend:
    build: ./frontend
    environment: { NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1 }
    ports: ["3000:3000"]
volumes: { pgdata: {} }
```

`.env.example` chứa `DB_PASSWORD`, `JWT_SECRET`, `INTERNAL_KEY`. **Không commit file `.env` thật.**

---

## 10. Chiến lược test

| Loại | Phạm vi |
| --- | --- |
| Unit (`core`) | Điều chỉnh giá, TTM, các tỷ số, beta, phí/thuế/lô/biên độ, fill, NAV, CAPM, DDM, metric backtest |
| Test đối chiếu | 5-10 mã đã kiểm chứng thủ công (giá điều chỉnh, EPS, ROE) |
| Bất biến | NAV ≥ 0 khi không đòn bẩy; tiền + giá trị CP khớp; không bán quá số đang giữ; không dùng dữ liệu sau ngày T (test look-ahead) |
| Integration (`app`) | Testcontainers + Flyway: repo, screener SQL, luồng đặt lệnh |
| Ingestion | Test upsert idempotent, parse dữ liệu mẫu |
| E2E nhẹ (FE) | Playwright cho 3 luồng: xem mã, chạy screener, đặt lệnh ảo |

Quy tắc: **mỗi module tài chính phải có test trước khi sang module tiếp theo.**

---

## 11. Roadmap chi tiết (checklist)

### Giai đoạn 0: Khởi tạo (2-3 ngày)

- [ ] Tạo monorepo, `AGENTS.md`, `docs/data-dictionary.md`
- [ ] Gradle multi-module (`core`, `app`), Spring Boot chạy được, Flyway kết nối DB
- [ ] Docker Compose db + backend, Next.js hello world, CI cơ bản (build + test)
- **Xong khi:** `docker compose up` chạy đủ 4 service, health check OK.

### Giai đoạn 1: Data layer (1-2 tuần)

- [ ] Migration V1-V3
- [ ] `ingestion`: symbols, giá VN100 + VN-Index, corporate actions, BCTC (có ngày công bố), lãi suất TPCP 10Y
- [ ] `PriceAdjuster` + test; `data_quality` checker
- [ ] `job_runs` + endpoint admin
- **Xong khi:** đối chiếu thủ công khớp, job chạy lặp lại không nhân đôi dữ liệu.

### Giai đoạn 2: Chỉ số + dashboard (1-2 tuần)

- [ ] `core/metrics` + test; `MetricsRecomputeService` → `metrics_daily`
- [ ] API symbols/market; FE: Tổng quan, Chi tiết mã (chart giá, chỉ số, BCTC)
- **Xong khi:** số liệu trang chi tiết khớp nguồn đối chiếu.

### Giai đoạn 3: Screener + Auth + Watchlist (1 tuần)

- [ ] Auth JWT, user
- [ ] `DynamicSqlBuilder` (whitelist) + preset hệ thống
- [ ] FE: screener, watchlist
- **Xong khi:** lọc 100 mã \< 500 ms, không có đường SQL injection (có test).

### Giai đoạn 4: Paper trading (1-2 tuần)

- [ ] `core/trading` + test (phí, lô, biên độ, thanh toán)
- [ ] API portfolio/order; job khớp lệnh + NAV
- [ ] FE: portfolio, đặt lệnh (có ô lý do), nhật ký
- **Xong khi:** mô phỏng 1 chuỗi lệnh mẫu, NAV khớp tính tay.

### Giai đoạn 5: Backtest (2 tuần)

- [ ] `core/backtest` dùng chung engine giai đoạn 4
- [ ] `BacktestRunner` async + lưu equity/trades
- [ ] Point-in-time test, in-sample/out-of-sample, lưới tham số
- [ ] FE: form + trang kết quả
- **Xong khi:** test look-ahead pass; kết quả chiến lược đơn giản (mua giữ VN30) khớp tính tay.

### Giai đoạn 6: Định giá (1-2 tuần)

- [ ] `core/valuation` + test; cảnh báo; bảng độ nhạy
- [ ] FE: trang định giá + heatmap
- **Xong khi:** ví dụ tính tay khớp, trường hợp `g ≥ r` được chặn.

### Giai đoạn 7: Hoàn thiện

- [ ] Cache (Caffeine), index DB, kiểm tra EXPLAIN các query chính
- [ ] Logging/monitoring job, backup DB, deploy VPS + HTTPS
- [ ] Dọn disclaimer, kiểm tra điều khoản nguồn dữ liệu trước khi công khai

---

## 12. Rủi ro và cách giảm

| Rủi ro | Giảm thiểu |
| --- | --- |
| Nguồn dữ liệu đổi/chặn | `DataProvider` interface, lưu dữ liệu đã tải, có nguồn dự phòng |
| Dữ liệu sai | Data quality checker, đối chiếu thủ công định kỳ |
| Look-ahead / survivorship bias | `published_date`, `index_constituents`, test riêng |
| Backtest đẹp giả | Out-of-sample, lưới tham số, hiển thị độ ổn định |
| Tự lừa mình bằng mô hình | Kịch bản + độ nhạy + cảnh báo, không "đáng mua" |
| Pháp lý / bản quyền dữ liệu | Dùng cá nhân trước; công khai thì kiểm tra điều khoản, disclaimer, không tư vấn đầu tư |
| Scope phình to | Làm theo giai đoạn, mỗi giai đoạn có tiêu chí "xong" |

---

## 13. Quyết định còn mở (chốt khi bắt đầu)

1. Nguồn dữ liệu chính: `vnstock` hay API công ty chứng khoán (SSI/VNDirect)?
2. Universe MVP: VN30 hay VN100?
3. Lưu BCTC: giữ bảng rộng như trên, hay chuyển sang dạng khoản mục (EAV) nếu cần nhiều chỉ tiêu?
4. Quy tắc thanh toán (`settlement_days`) áp dụng thực tế khi KRX vận hành: xác nhận với công ty chứng khoán.

---

## 14. `AGENTS.md` mẫu (đặt ở root repo)

```markdown
# AGENTS.md — VN Stock Lab

## Ngôn ngữ & phong cách
- Trả lời tiếng Việt, ngắn gọn. Code/comment tiếng Anh, tên biến rõ nghĩa.

## Kiến trúc (không phá vỡ)
- `backend/core`: Java thuần, KHÔNG import Spring/JPA. Mọi logic tài chính nằm ở đây.
- `backend/app`: Spring Boot, chỉ gọi core, không chứa công thức tài chính.
- `ingestion`: Python, chỉ thu thập dữ liệu và ghi DB.
- Đơn vị giá: VND. Ngày: DATE theo lịch giao dịch VN.

## Quy tắc bắt buộc
1. Đọc file liên quan trước khi sửa; không viết lại file không cần thiết.
2. Logic tài chính (điều chỉnh giá, chỉ số, phí, backtest, định giá) PHẢI có unit test.
3. Backtest và chỉ số chỉ dùng dữ liệu có `published_date <= ngày T` (point-in-time).
4. SQL động chỉ dùng whitelist cột + tham số hóa. Không nối chuỗi từ input.
5. Migration chỉ thêm file mới (V{n}__*.sql), không sửa migration đã chạy.
6. Không commit secret/.env. Không thêm dependency khi chưa nêu lý do.
7. Không hiển thị "nên mua/nên bán"; luôn kèm giả định và cảnh báo.

## Quy trình
- Mỗi lần chỉ làm 1 task nhỏ; chạy test trước khi báo xong.
- Báo ngắn: đã đổi gì, file nào, test nào đã chạy.
```