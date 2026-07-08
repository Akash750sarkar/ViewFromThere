FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./

COPY src ./src

RUN npm run build

FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]