# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Prepare the Node.js backend
FROM node:20-alpine AS backend-build

WORKDIR /app/Backend

COPY Backend/package*.json ./
RUN npm install --production

COPY Backend/ .

# Stage 3: Final image — nginx + Node.js managed by supervisord
FROM nginx:alpine

# Install Node.js and supervisord
RUN apk add --no-cache nodejs npm supervisor

# Copy built frontend assets
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend source
COPY --from=backend-build /app/Backend /app/Backend

# Copy supervisord config
COPY supervisord.conf /etc/supervisord.conf

# Expose port 80 (nginx)
EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
