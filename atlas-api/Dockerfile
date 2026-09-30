# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app/atlas-api

# Copy Gradle wrapper and build files first (better layer caching)
COPY atlas-api/gradlew .
COPY atlas-api/gradle/ gradle/
COPY atlas-api/build.gradle atlas-api/settings.gradle ./

# Fix Windows line endings and permissions
RUN apt-get update && apt-get install -y dos2unix && dos2unix gradlew && chmod +x gradlew

# Copy proto files to /app/proto so relative path '../proto' works from /app/atlas-api
COPY proto/ /app/proto/

# Download dependencies before copying source (cached unless build files change)
RUN ./gradlew dependencies --no-daemon --quiet

# Copy source and build
COPY atlas-api/src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Install git for cloning repositories
RUN apk add --no-cache git

# Run as root to avoid docker volume permission issues
# RUN addgroup -S atlas && adduser -S atlas -G atlas
# USER atlas

COPY --from=builder /app/atlas-api/build/libs/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
