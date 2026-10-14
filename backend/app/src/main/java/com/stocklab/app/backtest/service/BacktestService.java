package com.stocklab.app.backtest.service;

import com.stocklab.app.backtest.BacktestController.BacktestDefinition;

import java.util.Map;

public interface BacktestService {
    Map<String, Object> submitBacktest(BacktestDefinition def);
    Map<String, Object> getBacktestResult(Long id);
}
