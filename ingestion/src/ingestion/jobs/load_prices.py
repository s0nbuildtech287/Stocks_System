import logging
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import text
from ingestion.db import engine, log_job_run
from ingestion.providers.vnstock_provider import VnstockProvider
from ingestion.config import VNSTOCK_API_KEY

logger = logging.getLogger(__name__)

def sync_daily_prices(days_back: int = 5):
    job_name = "sync_daily_prices"
    logger.info(f"Starting sync_daily_prices for last {days_back} days...")
    try:
        provider = VnstockProvider(api_key=VNSTOCK_API_KEY)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

        # Get list of symbols from DB
        with engine.connect() as conn:
            symbols_df = pd.read_sql("SELECT id, ticker FROM symbols WHERE status = 'LISTED' LIMIT 100", conn)

        if symbols_df.empty:
            logger.warning("No active symbols in DB to fetch prices for.")
            log_job_run(job_name, "SUCCESS", 0)
            return

        upsert_query = text("""
            INSERT INTO prices_daily (symbol_id, trade_date, open, high, low, close, volume, value, adj_factor, adj_close)
            VALUES (:symbol_id, :trade_date, :open, :high, :low, :close, :volume, :value, 1.0, :close)
            ON CONFLICT (symbol_id, trade_date) DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                value = EXCLUDED.value;
        """)

        total_rows = 0
        with engine.begin() as conn:
            for _, s_row in symbols_df.iterrows():
                symbol_id = int(s_row["id"])
                ticker = s_row["ticker"]
                try:
                    df = provider.get_daily_prices(ticker, start_date, end_date)
                    if df is not None and not df.empty:
                        for _, p_row in df.iterrows():
                            # Note: Ensure price is in VND
                            t_date = p_row.get("time", p_row.get("date", p_row.get("trade_date")))
                            if isinstance(t_date, str):
                                t_date = t_date.split()[0]
                            
                            c = float(p_row.get("close", 0))
                            o = float(p_row.get("open", c))
                            h = float(p_row.get("high", c))
                            l = float(p_row.get("low", c))
                            vol = int(p_row.get("volume", 0))
                            val = float(p_row.get("value", c * vol))

                            # Handle potential x1000 scale if provider outputs thousands VND
                            if c < 1000 and c > 0:
                                c *= 1000
                                o *= 1000
                                h *= 1000
                                l *= 1000
                                val *= 1000

                            conn.execute(upsert_query, {
                                "symbol_id": symbol_id,
                                "trade_date": t_date,
                                "open": o,
                                "high": h,
                                "low": l,
                                "close": c,
                                "volume": vol,
                                "value": val
                            })
                            total_rows += 1
                except Exception as ex:
                    logger.warning(f"Failed to fetch price for {ticker}: {ex}")

        logger.info(f"sync_daily_prices finished. Total records: {total_rows}")
        log_job_run(job_name, "SUCCESS", total_rows)
    except Exception as e:
        logger.error(f"sync_daily_prices failed: {e}", exc_info=True)
        log_job_run(job_name, "FAILED", 0, str(e))
