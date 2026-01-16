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

# Copy shared module
COPY shared ./shared

# Copy backend
COPY backend ./backend

WORKDIR /app/backend

# Install dependencies
FROM base AS dependencies
WORKDIR /app/backend
COPY --from=base /app/shared ../shared
COPY --from=base /app/backend ./
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Development image
FROM base AS development
WORKDIR /app/backend
COPY --from=dependencies /app/backend/node_modules ./node_modules
COPY --from=dependencies /app/shared ../shared
COPY backend .

# Copy and set entrypoint script
COPY backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["docker-entrypoint.sh"]
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
