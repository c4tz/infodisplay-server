FROM node:24-alpine

RUN apk add --no-cache tzdata

USER node

WORKDIR /app

COPY --chown=node:node package*.json tsconfig.json config.yml .
COPY --chown=node:node assets ./assets
COPY --chown=node:node src ./src
COPY --chown=node:node templates ./templates
COPY --chown=node:node translations ./translations

RUN npm install && npm run build

CMD ["dist/app.js"]
