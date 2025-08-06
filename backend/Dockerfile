# Use official Node.js LTS image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "start:dev"]
