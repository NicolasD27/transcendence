FROM node:lts

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin

COPY ./package.json  /app/

RUN npm install
RUN npm install -g @nestjs/cli

# COPY . /app/

# EXPOSE 8000

CMD ["npm", "start"]