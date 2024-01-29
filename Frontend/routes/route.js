const express = require("express");
const { connect } = require('nats');
const {createWork, kvUsers, returnWork, createOStore, returnAllWorks, observerRecords} = require('../queue.js');
const routeApi = express.Router();  

routeApi.post('/job', async (req, res) => {
    const job = req.body;
    var fe = {}

    try {
        const result = await createWork(job, req.headers["x-forwarded-preferred-username"], req.headers["x-forwarded-user"]);
        const jobId = result.jobId;
        const jsonData = result.stateData;
        
        fe["message"] = "RECEIVED WORK"
        fe["resume"] = {}
        fe["resume"]["information"] = {}
        fe["resume"]["information"]["Work ID"] = `${jobId}.`;
        fe["resume"]["information"]["NATS"] = "Work stored in the queue.";
        fe["resume"]["information"]["Job description"] = jsonData;

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    res.json(fe);
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
        if(jobData.OWNER == req.headers["x-forwarded-user"]){
            delete jobData.OWNER;
            res.json({ jobId, data: jobData });
        }
        else
            res.json({ response: "You do not have the ownership over this job" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

routeApi.post('/job/:id/output', async (req, res) => {
    const jobId = req.params.id;
    try {
        res.json({ response: "Placeholder devolucion output id: " + jobId });
        // const jobData = await returnWork({ id: jobId });
        // if(jobData.OWNER == req.headers["x-forwarded-user"]){
        //     delete jobData.OWNER;
        //     res.json({ jobId, data: jobData });
        // }
        // else
        //     res.json({ response: "You do not have the ownership over this job" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

routeApi.post('/job/:id/error', async (req, res) => {
    const jobId = req.params.id;
    try {
        res.json({ response: "Placeholder devolucion error id: " + jobId });
        // const jobData = await returnWork({ id: jobId });
        // if(jobData.OWNER == req.headers["x-forwarded-user"]){
        //     delete jobData.OWNER;
        //     res.json({ jobId, data: jobData });
        // }
        // else
        //     res.json({ response: "You do not have the ownership over this job" });
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
