# Usa la imagen oficial de Node.js como base
FROM node:16-alpine

# Crear un nuevo usuario sin privilegios
RUN adduser -D -g '' newuser

# Establecer el directorio de trabajo para el nuevo usuario
WORKDIR /home/newuser

# Cambiar la propiedad del directorio de trabajo al nuevo usuario
RUN chown -R newuser:newuser /home/newuser

# Copiar los archivos de configuración de la aplicación
COPY --chown=newuser:newuser package*.json ./

# Instalar dependencias de la aplicación y g++
RUN  apk add --no-cache python3 && \
     apk add --update g++ && \
    rm -rf /var/cache/apk/*

# Copiar el código fuente de la aplicación
COPY --chown=newuser:newuser . .

# Instalar las dependencias de la aplicación
RUN npm install

RUN apk add --no-cache git

RUN apk add --no-cache gcc

# Exponer el puerto 8081
EXPOSE 8081

# Cambiar al nuevo usuario
USER newuser

# Definir el comando para ejecutar la aplicación
CMD [ "node", "app.js" ]


# docker build -t worker .
# docker run -p 8081:8081 --net cloudcomputing_ccnet --rm --ip 192.168.1.10 worker 