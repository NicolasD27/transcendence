# Image source
FROM node:lts

# Docker working directory
WORKDIR /app

# Copying file into APP directory of docker
COPY ./package.json  /app/

# Then install the NPM module
RUN npm install
RUN npm install -g @nestjs/cli

# Copy current directory to APP folder
# COPY . /app/

EXPOSE 8000
CMD ["npm", "run", "start:dev"]