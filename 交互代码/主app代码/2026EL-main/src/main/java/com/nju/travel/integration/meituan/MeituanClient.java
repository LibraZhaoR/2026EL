package com.nju.travel.integration.meituan;

import com.nju.travel.integration.meituan.dto.*;

import java.util.List;

public interface MeituanClient {

    /**
     * Search for stores/POIs near a location.
     */
    List<PoiItem> searchPoi(PoiSearchRequest request);

    /**
     * Get store detail by store ID.
     */
    PoiDetail getPoiDetail(String storeId);

    /**
     * Search for deals/coupons near a location.
     */
    List<DealItem> searchDeals(DealSearchRequest request);
}
