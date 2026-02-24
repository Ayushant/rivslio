FROM node:24-alpine

# openssl required by Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and generate Prisma client
COPY . .
RUN npx prisma generate

# Build NestJS
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
