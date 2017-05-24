FROM mhart/alpine-node:6.3.1

EXPOSE 3000

RUN mkdir /usr/app
WORKDIR /usr/app

ADD package.json package.json
RUN npm install
ADD . .

CMD ["npm","start"]
