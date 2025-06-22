FROM node:24-alpine3.21

ARG PORT=3000
ARG LOG_LEVEL=info
ARG MONGODB_CONNECTION_STRING
ARG MS_GRAPH_BASE_URL=https://graph.microsoft.com/v1.0
ARG TENANT_ID
ARG CLIENT_ID
ARG CLIENT_SECRET

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080
 
CMD [ "npx", "tsx", "server.ts" ]
