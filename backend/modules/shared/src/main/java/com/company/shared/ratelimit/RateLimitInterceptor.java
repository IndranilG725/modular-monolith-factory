package com.company.shared.ratelimit;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.lettuce.core.RedisException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private final RateLimitService rateLimitService;

    public RateLimitInterceptor(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RateLimited rateLimited = handlerMethod.getMethodAnnotation(RateLimited.class);
        if (rateLimited == null) {
            return true; // No rate limit on this endpoint
        }

        String clientIp = extractClientIp(request);
        String endpointKey = handlerMethod.getBeanType().getSimpleName() + ":" + handlerMethod.getMethod().getName();
        String bucketKey = clientIp + ":" + endpointKey;
        ConsumptionProbe probe = null;

        Bucket bucket = rateLimitService.resolveBucket(bucketKey, rateLimited);
        try {
            probe = bucket.tryConsumeAndReturnRemaining(1);
        } catch (RedisException e) {
            logger.warn("Rate limiting Redis connection warning: ", e.getMessage());
            return true;
        }

        if (probe.isConsumed()) {
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        } else {
            long waitForRefillSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
            response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefillSeconds));
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
                    "Rate limit exceeded. Try again in " + waitForRefillSeconds + " seconds.");
            return false;
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}