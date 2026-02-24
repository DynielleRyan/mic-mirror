FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install && cd client && npm install && cd ../server && npm install

COPY . .
RUN npm run build

FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --omit=dev && cd server && npm install --omit=dev

COPY --from=builder /app/server/dist ./server/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/dist/index.js"]
