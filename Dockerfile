FROM node:latest

COPY ./*.js /app/
COPY ./package.json /app/
COPY ./data /app/
COPY ./models /app/
COPY ./routes /app/
COPY ./src /app/
COPY ./test /app/
COPY ./upload /app/

# Change work dir
WORKDIR /app

# compile node
RUN npm install

# Expose port for server
EXPOSE 4000

# Launch application
CMD ["npm","start"]