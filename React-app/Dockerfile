# ---- Stage 1: build the React app with Node ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Vite outputs static HTML/JS/CSS into /app/dist
RUN npm run build

# ---- Stage 2: serve the static build with nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
