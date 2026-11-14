package com.company.shared.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
public class RateLimitService {

    private final ProxyManager<String> proxyManager;

    public RateLimitService(ProxyManager<String> proxyManager) {
        this.proxyManager = proxyManager;
    }

    public Bucket resolveBucket(String key, RateLimited rateLimited) {
        Supplier<BucketConfiguration> configSupplier = () -> createBucketConfig(rateLimited);

        // Fetches the distributed bucket proxy backed by Redis
        return proxyManager.builder().build(key, configSupplier);
    }

    private BucketConfiguration createBucketConfig(RateLimited config) {
        Duration refillDuration = Duration.of(config.refillDuration(), config.unit().toChronoUnit());

        Bandwidth limit = Bandwidth.builder()
                .capacity(config.capacity())
                .refillGreedy(config.refillTokens(), refillDuration)
                .build();

        return BucketConfiguration.builder()
                .addLimit(limit)
                .build();
    }
}
