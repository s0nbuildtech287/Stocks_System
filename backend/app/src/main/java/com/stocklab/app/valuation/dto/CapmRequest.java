package com.stocklab.app.valuation.dto;

import java.math.BigDecimal;

public record CapmRequest(
        BigDecimal riskFreeRate,
        BigDecimal beta,
        BigDecimal equityRiskPremium
) {}
