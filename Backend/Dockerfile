# DEPRECATED: This Dockerfile is no longer used in production.
# The backend is now built and run as part of the root Dockerfile,
# which uses supervisord to manage both nginx and Node.js in a single container.
# This file is kept for reference only.

# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Force port 5000 for internal networking
ENV PORT=80

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 80

# Set environment variables for production
ENV NODE_ENV=production

# Define the command to run the app
CMD ["node", "index.js"]
