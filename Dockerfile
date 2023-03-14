
FROM node:18
WORKDIR /usr/app

# Updating dependencies
RUN apt-get update 

# Clients for mysql, mongo and postgres
RUN apt-get install -y default-mysql-client 

RUN wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian11-x86_64-100.7.0.deb && \
    apt install ./mongodb-database-tools-*.deb && \
    rm -f mongodb-database-tools-*.deb

RUN wget https://downloads.mongodb.com/compass/mongodb-mongosh_1.8.0_amd64.deb && \
    apt install ./mongodb-mongosh_*.deb && \
    rm -f mongodb-mongosh_*.deb

RUN apt-get install -y postgresql-client

COPY . .

RUN npm install

CMD ["npm", "run", "dev"]