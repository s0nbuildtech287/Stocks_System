package com.stocklab.app.valuation.service;

import com.stocklab.app.valuation.dto.CapmRequest;
import com.stocklab.app.valuation.dto.DdmRequest;

import java.util.Map;

public interface ValuationService {
    Object calculateCapm(CapmRequest req);
    Object calculateDdm(DdmRequest req);
    Map<String, Object> getValuationDefaults(String ticker);
}
