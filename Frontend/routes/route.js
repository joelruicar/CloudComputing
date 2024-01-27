const express = require("express");
const { connect } = require('nats');
const {createWork, kvUsers} = require('../queue.js');
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

//(EN PRUEBA) Recuperar email y enviar a KV User_list
routeApi.get('/job/users', async (req, res) => {
    const job = req.body;

    kvUsers(job).then((data) => {
        res.json({jobId:data});
    })
    .catch((error) => {
        res.status(500).json({error:error,message});
    });

});

module.exports = routeApi;
