# Stage 1: Generate the production build for frontend
FROM node:22.10.0-bookworm-slim AS build

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Copy production buiid over and install serve only to reduce final image size
FROM node:22.10.0-bookworm-slim

RUN npm i -g serve

# use non-root user to run app
USER node

WORKDIR /app

COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]
