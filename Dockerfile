# Stage 1: Generate the production build for frontend
FROM node:22.10.0-bookworm-slim AS build

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Copy production build onto nginx (stable recommended for production, alpine to reduce image size)
FROM nginx:stable-alpine-perl

COPY --from=build /app/dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/

RUN chown -R nginx:nginx /usr/share/nginx/html/

RUN chmod -R 755 /usr/share/nginx/html/

EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]