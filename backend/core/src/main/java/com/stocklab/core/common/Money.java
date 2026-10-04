package com.stocklab.core.common;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Immutable representation of money in VND or generic financial calculations.
 */
public final class Money implements Comparable<Money> {
    public static final Money ZERO = new Money(BigDecimal.ZERO);

    private final BigDecimal amount;

    public Money(BigDecimal amount) {
        this.amount = Objects.requireNonNull(amount, "Amount cannot be null")
                .setScale(2, RoundingMode.HALF_UP);
    }

    public Money(double amount) {
        this(BigDecimal.valueOf(amount));
    }

    public Money(long amount) {
        this(BigDecimal.valueOf(amount));
    }

    public static Money of(double amount) {
        return new Money(amount);
    }

    public static Money of(BigDecimal amount) {
        return new Money(amount);
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Money plus(Money other) {
        return new Money(this.amount.add(other.amount));
    }

    public Money minus(Money other) {
        return new Money(this.amount.subtract(other.amount));
    }

    public Money multiply(BigDecimal multiplier) {
        return new Money(this.amount.multiply(multiplier));
    }

    public Money multiply(double multiplier) {
        return multiply(BigDecimal.valueOf(multiplier));
    }

    public Money divide(BigDecimal divisor, RoundingMode roundingMode) {
        return new Money(this.amount.divide(divisor, 2, roundingMode));
    }

    public boolean isPositive() {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNegative() {
        return amount.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean isZero() {
        return amount.compareTo(BigDecimal.ZERO) == 0;
    }

    @Override
    public int compareTo(Money other) {
        return this.amount.compareTo(other.amount);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money money)) return false;
        return amount.compareTo(money.amount) == 0;
    }

    @Override
    public int hashCode() {
        return amount.stripTrailingZeros().hashCode();
    }

    @Override
    public String toString() {
        return amount.toPlainString() + " VND";
    }
}
