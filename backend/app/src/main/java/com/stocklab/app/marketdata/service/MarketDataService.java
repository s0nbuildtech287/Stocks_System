package com.stocklab.app.marketdata.service;

import com.stocklab.app.marketdata.dto.DailyPriceResponse;
import com.stocklab.app.marketdata.dto.SymbolResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface MarketDataService {
    List<SymbolResponse> getAllSymbols(String exchange, String query);
    SymbolResponse getSymbolDetail(String ticker);
    List<DailyPriceResponse> getHistoricalPrices(String ticker, LocalDate from, LocalDate to, boolean adjusted);
    Map<String, Object> getSymbolMetrics(String ticker);
    Map<String, Object> getMarketOverview();
    Map<String, Object> getTopMovers();
}
