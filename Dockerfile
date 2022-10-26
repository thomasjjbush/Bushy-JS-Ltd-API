FROM node:16

WORKDIR /dist

COPY package.json .
COPY yarn.lock .

RUN yarn

EXPOSE 9000

COPY . .

CMD ["yarn", "start"]