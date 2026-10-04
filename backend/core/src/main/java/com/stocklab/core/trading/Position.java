package com.stocklab.core.trading;

import java.math.BigDecimal;

public class Position {
    private final String ticker;
    private final int totalQuantity;
    private final int availableQuantity;
    private final BigDecimal avgCost;

    public Position(String ticker, int totalQuantity, int availableQuantity, BigDecimal avgCost) {
        this.ticker = ticker;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
        this.avgCost = avgCost;
    }

    public String getTicker() {
        return ticker;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public BigDecimal getAvgCost() {
        return avgCost;
    }
}
