package com.stocklab.core.metrics;

import org.apache.commons.math3.stat.regression.SimpleRegression;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class BetaCalculator {

    public record ReturnPair(double marketReturn, double stockReturn) {}

    /**
     * Compute Beta using OLS regression: stock_return = alpha + beta * market_return
     * Requires at least minObservations (e.g., 30 data points).
     */
    public static BigDecimal calculateBeta(List<ReturnPair> returns, int minObservations) {
        if (returns == null || returns.size() < minObservations) {
            return null;
        }

        SimpleRegression regression = new SimpleRegression(true);
        for (ReturnPair pair : returns) {
            regression.addData(pair.marketReturn(), pair.stockReturn());
        }

        if (regression.getN() < minObservations) {
            return null;
        }

        double slope = regression.getSlope();
        if (Double.isNaN(slope) || Double.isInfinite(slope)) {
            return null;
        }

        return BigDecimal.valueOf(slope).setScale(4, RoundingMode.HALF_UP);
    }
}
