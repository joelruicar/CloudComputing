// app.js
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('nats');
const { sendJob } = require('./send_job'); 
const { welcomeMessage } = require('./welcome_message');
const app = express();
const port = 3000;

// Variable global para la conexión NATS
let nc;

// Función para establecer la conexión
async function connectToNats() {
  try {
    nc = await connect();
    console.log('Connected to NATS');
  } catch (err) {
    console.error('Error connecting to NATS:', err);
  }
}

// Llamada a la función de conexión
connectToNats();

app.use(bodyParser.json());

// Utiliza la función del controlador para la ruta '/send-job'
app.post('/send-job', sendJob);
app.post('/', welcomeMessage);

app.listen(port, () => {
  console.log(`Frontend listening at http://localhost:${port}`);
});

// Exporta nc para que pueda ser utilizado en otros archivos
module.exports = {
  nc,
};
