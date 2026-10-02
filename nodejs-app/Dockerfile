FROM node:24-alpine

WORKDIR /app

# Copy only the dependency manifests first so this layer is cached
# until package.json changes
COPY package*.json ./
RUN npm install

# Then copy the application code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
