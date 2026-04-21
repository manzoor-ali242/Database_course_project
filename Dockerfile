# Stage 1: Build the React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build frontend
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built frontend from stage 1
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Serve static files from Express in production
COPY docker-entrypoint.js ./

EXPOSE 3001

CMD ["node", "docker-entrypoint.js"]
