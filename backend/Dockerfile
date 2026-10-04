FROM gradle:8.8-jdk21-alpine AS builder
WORKDIR /workspace
COPY . .
RUN gradle :app:bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
