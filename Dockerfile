FROM node:latest

WORKDIR /repa

COPY ./ ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]
