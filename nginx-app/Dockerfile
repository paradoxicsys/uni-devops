# Small Alpine-based nginx image
FROM nginx:alpine

# nginx serves static files from this folder
COPY index.html /usr/share/nginx/html/index.html

# Document the port the container listens on
EXPOSE 80

# No CMD needed: the base image already runs "nginx -g 'daemon off;'"
