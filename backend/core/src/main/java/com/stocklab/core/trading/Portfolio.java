package com.stocklab.core.trading;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

public class Portfolio {

    private final String id;
    private BigDecimal cash;
    private final FeeModel feeModel;
    private final Map<String, Position> positions = new HashMap<>();

    public Portfolio(String id, BigDecimal initialCash, FeeModel feeModel) {
        this.id = id;
        this.cash = initialCash;
        this.feeModel = feeModel != null ? feeModel : FeeModel.defaultVietnamRates();
    }

    public String getId() {
        return id;
    }

    public BigDecimal getCash() {
        return cash;
    }

    public Map<String, Position> getPositions() {
        return positions;
    }

    public boolean executeBuy(String ticker, int quantity, BigDecimal price) {
        if (!LotRules.isValidLot(quantity) || price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        BigDecimal gross = price.multiply(BigDecimal.valueOf(quantity));
        BigDecimal fee = feeModel.calculateBuyCost(gross);
        BigDecimal totalCost = gross.add(fee);

        if (cash.compareTo(totalCost) < 0) {
            return false; // Insufficient cash
        }

        cash = cash.subtract(totalCost);

        positions.compute(ticker, (k, pos) -> {
            if (pos == null) {
                return new Position(ticker, quantity, 0, price);
            }
            int newTotalQty = pos.getTotalQuantity() + quantity;
            BigDecimal newTotalCost = pos.getAvgCost().multiply(BigDecimal.valueOf(pos.getTotalQuantity())).add(gross);
            BigDecimal newAvgCost = newTotalCost.divide(BigDecimal.valueOf(newTotalQty), 4, RoundingMode.HALF_UP);
            return new Position(ticker, newTotalQty, pos.getAvailableQuantity(), newAvgCost);
        });

        return true;
    }

    public boolean executeSell(String ticker, int quantity, BigDecimal price) {
        if (!LotRules.isValidLot(quantity) || price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        Position pos = positions.get(ticker);
        if (pos == null || pos.getAvailableQuantity() < quantity) {
            return false; // Cannot sell more than available (settled) shares
        }

        BigDecimal gross = price.multiply(BigDecimal.valueOf(quantity));
        BigDecimal costs = feeModel.calculateSellCost(gross);
        BigDecimal netProceeds = gross.subtract(costs);

        cash = cash.add(netProceeds);

        int remainingTotal = pos.getTotalQuantity() - quantity;
        int remainingAvailable = pos.getAvailableQuantity() - quantity;

        if (remainingTotal == 0) {
            positions.remove(ticker);
        } else {
            positions.put(ticker, new Position(ticker, remainingTotal, remainingAvailable, pos.getAvgCost()));
        }

        return true;
    }

    /**
     * Called during daily settlement job: make bought shares available for trading after T+2.
     */
    public void settlePendingShares(String ticker, int settledQty) {
        Position pos = positions.get(ticker);
        if (pos != null) {
            int newAvail = Math.min(pos.getTotalQuantity(), pos.getAvailableQuantity() + settledQty);
            positions.put(ticker, new Position(ticker, pos.getTotalQuantity(), newAvail, pos.getAvgCost()));
        }
    }

    public BigDecimal calculateNav(Map<String, BigDecimal> currentPrices) {
        BigDecimal totalMarketValue = BigDecimal.ZERO;
        for (Position pos : positions.values()) {
            BigDecimal p = currentPrices.getOrDefault(pos.getTicker(), pos.getAvgCost());
            totalMarketValue = totalMarketValue.add(p.multiply(BigDecimal.valueOf(pos.getTotalQuantity())));
        }
        return cash.add(totalMarketValue).setScale(2, RoundingMode.HALF_UP);
    }
}
