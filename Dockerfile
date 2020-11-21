FROM node:12.18.4

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
EXPOSE 4443 8989
CMD [ "node", "src/index.js" ]
# After Build
# docker run --name wolf --network kraken -p 4443:4443 -p 8989:8989 -v /mnt/user/appdata/cert:/usr/src/app/src/cert wolf:latest