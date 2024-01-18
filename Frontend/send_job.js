
const { nc } = require('./frontend'); 

function sendJob(req, res) {
  // Verificar que la conexión a NATS esté establecida antes de intentar publicar
  if (nc) {
    const job = req.body;
    nc.publish('job_queue', JSON.stringify(job));

    console.log('Trabajo recibido y agregado a la cola. ')
    res.status(200).json({ message: 'Trabajo recibido y en la cola.' });
  } else {
    res.status(500).json({ error: 'Failed to publish job. NATS connection not established.' });
  }
}

module.exports = {
  sendJob,
};
