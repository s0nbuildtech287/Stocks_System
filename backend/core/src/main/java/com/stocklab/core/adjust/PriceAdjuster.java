package com.stocklab.core.adjust;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

public class PriceAdjuster {

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);

    public enum ActionType {
        CASH_DIVIDEND,
        STOCK_DIVIDEND,
        BONUS,
        SPLIT,
        REVERSE_SPLIT,
        RIGHTS_ISSUE
    }

    public record CorporateAction(
            ActionType type,
            LocalDate exDate,
            BigDecimal cashPerShare,   // For CASH_DIVIDEND (VND)
            BigDecimal ratioNum,        // e.g. 10
            BigDecimal ratioDen,        // e.g. 100
            BigDecimal exercisePrice    // For RIGHTS_ISSUE (VND)
    ) {}

    public record DailyPrice(
            LocalDate tradeDate,
            BigDecimal open,
            BigDecimal high,
            BigDecimal low,
            BigDecimal close,
            long volume,
            BigDecimal value,
            BigDecimal adjFactor,
            BigDecimal adjClose
    ) {
        public DailyPrice withAdjustment(BigDecimal newAdjFactor, BigDecimal newAdjClose) {
            return new DailyPrice(
                    tradeDate, open, high, low, close, volume, value, newAdjFactor, newAdjClose
            );
        }
    }

    /**
     * Calculate single-event adjustment factor on ex-date given previous day's close.
     */
    public static BigDecimal calculateEventFactor(CorporateAction action, BigDecimal prevClose) {
        if (prevClose == null || prevClose.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ONE;
        }

        return switch (action.type()) {
            case CASH_DIVIDEND -> {
                BigDecimal cash = action.cashPerShare() != null ? action.cashPerShare() : BigDecimal.ZERO;
                if (cash.compareTo(BigDecimal.ZERO) <= 0 || cash.compareTo(prevClose) >= 0) {
                    yield BigDecimal.ONE;
                }
                yield prevClose.subtract(cash).divide(prevClose, MC);
            }
            case STOCK_DIVIDEND, BONUS, SPLIT -> {
                BigDecimal num = action.ratioNum() != null ? action.ratioNum() : BigDecimal.ZERO;
                BigDecimal den = action.ratioDen() != null && action.ratioDen().compareTo(BigDecimal.ZERO) > 0
                        ? action.ratioDen() : BigDecimal.valueOf(100);
                BigDecimal ratio = num.divide(den, MC);
                yield BigDecimal.ONE.divide(BigDecimal.ONE.add(ratio), MC);
            }
            case REVERSE_SPLIT -> {
                BigDecimal num = action.ratioNum() != null ? action.ratioNum() : BigDecimal.ONE;
                BigDecimal den = action.ratioDen() != null && action.ratioDen().compareTo(BigDecimal.ZERO) > 0
                        ? action.ratioDen() : BigDecimal.ONE;
                yield num.divide(den, MC);
            }
            case RIGHTS_ISSUE -> {
                BigDecimal num = action.ratioNum() != null ? action.ratioNum() : BigDecimal.ZERO;
                BigDecimal den = action.ratioDen() != null && action.ratioDen().compareTo(BigDecimal.ZERO) > 0
                        ? action.ratioDen() : BigDecimal.valueOf(100);
                BigDecimal ratio = num.divide(den, MC);
                BigDecimal pEx = action.exercisePrice() != null ? action.exercisePrice() : BigDecimal.ZERO;
                // Theoretical Ex-Rights Price (TERP): (prevClose + pEx * ratio) / (1 + ratio)
                BigDecimal terp = prevClose.add(pEx.multiply(ratio))
                        .divide(BigDecimal.ONE.add(ratio), MC);
                yield terp.divide(prevClose, MC);
            }
        };
    }

    /**
     * Adjust full price history in chronological order.
     * Factors are accumulated backwards from latest date to oldest date.
     */
    public static List<DailyPrice> adjustPrices(List<DailyPrice> rawPrices, List<CorporateAction> actions) {
        if (rawPrices == null || rawPrices.isEmpty()) {
            return Collections.emptyList();
        }

        // Sort prices ascending by tradeDate
        List<DailyPrice> sortedPrices = new ArrayList<>(rawPrices);
        sortedPrices.sort(Comparator.comparing(DailyPrice::tradeDate));

        if (actions == null || actions.isEmpty()) {
            return sortedPrices.stream()
                    .map(p -> p.withAdjustment(BigDecimal.ONE, p.close()))
                    .toList();
        }

        // Map actions by exDate
        Map<LocalDate, List<CorporateAction>> actionsByDate = new HashMap<>();
        for (CorporateAction action : actions) {
            actionsByDate.computeIfAbsent(action.exDate(), k -> new ArrayList<>()).add(action);
        }

        // Map date to index
        int n = sortedPrices.size();
        BigDecimal[] cumulativeFactors = new BigDecimal[n];
        Arrays.fill(cumulativeFactors, BigDecimal.ONE);

        BigDecimal currentMultiplier = BigDecimal.ONE;

        // Iterate backwards from the most recent price to the oldest
        for (int i = n - 1; i >= 0; i--) {
            DailyPrice price = sortedPrices.get(i);
            LocalDate tradeDate = price.tradeDate();

            // If there were corporate actions on this day, calculate the factor and apply to all days PRIOR to this day
            List<CorporateAction> dayActions = actionsByDate.get(tradeDate);
            if (dayActions != null && i > 0) {
                BigDecimal prevClose = sortedPrices.get(i - 1).close();
                for (CorporateAction action : dayActions) {
                    BigDecimal eventFactor = calculateEventFactor(action, prevClose);
                    currentMultiplier = currentMultiplier.multiply(eventFactor, MC);
                }
            }

            cumulativeFactors[i] = currentMultiplier;
        }

        List<DailyPrice> adjusted = new ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            DailyPrice p = sortedPrices.get(i);
            BigDecimal factor = cumulativeFactors[i];
            BigDecimal adjClose = p.close().multiply(factor).setScale(4, RoundingMode.HALF_UP);
            adjusted.add(p.withAdjustment(factor.setScale(10, RoundingMode.HALF_UP), adjClose));
        }

        return adjusted;
    }
}
