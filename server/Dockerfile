FROM oven/bun:1

WORKDIR /app

COPY server/package.json server/bun.lockb* ./server/
RUN cd server && bun install --production

COPY server ./server
COPY shared ./shared

WORKDIR /app/server

EXPOSE 8000
CMD ["bun", "run", "src/index.ts"]
