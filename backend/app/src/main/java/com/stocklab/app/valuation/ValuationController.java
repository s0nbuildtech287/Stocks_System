package com.stocklab.app.valuation;

import com.stocklab.core.valuation.CapmCalculator;
import com.stocklab.core.valuation.DdmCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/valuation")
public class ValuationController {

    public record CapmRequest(BigDecimal riskFreeRate, BigDecimal beta, BigDecimal equityRiskPremium) {}
    public record DdmRequest(BigDecimal dividendD0, BigDecimal costOfEquity, BigDecimal growthRate) {}

    @PostMapping("/capm")
    public ResponseEntity<?> calculateCapm(@RequestBody CapmRequest req) {
        var result = CapmCalculator.calculate(req.riskFreeRate(), req.beta(), req.equityRiskPremium());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/ddm")
    public ResponseEntity<?> calculateDdm(@RequestBody DdmRequest req) {
        var result = DdmCalculator.calculateGordon(req.dividendD0(), req.costOfEquity(), req.growthRate());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{ticker}/defaults")
    public ResponseEntity<?> getValuationDefaults(@PathVariable String ticker) {
        return ResponseEntity.ok(Map.of(
                "ticker", ticker.toUpperCase(),
                "defaultRiskFreeRate", 0.0285, // 2.85% TPCP 10Y
                "defaultBeta", 1.15,
                "defaultErp", 0.08,           // 8% Vietnam Equity Risk Premium assumption
                "latestDividendD0", 2500,     // 2,500 VND cash dividend
                "defaultGrowthRate", 0.05     // 5% sustainable long term growth
        ));
    }
}
