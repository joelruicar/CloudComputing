# Use Node 16 alpine as parent image
FROM node:21-alpine3.18

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY Observer/package.json Observer/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of project files into this image
COPY Observer/* .

# Expose application port
EXPOSE 3000

# Start the application
CMD npm start
