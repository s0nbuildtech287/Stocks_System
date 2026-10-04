import logging
import pandas as pd
from datetime import datetime
from ingestion.providers.base import DataProvider

logger = logging.getLogger(__name__)

class VnstockProvider(DataProvider):

    def __init__(self, api_key: str = None):
        self.api_key = api_key
        # Vnstock v4 initialization if api key present
        if api_key:
            try:
                from vnstock.core import setup_api_key
                setup_api_key(api_key)
            except Exception as e:
                logger.warning(f"Could not configure vnstock API key: {e}")

    def get_symbols(self) -> pd.DataFrame:
        try:
            from vnstock import Reference
            ref = Reference()
            df = ref.company.listing()
            return df
        except Exception as e:
            logger.error(f"Error fetching symbols: {e}")
            return pd.DataFrame()

    def get_daily_prices(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        try:
            from vnstock import Quote
            quote = Quote(symbol=symbol)
            df = quote.history(start=start_date, end=end_date)
            return df
        except Exception as e:
            logger.error(f"Error fetching prices for {symbol}: {e}")
            return pd.DataFrame()

    def get_corporate_actions(self, symbol: str) -> pd.DataFrame:
        try:
            from vnstock import Reference
            ref = Reference()
            df = ref.company.events(symbol=symbol)
            return df
        except Exception as e:
            logger.error(f"Error fetching corporate actions for {symbol}: {e}")
            return pd.DataFrame()

    def get_financial_reports(self, symbol: str, report_type: str = "Quarterly") -> pd.DataFrame:
        try:
            from vnstock import FinancialReport
            fin = FinancialReport(symbol=symbol)
            df = fin.income_statement(period=report_type.lower())
            return df
        except Exception as e:
            logger.error(f"Error fetching financials for {symbol}: {e}")
            return pd.DataFrame()
