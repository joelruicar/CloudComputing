//Librerias
const express = require('express');
const { connect } = require('nats');
const { v4: uuidv4 } = require('uuid'); // Importar la función v4 de uuid para generar UUIDs

//Llamadas
const { startCola } = require('./queue.js');
const routeApi = require('./routes/route.js');  //se importa solamente uno.

const app = express();
const PORT = 3000;

const NATS_URL = 'nats://192.168.1.5:4222';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));  //

app.use('/api', routeApi);

// app.post('/', (req,res) => {
//   res.send('Servidor FrontEnd');
// });

app.post('/', (req, res) => {
  var welcome_json = {}

  welcome_json["message"] = "Acciones disponibles"
  welcome_json["routes"] = {}

  welcome_json["routes"]["/job"] = {}
  welcome_json["routes"]["/job"]["body_params"] = "giturl: <url>"
  welcome_json["routes"]["/job"]["description"] = "Crea un nuevo trabajo a partir de una URL. Devuelve la ID del trabajo"

  welcome_json["routes"]["/job/<id>"] = {}
  welcome_json["routes"]["/job/<id>"]["body_params"] = "none"
  welcome_json["routes"]["/job/<id>"]["description"] = "Devuelve el estado de trabajo enviado por el mismo usuario (estado, tiempo de ejecucion...)"

  welcome_json["routes"]["/jobs"] = {}
  welcome_json["routes"]["/jobs"]["body_params"] = "none"
  welcome_json["routes"]["/jobs"]["description"] = "Devuelve el estado de todos los trabajos pertenecientes al usuario"

  welcome_json["routes"]["/observer"] = {}
  welcome_json["routes"]["/observer"]["body_params"] = "none"
  welcome_json["routes"]["/observer"]["description"] = "Devuelve un registro de eventos producidos por el observer. Solo cuenta de adiminstrador"

  res.json(welcome_json);
});

startCola();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`FrontEnd escuchando en el puerto ${PORT}`);
});