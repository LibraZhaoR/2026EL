package com.nju.travel.common.annotation;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    /** Max requests allowed in the time window. Default 60. */
    int maxRequests() default 60;

    /** Time window duration. Default 1 minute. */
    int duration() default 1;

    /** Time unit. Default MINUTES. */
    TimeUnit unit() default TimeUnit.MINUTES;

    /** Key prefix for this rate limit bucket. If empty, uses IP. */
    String key() default "";

    /** Message returned when rate limit exceeded. */
    String message() default "请求过于频繁，请稍后再试";
}
