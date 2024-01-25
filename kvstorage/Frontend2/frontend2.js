//Librerias
const express = require('express');
const { connect } = require('nats');
const { v4: uuidv4 } = require('uuid'); // Importar la función v4 de uuid para generar UUIDs

//Llamadas
const {startCola} = require('./queue2.js');
const routeApi = require('./routes2/route2.js');  //se importa solamente uno.

const app = express();
//const PORT = 3000;

//const NATS_URL = 'localhost:4222';
  
app.use(express.json());
app.use(express.urlencoded( {extended: false}));  //

app.use ('/api2', routeApi);

app.get('/', (req,res) => {
  res.send('Prueba de ingreso al FE');
});

startCola();

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Frontend escuchando en el puerto ${PORT}`);
  });