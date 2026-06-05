package com.nju.travel.module.meituan;

import com.nju.travel.integration.meituan.MeituanClient;
import com.nju.travel.integration.meituan.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeituanService {

    private final MeituanClient meituanClient;

    public MeituanService(MeituanClient meituanClient) {
        this.meituanClient = meituanClient;
    }

    public List<PoiItem> searchNearby(Double lat, Double lng, String keyword, String category) {
        PoiSearchRequest request = new PoiSearchRequest(keyword, lat, lng, 3000, 1, 20, category);
        return meituanClient.searchPoi(request);
    }

    public PoiDetail getDetail(String storeId) {
        return meituanClient.getPoiDetail(storeId);
    }

    public List<DealItem> searchDeals(Double lat, Double lng, String category) {
        DealSearchRequest request = new DealSearchRequest(lat, lng, 3000, 1, 20, category);
        return meituanClient.searchDeals(request);
    }
}
