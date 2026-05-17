FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx playwright install --with-deps chromium

COPY . .

RUN mkdir -p runtime_storage

EXPOSE 3000
EXPOSE 8080

CMD ["node", "src/index.js"]