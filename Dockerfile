FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite reads VITE_* at build time, not runtime.
ARG VITE_API_BASE_URL=https://adaptive-video-streaming-backend.fly.dev
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM pierrezemb/gostatic
COPY --from=build /app/dist /srv/http
CMD ["-port","8080","-https-promote", "-enable-logging", "-fallback", "index.html"]
