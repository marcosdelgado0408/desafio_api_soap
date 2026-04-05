FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/client/package.json apps/client/tsconfig.json apps/client/vite.config.ts ./apps/client/
RUN npm ci --workspace apps/client --include-workspace-root
COPY apps/client ./apps/client
ENV VITE_PROXY_TARGET=http://server:3001
EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "apps/client", "--", "--host", "0.0.0.0", "--port", "3000"]
