FROM node:14.16.0
RUN mkdir -p /usr/scr/app
WORKDIR /usr/scr/app
COPY . .
RUN npm i
EXPOSE 3000
ENTRYPOINT [ "node", "app.js"]