const express = require("express");
const { connect } = require('nats');
const {createWork, kvUsers, createOStore} = require('../queue.js');
const routeApi = express.Router();  //creacion de variable para acceder a los metodos de Router de express

routeApi.post('/job', async (req, res) => {
    const job = req.body;

    try {
        const result = await createWork(job);
        const jobId = result.jobId;
        const jsonData = result.stateData;
        
        const Consulta = `Solicitud recibida, su ID de trabajo es: ${jobId}. Trabajo almacenado en el KeyValue Store y en cola NATS.`;
        res.json({Consulta, stateData: jsonData});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//(EN PRUEBA) Obtener resultados del OStorage
routeApi.get('/job/obsResults', async (req, res) => {
    const job = req.body;
          try {
            const jobId = await createOStore(job);
            const responseMessage = `Trabajo agregado a Object Storage: ${jobId}`;
            res.json({ responseMessage });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

module.exports = routeApi;
