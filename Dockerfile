FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/build /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile