FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY certs /opt/max-certificates
RUN cat /etc/ssl/certs/ca-certificates.crt > /opt/max-ca-bundle.pem \
    && for certificate in /opt/max-certificates/*.crt; do cat "$certificate" >> /opt/max-ca-bundle.pem; printf '\n' >> /opt/max-ca-bundle.pem; done
ENV NODE_EXTRA_CA_CERTS=/opt/max-ca-bundle.pem

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/i18n/*.json ./dist/i18n/

EXPOSE 3000

CMD ["node", "dist/index.js"]
