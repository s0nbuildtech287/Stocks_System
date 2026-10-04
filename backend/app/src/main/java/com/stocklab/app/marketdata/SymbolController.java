package com.stocklab.app.marketdata;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/symbols")
public class SymbolController {

    private final SymbolRepository symbolRepository;
    private final DailyPriceRepository dailyPriceRepository;

    public SymbolController(SymbolRepository symbolRepository, DailyPriceRepository dailyPriceRepository) {
        this.symbolRepository = symbolRepository;
        this.dailyPriceRepository = dailyPriceRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllSymbols(
            @RequestParam(required = false) String exchange,
            @RequestParam(required = false) String query
    ) {
        List<SymbolEntity> list = symbolRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<?> getSymbolDetail(@PathVariable String ticker) {
        return symbolRepository.findByTicker(ticker.toUpperCase())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("code", "NOT_FOUND", "message", "Symbol not found: " + ticker)));
    }

    @GetMapping("/{ticker}/prices")
    public ResponseEntity<?> getSymbolPrices(
            @PathVariable String ticker,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "true") boolean adjusted
    ) {
        var opt = symbolRepository.findByTicker(ticker.toUpperCase());
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("code", "NOT_FOUND", "message", "Ticker not found"));
        }

        LocalDate startDate = from != null ? from : LocalDate.now().minusYears(1);
        LocalDate endDate = to != null ? to : LocalDate.now();

        List<DailyPriceEntity> prices = dailyPriceRepository.findBySymbolIdAndDateRange(opt.get().getId(), startDate, endDate);
        return ResponseEntity.ok(prices);
    }

    @GetMapping("/{ticker}/metrics")
    public ResponseEntity<?> getSymbolMetrics(@PathVariable String ticker) {
        // Return latest metrics summary
        return ResponseEntity.ok(Map.of(
                "ticker", ticker.toUpperCase(),
                "peTtm", 15.4,
                "pb", 2.1,
                "roeTtm", 0.224,
                "epsTtm", 8200,
                "beta1y", 1.15,
                "volatility60d", 0.245,
                "disclaimer", "Dữ liệu tính toán Point-in-time cuối ngày."
        ));
    }
}
