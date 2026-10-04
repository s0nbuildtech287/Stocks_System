import logging
import pandas as pd
from sqlalchemy import text
from ingestion.db import engine, log_job_run
from ingestion.providers.vnstock_provider import VnstockProvider
from ingestion.config import VNSTOCK_API_KEY

logger = logging.getLogger(__name__)

def sync_symbols():
    job_name = "sync_symbols"
    logger.info("Starting sync_symbols job...")
    try:
        provider = VnstockProvider(api_key=VNSTOCK_API_KEY)
        df = provider.get_symbols()
        
        if df.empty:
            logger.warning("No symbols retrieved.")
            log_job_run(job_name, "SUCCESS", 0)
            return

        # Expected columns mapping from vnstock listing: ticker, organ_name/company_name, com_group_code/exchange
        upsert_query = text("""
            INSERT INTO symbols (ticker, name, exchange, industry, industry_group, status, updated_at)
            VALUES (:ticker, :name, :exchange, :industry, :industry_group, 'LISTED', now())
            ON CONFLICT (ticker) DO UPDATE SET
                name = EXCLUDED.name,
                exchange = EXCLUDED.exchange,
                industry = COALESCE(EXCLUDED.industry, symbols.industry),
                industry_group = COALESCE(EXCLUDED.industry_group, symbols.industry_group),
                updated_at = now();
        """)

        rows_count = 0
        with engine.begin() as conn:
            for _, row in df.iterrows():
                ticker = str(row.get("ticker", row.get("symbol", ""))).strip().upper()
                if not ticker:
                    continue
                name = str(row.get("organ_name", row.get("name", ticker)))
                exchange = str(row.get("com_group_code", row.get("exchange", "HOSE"))).strip().upper()
                industry = str(row.get("icb_name", row.get("industry", "")))
                
                # Basic classification
                industry_group = "GENERAL"
                if "Ngân hàng" in industry or "Bank" in industry or "Ngan hang" in industry:
                    industry_group = "BANK"
                elif "Chứng khoán" in industry or "Securities" in industry or "Chung khoan" in industry:
                    industry_group = "SECURITIES"
                elif "Bất động sản" in industry or "Real Estate" in industry or "Bat dong san" in industry:
                    industry_group = "REALESTATE"

                conn.execute(upsert_query, {
                    "ticker": ticker,
                    "name": name,
                    "exchange": exchange,
                    "industry": industry,
                    "industry_group": industry_group
                })
                rows_count += 1

        logger.info(f"sync_symbols completed successfully. Total processed: {rows_count}")
        log_job_run(job_name, "SUCCESS", rows_count)
    except Exception as e:
        logger.error(f"sync_symbols failed: {e}", exc_info=True)
        log_job_run(job_name, "FAILED", 0, str(e))
