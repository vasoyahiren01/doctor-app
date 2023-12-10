FROM node:14.16.0
RUN mkdir -p /usr/scr/app
WORKDIR /usr/scr/app
COPY . .
RUN npm i
EXPOSE 5000
CMD [ "node", "index.js"]
