from abc import ABC, abstractmethod
import pandas as pd
from typing import List, Dict, Any

class DataProvider(ABC):

    @abstractmethod
    def get_symbols(self) -> pd.DataFrame:
        """Fetch all listed symbols from market."""
        pass

    @abstractmethod
    def get_daily_prices(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Fetch daily OHLCV prices for a symbol."""
        pass

    @abstractmethod
    def get_corporate_actions(self, symbol: str) -> pd.DataFrame:
        """Fetch dividend, bonus, and split events."""
        pass

    @abstractmethod
    def get_financial_reports(self, symbol: str, report_type: str = "Quarterly") -> pd.DataFrame:
        """Fetch financial statement reports."""
        pass
