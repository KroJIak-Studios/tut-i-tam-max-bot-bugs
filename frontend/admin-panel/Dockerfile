FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_FALLBACK_LOCALE=ru-ru
ENV VITE_FALLBACK_LOCALE=$VITE_FALLBACK_LOCALE

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
