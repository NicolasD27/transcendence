FROM node:lts

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH


COPY ./package.json  /app/

RUN npm install
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# RUN chown -R node /app/node_modules

# COPY . /app/

# EXPOSE 8000

CMD ["npm", "start"]