FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/server/package.json apps/server/tsconfig.json ./apps/server/
RUN npm ci --workspace apps/server --include-workspace-root

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json /app/tsconfig.base.json ./
COPY --from=deps /app/apps/server/package.json /app/apps/server/tsconfig.json ./apps/server/
COPY apps/server ./apps/server
RUN npm run build -w apps/server

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/apps/server ./apps/server
EXPOSE 3001
CMD ["npm", "run", "start", "-w", "apps/server"]
