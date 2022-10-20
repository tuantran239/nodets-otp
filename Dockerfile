FROM node:16-alpine

WORKDIR /usr/app

COPY package.json ./    

RUN npm install

COPY . .

EXPOSE 5000

RUN npm install -g pm2

CMD ["pm2-runtime", "ecosystem.config.js"]

