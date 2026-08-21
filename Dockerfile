# Ravshan Rivoj Market — multi-stage build
# Stage 1: frontend build (Vite + React)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime (Express server, prod deps only)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server

EXPOSE 8000
ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "server/server.cjs"]
