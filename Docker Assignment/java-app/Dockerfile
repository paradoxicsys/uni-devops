# ---- Stage 1: compile with the full JDK ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
COPY Main.java .
RUN javac Main.java

# ---- Stage 2: run on the smaller JRE ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /src/*.class ./
EXPOSE 8080
CMD ["java", "Main"]
