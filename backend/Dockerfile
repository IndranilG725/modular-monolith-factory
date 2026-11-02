# syntax=docker/dockerfile:1.7
# ==============================================================================
# Stage 1: Build & Extract Spring Boot Layers
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# 1. Copy POM files (Note the trailing slashes '/')
COPY pom.xml .
COPY modules/shared/pom.xml modules/shared/
COPY modules/auth/pom.xml modules/auth/
COPY modules/m1/pom.xml modules/m1/
COPY modules/m2/pom.xml modules/m2/
COPY modules/myapp_server/pom.xml modules/myapp_server/

# 2. Copy source code
COPY modules/shared/src modules/shared/src
COPY modules/auth/src modules/auth/src
COPY modules/m1/src modules/m1/src
COPY modules/m2/src modules/m2/src
COPY modules/myapp_server/src modules/myapp_server/src  

# 3. Build using BuildKit cache mount
RUN --mount=type=cache,target=/root/.m2 \
  mvn clean package -DskipTests -B

# 4. Extract Spring Boot layers directly into /build/extracted
RUN java -Djarmode=tools -jar modules/myapp_server/target/*.jar extract --layers --application-filename app.jar --destination /build/extracted

# ==============================================================================
# Stage 2: Production JRE Runtime
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create unprivileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy layers from /build/extracted/
COPY --chown=appuser:appgroup --from=builder /build/extracted/dependencies/ ./
COPY --chown=appuser:appgroup --from=builder /build/extracted/spring-boot-loader/ ./
COPY --chown=appuser:appgroup --from=builder /build/extracted/snapshot-dependencies/ ./
COPY --chown=appuser:appgroup --from=builder /build/extracted/application/ ./

USER appuser

EXPOSE 8081

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

HEALTHCHECK --interval=20s --timeout=5s --retries=3 --start-period=30s \
  CMD wget -qO- http://localhost:8081/actuator/health | grep UP || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]