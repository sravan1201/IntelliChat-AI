# Multi-stage build for IntelliChat AI

# 1. Build Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 2. Build Server and assemble final image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/

# Copy built client files to server's public directory or serve directly
# Wait, the server uses Express. I need to update the server to serve the client dist folder.
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
