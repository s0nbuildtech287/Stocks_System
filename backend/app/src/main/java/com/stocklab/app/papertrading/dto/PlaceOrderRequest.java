package com.stocklab.app.papertrading.dto;

import java.math.BigDecimal;

public record PlaceOrderRequest(
        String ticker,
        String side,          // BUY | SELL
        String orderType,     // MARKET | LIMIT
        int quantity,         // Multiple of 100
        BigDecimal limitPrice,
        String thesis         // Reason for investment
) {}
