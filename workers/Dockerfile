# Usa la imagen oficial de Node.js como base
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de configuración de la aplicación
COPY package*.json ./

# Instala dependencias de la aplicación y g++
RUN apk add --no-cache python3 \
    && apk add --update g++ \
    && rm -rf /var/cache/apk/*

# Copia el código fuente de la aplicación
COPY . .

# Instala las dependencias de la aplicación
RUN npm install

RUN apk add --no-cache git

# Expone el puerto 8080
EXPOSE 8080

# Define el comando para ejecutar la aplicación
CMD [ "node", "app.js" ]

#docker build -t node-image-demo .