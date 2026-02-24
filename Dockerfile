FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
