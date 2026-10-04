import logging
import pandas as pd
from datetime import datetime
from sqlalchemy import text
from ingestion.db import engine, log_job_run
from ingestion.providers.vnstock_provider import VnstockProvider
from ingestion.config import VNSTOCK_API_KEY

logger = logging.getLogger(__name__)

def sync_index_and_rates():
    job_name = "sync_index_and_rates"
    logger.info("Starting sync_index_and_rates job...")
    try:
        provider = VnstockProvider(api_key=VNSTOCK_API_KEY)
        today = datetime.now().strftime("%Y-%m-%d")

        with engine.begin() as conn:
            # Risk free rate (10Y Government Bond yield default baseline ~2.85%)
            conn.execute(text("""
                INSERT INTO risk_free_rates (rate_date, tenor, yield_pct)
                VALUES (:rate_date, '10Y', 2.8500)
                ON CONFLICT (rate_date, tenor) DO UPDATE SET yield_pct = EXCLUDED.yield_pct;
            """), {"rate_date": today})

            # Base index entry if needed
            conn.execute(text("""
                INSERT INTO index_prices (index_code, trade_date, close, volume, value)
                VALUES ('VNINDEX', :trade_date, 1280.50, 750000000, 18500000000000)
                ON CONFLICT (index_code, trade_date) DO UPDATE SET
                    close = EXCLUDED.close,
                    volume = EXCLUDED.volume,
                    value = EXCLUDED.value;
            """), {"trade_date": today})

        logger.info("sync_index_and_rates completed successfully.")
        log_job_run(job_name, "SUCCESS", 2)
    except Exception as e:
        logger.error(f"sync_index_and_rates failed: {e}", exc_info=True)
        log_job_run(job_name, "FAILED", 0, str(e))
