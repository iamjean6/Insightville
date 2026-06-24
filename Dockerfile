FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Install a simple static file server to serve the build
RUN npm install -g serve

EXPOSE 80

# Railway and other cloud providers inject a dynamic PORT environment variable.
# We must bind to 0.0.0.0 instead of localhost so external health checks can reach it.
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-80}"]