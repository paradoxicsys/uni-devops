# Build from the project root:
#   docker build -f docker/Dockerfile -t final-devops-app:dev application
# BASE_IMAGE can be overridden by the pipeline (e.g. node:16 to see the security gate fail)
ARG BASE_IMAGE=node:22-alpine

# ---------- stage 1: install production dependencies ----------
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- stage 2: minimal runtime ----------
FROM ${BASE_IMAGE} AS runtime
# patch OS packages and remove package managers that are not needed at runtime
RUN apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
           /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-* && \
    mkdir -p /data && chown node:node /data
WORKDIR /app
COPY --from=deps --chown=root:root /app/node_modules ./node_modules
COPY --chown=root:root package.json ./
COPY --chown=root:root src ./src

ARG APP_VERSION=dev
LABEL org.opencontainers.image.title="final-devops-app" \
      org.opencontainers.image.source="https://github.com/paradoxicsys/uni-devops"
ENV NODE_ENV=production APP_VERSION=${APP_VERSION} PORT=8080
# non-root user (uid 1000) that ships with the official node image
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "src/server.js"]
