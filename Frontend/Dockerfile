# Use Node 16 alpine as parent image
FROM node:16-alpine

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY Frontend/package.json Frontend/package-lock.json ./

# Install dependencies
RUN npm install

RUN mkdir routes

# Copy the rest of project files into this image
COPY Frontend/* .
COPY Frontend/routes/* ./routes/

# Expose application port
EXPOSE 3000

# Start the application
CMD npm start
