package com.stocklab.app.valuation.dto;

import java.math.BigDecimal;

public record DdmRequest(
        BigDecimal dividendD0,
        BigDecimal costOfEquity,
        BigDecimal growthRate
) {}
