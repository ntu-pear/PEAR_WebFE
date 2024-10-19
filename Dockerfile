# Stage 1: Generate the production build for frontend
FROM node:22.10.0-bookworm-slim AS build

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

RUN npm i -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]