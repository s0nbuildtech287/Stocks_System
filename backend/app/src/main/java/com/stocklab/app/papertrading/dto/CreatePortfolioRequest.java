package com.stocklab.app.papertrading.dto;

import java.math.BigDecimal;

public record CreatePortfolioRequest(
        String name,
        BigDecimal initialCash
) {}
