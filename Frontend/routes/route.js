const express = require("express");
const { connect } = require('nats');
const {createWork, kvUsers, returnWork, createOStore, returnAllWorks, observerRecords} = require('../queue.js');
const routeApi = express.Router();  //creacion de variable para acceder a los metodos de Router de express

routeApi.post('/job', async (req, res) => {
    const job = req.body;

    try {
        const result = await createWork(job, req.headers["x-forwarded-preferred-username"], req.headers["x-forwarded-user"]);
        const jobId = result.jobId;
        const jsonData = result.stateData;
        
        const Consulta = `Solicitud recibida, su ID de trabajo es: ${jobId}. Trabajo almacenado en el KeyValue Store y en cola NATS.`;
        res.json({Consulta, stateData: jsonData});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//(EN PRUEBA) Obtener resultados del OStorage
routeApi.post('/job/obsResults', async (req, res) => {
    const job = req.body;
          try {
            const jobId = await createOStore(job);
            const responseMessage = `Trabajo agregado a Object Storage: ${jobId}`;
            res.json({ responseMessage });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

routeApi.post('/job/:id', async (req, res) => {
    const jobId = req.params.id;
    try {
        const jobData = await returnWork({ id: jobId });
        if(jobData.OWNER == req.headers["x-forwarded-user"])
            res.json({ jobId, data: jobData });
        else
            res.json({ response: "You do not have the ownership over this job" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

routeApi.post('/jobs', async (req, res) => {
    try {
        const jobsData = await returnAllWorks(req.headers["x-forwarded-user"]);
        res.json({ jobs: jobsData });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

routeApi.post('/observer', async (req, res) => {
    try {
        const jobsData = await observerRecords(req.headers["x-forwarded-user"]);
        res.json({ jobs: jobsData });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

  
module.exports = routeApi;
