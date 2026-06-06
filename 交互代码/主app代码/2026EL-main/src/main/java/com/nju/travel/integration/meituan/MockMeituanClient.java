package com.nju.travel.integration.meituan;

import com.nju.travel.integration.meituan.dto.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "travel.meituan.enabled", havingValue = "false", matchIfMissing = true)
public class MockMeituanClient implements MeituanClient {

    @Override
    public List<PoiItem> searchPoi(PoiSearchRequest request) {
        return List.of(
                new PoiItem("001", "鸭得堡老鸭粉丝汤（丰富路店）",
                        "南京市秦淮区丰富路134号", 32.035, 118.78,
                        "美食", "025-52201234", 4.6, 35,
                        null, "06:30-21:00", 280),
                new PoiItem("002", "先锋书店（五台山店）",
                        "南京市鼓楼区广州路173号", 32.053, 118.77,
                        "书店", "025-83711455", 4.8, 40,
                        null, "10:00-22:00", 450),
                new PoiItem("003", "南京博物院",
                        "南京市玄武区中山东路321号", 32.042, 118.82,
                        "展览", null, 4.7, 0,
                        null, "09:00-17:00", 1200)
        );
    }

    @Override
    public PoiDetail getPoiDetail(String storeId) {
        return new PoiDetail(storeId, "鸭得堡老鸭粉丝汤",
                "南京市秦淮区丰富路134号", 32.035, 118.78,
                "美食", "025-52201234", 4.6, 35,
                List.of(), "06:30-21:00",
                "南京老字号鸭血粉丝汤，汤底浓郁，配料丰富。",
                List.of("老字号", "鸭血粉丝", "秦淮小吃", "人均35"),
                2834);
    }

    @Override
    public List<DealItem> searchDeals(DealSearchRequest request) {
        return List.of(
                new DealItem("d001", "鸭血粉丝汤单人套餐", "鸭得堡",
                        28.8, 38.0, null, 15203, "美食"),
                new DealItem("d002", "先锋书店咖啡+甜点", "先锋书店",
                        35.0, 52.0, null, 8600, "饮品")
        );
    }
}
