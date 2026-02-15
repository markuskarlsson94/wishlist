FROM node:24 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

FROM base AS development
COPY . .
RUN npm install -g nodemon
EXPOSE 3000
CMD ["npm", "run", "devStart"]

FROM base AS production
COPY . .
CMD ["npm", "run", "start"]