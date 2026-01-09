# Vintage Audio Backend - Dockerfile

FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    openssl \
    openssl-dev

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Development image
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 4000

# For development
CMD ["npm", "run", "dev"]

# Production build
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4000

CMD ["npm", "start"]
