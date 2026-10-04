package com.stocklab.core.metrics;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class RatioCalculator {

    public static BigDecimal calculatePe(BigDecimal price, BigDecimal epsTtm) {
        if (price == null || epsTtm == null || epsTtm.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return price.divide(epsTtm, 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculatePb(BigDecimal price, BigDecimal bvps) {
        if (price == null || bvps == null || bvps.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return price.divide(bvps, 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateEps(BigDecimal netProfitTtm, Long sharesOutstanding) {
        if (netProfitTtm == null || sharesOutstanding == null || sharesOutstanding <= 0) {
            return null;
        }
        return netProfitTtm.divide(BigDecimal.valueOf(sharesOutstanding), 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateBvps(BigDecimal equity, Long sharesOutstanding) {
        if (equity == null || sharesOutstanding == null || sharesOutstanding <= 0) {
            return null;
        }
        return equity.divide(BigDecimal.valueOf(sharesOutstanding), 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateRoe(BigDecimal netProfitTtm, BigDecimal avgEquity) {
        if (netProfitTtm == null || avgEquity == null || avgEquity.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return netProfitTtm.divide(avgEquity, 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateRoa(BigDecimal netProfitTtm, BigDecimal avgTotalAssets) {
        if (netProfitTtm == null || avgTotalAssets == null || avgTotalAssets.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return netProfitTtm.divide(avgTotalAssets, 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateDebtToEquity(BigDecimal totalLiabilities, BigDecimal equity) {
        if (totalLiabilities == null || equity == null || equity.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return totalLiabilities.divide(equity, 4, RoundingMode.HALF_UP);
    }
}
