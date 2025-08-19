# Use official Node.js LTS image
FROM node:lts-alpine

# Install timezone data for Alpine Linux
RUN apk add --no-cache tzdata

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S palpalette -u 1001

# Change ownership of the app directory
RUN chown -R palpalette:nodejs /app
USER palpalette

# Expose backend ports
EXPOSE 3000 3001

# Start the backend in production mode
CMD ["npm", "run", "start:prod"]
