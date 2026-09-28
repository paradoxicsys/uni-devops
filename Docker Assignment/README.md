# Docker Homework: Hello World Applications

Six Hello World web apps, each in its own folder with its own Dockerfile.

| Folder | Stack | Base image(s) | Container port | Host port | Image size |
|---|---|---|---|---|---|
| [`nodejs-app`](nodejs-app) | Node.js + Express | `node:24-alpine` | 3000 | 3000 | 255 MB |
| [`python-app`](python-app) | Python + Flask | `python:3.12-slim` | 5000 | 5001 | 235 MB |
| [`java-app`](java-app) | Java 21 (built-in `HttpServer`) | `eclipse-temurin:21-jdk-alpine` → `21-jre-alpine` | 8080 | 8090 | 286 MB |
| [`Apache-app`](Apache-app) | Apache HTTP Server | `httpd:2.4` | 80 | 8082 | 205 MB |
| [`React-app`](React-app) | React 19 + Vite | `node:24-alpine` → `nginx:alpine` | 80 | 8083 | 93 MB |
| [`nginx-app`](nginx-app) | Nginx | `nginx:alpine` | 80 | 8081 | 93 MB |

Environment: macOS (Apple Silicon), Docker Desktop 4.61.0, Docker Engine 29.2.1.

## Build and run

```bash
cd "Docker Assignment"
docker build -t nodejs-app ./nodejs-app && docker run -d --name nodejs-app -p 3000:3000 nodejs-app
docker build -t python-app ./python-app && docker run -d --name python-app -p 5001:5000 python-app
docker build -t java-app   ./java-app   && docker run -d --name java-app   -p 8090:8080 java-app
docker build -t apache-app ./Apache-app && docker run -d --name apache-app -p 8082:80   apache-app
docker build -t react-app  ./React-app  && docker run -d --name react-app  -p 8083:80   react-app
docker build -t nginx-app  ./nginx-app  && docker run -d --name nginx-app  -p 8081:80   nginx-app

docker ps
docker rm -f nodejs-app python-app java-app apache-app react-app nginx-app   # cleanup
```

Python is mapped to host port 5001 because macOS AirPlay already uses 5000.

## Output

### Node.js: http://localhost:3000
![Node.js app](screenshots/nodejs-app.png)

### Python: http://localhost:5001
![Python app](screenshots/python-app.png)

### Java: http://localhost:8090
![Java app](screenshots/java-app.png)

### Apache: http://localhost:8082
![Apache app](screenshots/apache-app.png)

### React: http://localhost:8083
![React app](screenshots/react-app.png)

### Nginx: http://localhost:8081
![Nginx app](screenshots/nginx-app.png)
