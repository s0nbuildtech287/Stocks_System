import logging
import pandas as pd
from datetime import datetime
from sqlalchemy import text
from ingestion.db import engine, log_job_run
from ingestion.providers.vnstock_provider import VnstockProvider
from ingestion.config import VNSTOCK_API_KEY

logger = logging.getLogger(__name__)

def sync_corporate_actions():
    job_name = "sync_corporate_actions"
    logger.info("Starting sync_corporate_actions job...")
    try:
        provider = VnstockProvider(api_key=VNSTOCK_API_KEY)
        
        with engine.connect() as conn:
            symbols_df = pd.read_sql("SELECT id, ticker FROM symbols WHERE status = 'LISTED' LIMIT 100", conn)

        if symbols_df.empty:
            logger.warning("No symbols found.")
            log_job_run(job_name, "SUCCESS", 0)
            return

        upsert_query = text("""
            INSERT INTO corporate_actions (symbol_id, action_type, ex_date, record_date, payment_date, cash_per_share, ratio_num, ratio_den, exercise_price, note)
            VALUES (:symbol_id, :action_type, :ex_date, :record_date, :payment_date, :cash_per_share, :ratio_num, :ratio_den, :exercise_price, :note)
            ON CONFLICT (symbol_id, action_type, ex_date) DO UPDATE SET
                record_date = EXCLUDED.record_date,
                payment_date = EXCLUDED.payment_date,
                cash_per_share = EXCLUDED.cash_per_share,
                ratio_num = EXCLUDED.ratio_num,
                ratio_den = EXCLUDED.ratio_den,
                exercise_price = EXCLUDED.exercise_price,
                note = EXCLUDED.note;
        """)

        total_rows = 0
        with engine.begin() as conn:
            for _, s_row in symbols_df.iterrows():
                symbol_id = int(s_row["id"])
                ticker = s_row["ticker"]
                try:
                    df = provider.get_corporate_actions(ticker)
                    if df is not None and not df.empty:
                        for _, row in df.iterrows():
                            event_name = str(row.get("event_name", row.get("title", "")))
                            ex_date_str = str(row.get("ex_date", row.get("issue_date", "")))
                            if not ex_date_str or ex_date_str == "None":
                                continue
                            
                            ex_date = ex_date_str.split()[0]
                            action_type = "CASH_DIVIDEND"
                            cash_val = 0.0
                            r_num = 0.0
                            r_den = 100.0

                            if "tiền" in event_name.lower() or "cash" in event_name.lower():
                                action_type = "CASH_DIVIDEND"
                                cash_val = float(row.get("value", row.get("cash_dividend", 1000)))
                            elif "cổ phiếu" in event_name.lower() or "stock" in event_name.lower():
                                action_type = "STOCK_DIVIDEND"
                                r_num = float(row.get("ratio", 10))
                            elif "thưởng" in event_name.lower() or "bonus" in event_name.lower():
                                action_type = "BONUS"
                                r_num = float(row.get("ratio", 10))

                            conn.execute(upsert_query, {
                                "symbol_id": symbol_id,
                                "action_type": action_type,
                                "ex_date": ex_date,
                                "record_date": None,
                                "payment_date": None,
                                "cash_per_share": cash_val if cash_val > 0 else None,
                                "ratio_num": r_num if r_num > 0 else None,
                                "ratio_den": r_den,
                                "exercise_price": None,
                                "note": event_name
                            })
                            total_rows += 1
                except Exception as ex:
                    logger.warning(f"Error fetching corporate actions for {ticker}: {ex}")

        logger.info(f"sync_corporate_actions completed. Processed {total_rows} actions.")
        log_job_run(job_name, "SUCCESS", total_rows)
    except Exception as e:
        logger.error(f"sync_corporate_actions failed: {e}", exc_info=True)
        log_job_run(job_name, "FAILED", 0, str(e))
