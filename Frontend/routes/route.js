const express = require("express");
const { connect } = require('nats');
const {createWork} = require('../queue.js');
const routeApi = express.Router();  //creacion de variable para acceder a los metodos de Router de express

routeApi.post('/job', async (req, res) => {
    const job = req.body;

    createWork(job).then((data) => {
        res.json({jobId:data});
    })
    .catch((error) => {
        res.status(500).json({error:error,message});
    });

});

routeApi.post('/job/queue', async (req, res) => {
    const job = req.body;

    createWork(job).then((data) => {
        res.json({jobId:data});
    })
    .catch((error) => {
        res.status(500).json({error:error,message});
    });

});

module.exports = routeApi;
