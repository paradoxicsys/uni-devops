# Docker Multi-Stage Build Homework

| | |
|---|---|
| **Name** | `<YOUR NAME>` |
| **Enrollment number** | `<YOUR ENROLLMENT NUMBER>` |

Environment: macOS (Apple Silicon), Docker Desktop 4.61.0, Docker Engine 29.2.1.

---

## Task 1: Run the multi-stage Dockerfile

Source: [`Nency-Ravaliya/devops-heros`](https://github.com/Nency-Ravaliya/devops-heros), folder `session6-7-docker/multi-stage-dockerfile`. A copy is in [`task1-multistage-app/`](task1-multistage-app).

### How the Dockerfile works

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/server.js ./
EXPOSE 3000
CMD ["npm", "start"]
```

- **`builder` stage:** installs all dependencies and copies the full source.
- **`production` stage:** starts again from a clean base image, installs only production dependencies (`--omit=dev`), and copies only `server.js` from the builder (`COPY --from=builder`). Nothing else from the builder stage ends up in the final image.

### Commands

```bash
# 1. Clone the repository
git clone https://github.com/Nency-Ravaliya/devops-heros.git
cd devops-heros/session6-7-docker/multi-stage-dockerfile

# 2. Build the image (both stages run; only the last stage becomes the image)
docker build -t multistage-app .

# 3. Run a container: host port 8080 -> container port 3000 (the app listens on 3000)
docker run -d --name multistage-app -p 8080:3000 multistage-app

# 4. Access the app
curl http://localhost:8080

# 5. Verify the running container
docker ps
```

### Output: application running

```
$ curl http://localhost:8080
<h1>Hello World from Docker Multi-Stage Build!</h1>

$ docker logs multistage-app
> docker-hello-world@1.0.0 start
> node server.js

Server running on port 3000
```

![App in browser on port 8080](screenshots/task1-app-browser.png)

### Output: `docker ps` with the container on port 8080

```
$ docker ps --filter name=multistage-app
CONTAINER ID   IMAGE            COMMAND                  CREATED         STATUS         PORTS                                         NAMES
031e40c88666   multistage-app   "docker-entrypoint.s…"   3 seconds ago   Up 3 seconds   0.0.0.0:8080->3000/tcp, [::]:8080->3000/tcp   multistage-app
```

`0.0.0.0:8080->3000/tcp` confirms that the app is reachable on port **8080** of the host.

![docker ps output](screenshots/task1-docker-ps.png)

---

## Task 3: Deploy 3 different types of applications

All three apps are in [`task3-apps/`](task3-apps), and each one uses a multi-stage Dockerfile.

| App | Folder | Stage 1 (build) | Stage 2 (runtime) | Container port | Host port | Image size |
|---|---|---|---|---|---|---|
| Node.js (Express) | [`nodejs-app`](task3-apps/nodejs-app) | `node:24-alpine`, `npm install --omit=dev` | `node:24-alpine` + copied `node_modules`, runs as non-root `node` user | 3000 | 3001 | 243 MB |
| Python (Flask) | [`python-app`](task3-apps/python-app) | `python:3.12-slim`, pip install into a venv | `python:3.12-slim` + copied `/opt/venv` | 5000 | 5002 | 239 MB |
| Java 21 | [`java-app`](task3-apps/java-app) | `eclipse-temurin:21-jdk-alpine`, `javac` | `eclipse-temurin:21-jre-alpine` + `.class` file | 8080 | 8091 | 286 MB |

### Commands

```bash
cd Docker-MultiStage-Assignment/task3-apps

docker build -t ms-nodejs-app ./nodejs-app && docker run -d --name ms-nodejs-app -p 3001:3000 ms-nodejs-app
docker build -t ms-python-app ./python-app && docker run -d --name ms-python-app -p 5002:5000 ms-python-app
docker build -t ms-java-app   ./java-app   && docker run -d --name ms-java-app   -p 8091:8080 ms-java-app
```

### Output

```
$ curl http://localhost:3001
<h1>Hello World from Node.js!</h1><p>Deployed with a Docker multi-stage build.</p>
$ curl http://localhost:5002
<h1>Hello World from Python!</h1><p>Deployed with a Docker multi-stage build.</p>
$ curl http://localhost:8091
<h1>Hello World from Java!</h1><p>Deployed with a Docker multi-stage build.</p>

$ docker ps
NAMES            IMAGE            STATUS              PORTS
ms-java-app      ms-java-app      Up 4 seconds        0.0.0.0:8091->8080/tcp
ms-python-app    ms-python-app    Up 7 seconds        0.0.0.0:5002->5000/tcp
ms-nodejs-app    ms-nodejs-app    Up 18 seconds       0.0.0.0:3001->3000/tcp
multistage-app   multistage-app   Up About a minute   0.0.0.0:8080->3000/tcp

$ docker exec ms-nodejs-app whoami
node
```

![Task 3 docker ps](screenshots/task3-docker-ps.png)

| Node.js | Python | Java |
|---|---|---|
| ![Node.js](screenshots/task3-nodejs-browser.png) | ![Python](screenshots/task3-python-browser.png) | ![Java](screenshots/task3-java-browser.png) |

---

## Key learnings

- **Multi-stage build:** a Dockerfile can contain several `FROM` stages. Only the **last** stage becomes the final image. Earlier stages are only for building, and `COPY --from=<stage>` brings across just what's needed.
- **Why use it:** smaller images, fewer packages to attack (no compilers or build tools in production), and a clean split between building and running.
- **Port mapping:** `-p HOST:CONTAINER` doesn't have to use the same number on both sides. Task 1 maps host port 8080 to the app's port 3000 without changing any code.
- **Non-root user:** the Node.js runtime stage uses `USER node`, so the process isn't running as root inside the container.

## Cleanup

```bash
docker rm -f multistage-app ms-nodejs-app ms-python-app ms-java-app
```
