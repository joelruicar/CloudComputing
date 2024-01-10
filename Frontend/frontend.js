const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('nats');

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

app.post('/send-job', (req, res) => {

  // Verificar que la conexión a NATS esté establecida antes de intentar publicar
  if (nc) {
    const job = req.body;
    nc.publish('job_queue', JSON.stringify(job));
    
    console.log('Trabajo recibido y agregado a la cola. ')
    res.status(200).json({ message: 'Trabajo recibido y en la cola.' });
  } else {
    res.status(500).json({ error: 'Failed to publish job. NATS connection not established.' });
  }
});

app.listen(port, () => {
  console.log('Frontend listening at http://localhost:${port}');
  
});