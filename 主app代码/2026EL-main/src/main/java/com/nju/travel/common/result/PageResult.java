package com.nju.travel.common.result;

import java.util.List;

public record PageResult<T>(Long total, Integer page, Integer size, List<T> list) {
}
