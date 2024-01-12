# Use the official Node.js image as base
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN apk add --no-cache python3 && ln -sf python3 /usr/bin/python


# Bundle app source
COPY . .

# Expose port 8080
EXPOSE 8080

# Define the command to run your application
CMD [ "node", "app.js" ]

#docker build -t node-image-demo .