const express = require('express');
const { connect } = require('nats');
const { v4: uuidv4 } = require('uuid');

const { startCola } = require('./queue.js');
const routeApi = require('./routes/route.js');  

const app = express();
const PORT = 3000;

const NATS_URL = 'nats://192.168.1.5:4222';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));  //

app.use('/api', routeApi);

app.post('/', async (req, res) => {
  var welcome_json = {}

  welcome_json["message"] = "Acciones disponibles"
  welcome_json["routes"] = {}

  welcome_json["routes"]["/api/job"] = {}
  welcome_json["routes"]["/api/job"]["body_params"] = "URL: <url>"
  welcome_json["routes"]["/api/job"]["description"] = "Crea un nuevo trabajo a partir de una URL. Devuelve la ID del trabajo"

  welcome_json["routes"]["/api/job/<id>"] = {}
  welcome_json["routes"]["/api/job/<id>"]["body_params"] = "none"
  welcome_json["routes"]["/api/job/<id>"]["description"] = "Devuelve el estado del trabajo enviado por el mismo usuario"

  welcome_json["routes"]["/api/job/obs/<id>"] = {}
  welcome_json["routes"]["/api/job/obs/<id>"]["body_params"] = "none"
  welcome_json["routes"]["/api/job/obs/<id>"]["description"] = "Devuelve el resultado del trabajo enviado por el mismo usuario"

  welcome_json["routes"]["/api/jobs"] = {}
  welcome_json["routes"]["/api/jobs"]["body_params"] = "none"
  welcome_json["routes"]["/api/jobs"]["description"] = "Devuelve el estado de todos los trabajos pertenecientes al usuario"

  welcome_json["routes"]["/observer"] = {}
  welcome_json["routes"]["/observer"]["body_params"] = "none"
  welcome_json["routes"]["/observer"]["description"] = "Devuelve un registro de eventos producidos por el observer. Solo cuenta de adiminstrador"

  try {
    nc = await connect({ servers: "192.168.1.5" });
  }
  catch (error) {
    console.log("NATS error", error);
  }

  try {
    const js = nc.jetstream();
    const kvUser = await js.views.kv("users");
    await kvUser.create(username, sc.encode(user));
    await nc.close();
  } catch (err) {
    // Si da error es que ya existe
  }

  res.json(welcome_json);
});

startCola();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`FrontEnd listening on port: ${PORT} \n`);
});