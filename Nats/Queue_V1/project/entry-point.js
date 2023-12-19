require('dotenv').config();  //podremos acceder a las variables de entorno de .env
//console.log(process.env.PORT); prueba de recepcion del puerto

const { 
    config : {port },       //llamada al export del index de la carpeta config
} = require('./config'); 
const express = require('express');
const app = express();
const { queues } = require('./queues');

console.log(queues);

require('./server')(app, port, queues);