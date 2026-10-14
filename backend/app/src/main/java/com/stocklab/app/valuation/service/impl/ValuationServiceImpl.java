package com.stocklab.app.valuation.service.impl;

import com.stocklab.app.valuation.dto.CapmRequest;
import com.stocklab.app.valuation.dto.DdmRequest;
import com.stocklab.app.valuation.service.ValuationService;
import com.stocklab.core.valuation.CapmCalculator;
import com.stocklab.core.valuation.DdmCalculator;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ValuationServiceImpl implements ValuationService {

    @Override
    public Object calculateCapm(CapmRequest req) {
        return CapmCalculator.calculate(req.riskFreeRate(), req.beta(), req.equityRiskPremium());
    }

    @Override
    public Object calculateDdm(DdmRequest req) {
        return DdmCalculator.calculateGordon(req.dividendD0(), req.costOfEquity(), req.growthRate());
    }

    @Override
    public Map<String, Object> getValuationDefaults(String ticker) {
        return Map.of(
                "ticker", ticker.toUpperCase(),
                "defaultRiskFreeRate", 0.0285,
                "defaultBeta", 1.15,
                "defaultErp", 0.08,
                "latestDividendD0", 2500,
                "defaultGrowthRate", 0.05
        );
    }
}
