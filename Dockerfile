FROM ubuntu:22.10

RUN apt-get update 
RUN apt-get install -y mysql-client
# RUN rm -rf /var/lib/apt

FROM node:18-alpine

WORKDIR /usr/app
COPY package*.json .
COPY .env .

RUN npm install

CMD ["node", "src/index.js"]