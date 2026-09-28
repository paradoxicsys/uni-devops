FROM node:22-alpine

WORKDIR /app

# install only production dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION} \
    NODE_ENV=production \
    PORT=3000

USER node
EXPOSE 3000

CMD ["node", "src/server.js"]
