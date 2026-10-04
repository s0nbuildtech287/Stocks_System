package com.stocklab.core.trading;

public class LotRules {

    public static final int DEFAULT_LOT_SIZE = 100;

    public static boolean isValidLot(int quantity) {
        return quantity > 0 && (quantity % DEFAULT_LOT_SIZE == 0);
    }

    public static int roundDownToLot(int quantity) {
        if (quantity < DEFAULT_LOT_SIZE) return 0;
        return (quantity / DEFAULT_LOT_SIZE) * DEFAULT_LOT_SIZE;
    }
}
