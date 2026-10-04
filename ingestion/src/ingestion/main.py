import logging
import time
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from ingestion.config import TIMEZONE
from ingestion.jobs.load_symbols import sync_symbols
from ingestion.jobs.load_prices import sync_daily_prices
from ingestion.jobs.load_corporate_actions import sync_corporate_actions
from ingestion.jobs.load_financials import sync_financials
from ingestion.jobs.load_index_and_rates import sync_index_and_rates
from ingestion.notify import trigger_backend_recompute

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ingestion-service")

def run_daily_pipeline():
    logger.info("================ STARTING DAILY INGESTION PIPELINE ================")
    try:
        # Step 1: Sync Symbols
        sync_symbols()
        
        # Step 2: Sync Daily Prices (OHLCV)
        sync_daily_prices(days_back=5)

        # Step 3: Sync Corporate Actions (Dividends, Splits)
        sync_corporate_actions()

        # Step 4: Sync Financials (BCTC Point-in-time)
        sync_financials()

        # Step 5: Sync Indices & Risk-free rates
        sync_index_and_rates()
        
        # Step 6: Notify backend to recompute adjusted prices, metrics & paper trading
        trigger_backend_recompute()
    except Exception as e:
        logger.error(f"Error during daily pipeline: {e}", exc_info=True)
    logger.info("================ FINISHED DAILY INGESTION PIPELINE ================")

def main():
    logger.info("Starting VN Stock Lab Ingestion Service...")
    
    tz = pytz.timezone(TIMEZONE)
    scheduler = BlockingScheduler(timezone=tz)

    # 15:30 Mon-Fri: Daily Ingestion
    scheduler.add_job(
        run_daily_pipeline,
        trigger=CronTrigger(day_of_week='mon-fri', hour=15, minute=30, timezone=tz),
        id="daily_pipeline"
    )

    logger.info(f"Scheduler initialized for timezone {TIMEZONE}. Waiting for scheduled runs (15:30 Mon-Fri)...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Stopping scheduler...")

if __name__ == "__main__":
    main()
