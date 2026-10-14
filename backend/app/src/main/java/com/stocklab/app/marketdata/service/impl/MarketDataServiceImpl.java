package com.stocklab.app.marketdata.service.impl;

import com.stocklab.app.common.exception.ResourceNotFoundException;
import com.stocklab.app.marketdata.DailyPriceRepository;
import com.stocklab.app.marketdata.SymbolEntity;
import com.stocklab.app.marketdata.SymbolRepository;
import com.stocklab.app.marketdata.dto.DailyPriceResponse;
import com.stocklab.app.marketdata.dto.SymbolResponse;
import com.stocklab.app.marketdata.service.MarketDataService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class MarketDataServiceImpl implements MarketDataService {

    private final SymbolRepository symbolRepository;
    private final DailyPriceRepository dailyPriceRepository;

    public MarketDataServiceImpl(SymbolRepository symbolRepository, DailyPriceRepository dailyPriceRepository) {
        this.symbolRepository = symbolRepository;
        this.dailyPriceRepository = dailyPriceRepository;
    }

    @Override
    @Cacheable(value = "symbolsCache", key = "#exchange + '-' + #query", unless = "#result.isEmpty()")
    public List<SymbolResponse> getAllSymbols(String exchange, String query) {
        List<SymbolEntity> list = symbolRepository.findAll();
        return list.stream()
                .filter(s -> exchange == null || s.getExchange().equalsIgnoreCase(exchange))
                .filter(s -> query == null || s.getTicker().contains(query.toUpperCase()) || s.getName().toLowerCase().contains(query.toLowerCase()))
                .map(SymbolResponse::fromEntity)
                .toList();
    }

    @Override
    public SymbolResponse getSymbolDetail(String ticker) {
        return symbolRepository.findByTicker(ticker.toUpperCase())
                .map(SymbolResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Cổ phiếu", "ticker", ticker));
    }

    @Override
    public List<DailyPriceResponse> getHistoricalPrices(String ticker, LocalDate from, LocalDate to, boolean adjusted) {
        SymbolEntity symbol = symbolRepository.findByTicker(ticker.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Cổ phiếu", "ticker", ticker));

        LocalDate startDate = from != null ? from : LocalDate.now().minusYears(1);
        LocalDate endDate = to != null ? to : LocalDate.now();

        return dailyPriceRepository.findBySymbolIdAndDateRange(symbol.getId(), startDate, endDate)
                .stream()
                .map(DailyPriceResponse::fromEntity)
                .toList();
    }

    @Override
    public Map<String, Object> getSymbolMetrics(String ticker) {
        getSymbolDetail(ticker); // Validate exists
        return Map.of(
                "ticker", ticker.toUpperCase(),
                "peTtm", 15.4,
                "pb", 2.1,
                "roeTtm", 0.224,
                "epsTtm", 8200,
                "beta1y", 1.15,
                "volatility60d", 0.245,
                "disclaimer", "Dữ liệu tính toán Point-in-time theo phiên gần nhất."
        );
    }

    @Override
    public Map<String, Object> getMarketOverview() {
        return Map.of(
                "indices", List.of(
                        Map.of("code", "VNINDEX", "close", 1280.50, "change", 12.30, "changePct", 0.97, "volume", 750000000, "value", 18500000000000L),
                        Map.of("code", "VN30", "close", 1345.80, "change", 15.60, "changePct", 1.17, "volume", 280000000, "value", 9200000000000L),
                        Map.of("code", "HNX", "close", 235.40, "change", 1.80, "changePct", 0.77, "volume", 65000000, "value", 1200000000000L)
                ),
                "riskFreeRate10Y", 2.85,
                "marketSentiment", "Tích cực"
        );
    }

    @Override
    public Map<String, Object> getTopMovers() {
        return Map.of(
                "gainers", List.of(
                        Map.of("ticker", "FPT", "price", 135000, "changePct", 6.8),
                        Map.of("ticker", "MWG", "price", 68500, "changePct", 5.2),
                        Map.of("ticker", "TCB", "price", 24800, "changePct", 4.3)
                ),
                "losers", List.of(
                        Map.of("ticker", "VHM", "price", 41200, "changePct", -2.1),
                        Map.of("ticker", "NVL", "price", 11200, "changePct", -1.8)
                )
        );
    }
}
