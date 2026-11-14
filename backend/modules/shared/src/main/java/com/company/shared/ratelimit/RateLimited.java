package com.company.shared.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {
    int capacity() default 20;

    int refillTokens() default 20;

    long refillDuration() default 1;

    TimeUnit unit() default TimeUnit.MINUTES;
}