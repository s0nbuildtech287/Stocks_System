import logging
import pandas as pd
from datetime import datetime
from sqlalchemy import text
from ingestion.db import engine, log_job_run
from ingestion.providers.vnstock_provider import VnstockProvider
from ingestion.config import VNSTOCK_API_KEY

logger = logging.getLogger(__name__)

def sync_financials():
    job_name = "sync_financials"
    logger.info("Starting sync_financials job...")
    try:
        provider = VnstockProvider(api_key=VNSTOCK_API_KEY)
        
        with engine.connect() as conn:
            symbols_df = pd.read_sql("SELECT id, ticker FROM symbols WHERE status = 'LISTED' LIMIT 50", conn)

        if symbols_df.empty:
            logger.warning("No symbols found.")
            log_job_run(job_name, "SUCCESS", 0)
            return

        upsert_query = text("""
            INSERT INTO financials (
                symbol_id, period_type, fiscal_year, fiscal_quarter, period_end,
                published_date, published_estimated, consolidated, revenue,
                gross_profit, operating_profit, net_profit, total_assets,
                total_liabilities, equity, source
            )
            VALUES (
                :symbol_id, :period_type, :fiscal_year, :fiscal_quarter, :period_end,
                :published_date, :published_estimated, true, :revenue,
                :gross_profit, :operating_profit, :net_profit, :total_assets,
                :total_liabilities, :equity, 'vnstock'
            )
            ON CONFLICT (symbol_id, period_type, fiscal_year, fiscal_quarter) DO UPDATE SET
                revenue = EXCLUDED.revenue,
                gross_profit = EXCLUDED.gross_profit,
                operating_profit = EXCLUDED.operating_profit,
                net_profit = EXCLUDED.net_profit,
                total_assets = EXCLUDED.total_assets,
                total_liabilities = EXCLUDED.total_liabilities,
                equity = EXCLUDED.equity,
                published_date = COALESCE(financials.published_date, EXCLUDED.published_date);
        """)

        total_rows = 0
        with engine.begin() as conn:
            for _, s_row in symbols_df.iterrows():
                symbol_id = int(s_row["id"])
                ticker = s_row["ticker"]
                try:
                    df = provider.get_financial_reports(ticker, report_type="Quarterly")
                    if df is not None and not df.empty:
                        for _, row in df.iterrows():
                            year = int(row.get("year", row.get("fiscal_year", 2024)))
                            quarter = int(row.get("quarter", row.get("fiscal_quarter", 1)))
                            
                            # Estimate period_end and published_date if missing
                            month_map = {1: (3, 31, 4, 30), 2: (6, 30, 7, 30), 3: (9, 30, 10, 30), 4: (12, 31, 1, 30)}
                            m_end, d_end, m_pub, d_pub = month_map.get(quarter, (12, 31, 1, 30))
                            
                            period_end = f"{year}-{m_end:02d}-{d_end:02d}"
                            pub_year = year if quarter < 4 else year + 1
                            published_date = f"{pub_year}-{m_pub:02d}-{d_pub:02d}"

                            rev = float(row.get("revenue", row.get("net_revenue", 0))) * 1_000_000_000 # convert to VND if in Billion
                            gp = float(row.get("gross_profit", 0)) * 1_000_000_000
                            op = float(row.get("operating_profit", 0)) * 1_000_000_000
                            np = float(row.get("net_profit", row.get("profit_after_tax", 0))) * 1_000_000_000

                            conn.execute(upsert_query, {
                                "symbol_id": symbol_id,
                                "period_type": "Q",
                                "fiscal_year": year,
                                "fiscal_quarter": quarter,
                                "period_end": period_end,
                                "published_date": published_date,
                                "published_estimated": True,
                                "revenue": rev if rev != 0 else None,
                                "gross_profit": gp if gp != 0 else None,
                                "operating_profit": op if op != 0 else None,
                                "net_profit": np if np != 0 else None,
                                "total_assets": None,
                                "total_liabilities": None,
                                "equity": None
                            })
                            total_rows += 1
                except Exception as ex:
                    logger.warning(f"Error fetching financials for {ticker}: {ex}")

        logger.info(f"sync_financials completed. Processed {total_rows} financial records.")
        log_job_run(job_name, "SUCCESS", total_rows)
    except Exception as e:
        logger.error(f"sync_financials failed: {e}", exc_info=True)
        log_job_run(job_name, "FAILED", 0, str(e))
