package com.nju.travel.common.result;

public record ApiResult<T>(Integer code, String msg, T data) {

    public static <T> ApiResult<T> success(T data) {
        return new ApiResult<>(200, "请求成功", data);
    }

    public static <T> ApiResult<T> fail(Integer code, String msg) {
        return new ApiResult<>(code, msg, null);
    }
}
