# BASE_IMAGE can be overridden by the pipeline (used to demo a failing security gate)
ARG BASE_IMAGE=node:22-alpine

# ---------- stage 1: install production dependencies ----------
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- stage 2: minimal runtime ----------
FROM ${BASE_IMAGE}
# patch OS packages and remove package managers that are not needed at runtime
RUN if command -v apk >/dev/null; then \
      apk upgrade --no-cache && \
      rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
             /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*; \
    fi
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

ARG APP_VERSION=dev
ENV NODE_ENV=production APP_VERSION=${APP_VERSION} PORT=8080
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
