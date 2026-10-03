# ---- Stage 1: install production dependencies ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ---- Stage 2: lean runtime image ----
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json server.js ./
# Run as the non-root "node" user that ships with the image
USER node
EXPOSE 3000
CMD ["node", "server.js"]
