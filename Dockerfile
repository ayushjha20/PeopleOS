# Build the Spring Boot application.
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy the Maven descriptor first so dependency downloads can be cached.
COPY demo/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline

COPY demo/src ./src
RUN mvn -B clean package -DskipTests

# Run the packaged application in a small Java runtime image.
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render provides PORT at runtime. This is also a sensible local default.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
