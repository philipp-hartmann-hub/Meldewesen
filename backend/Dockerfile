# Debian statt Alpine: Prisma-Engine benötigt kompatible OpenSSL-Bibliotheken (kein libssl.so.1.1-Fehler unter musl).
FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

EXPOSE 3001
# Kein prisma/migrations im Repo → Schema mit db push anwenden, dann Seed, dann Start
CMD ["sh", "-c", "npm run db:push && node seed.js && npm start"]
