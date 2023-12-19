const { 
    config : {redis},
 } = require ('./config');
const { app : appWorker, appIn : appinWorker} = require("./workers");
const Queue = require('bull');  //gestiona las queues

//Crear una queue, creamos una instancia
const x = new Queue('x', {redis});
const xX = new Queue('xX', {redis});

//Cada que se agregue un item aca se evidencia
x.process((job, done)=> appWorker(job, done));
    //console.log(job.data);
//});
xX.process((job, done)=> appinWorker(job, done));

const queues = [
    {
    // Name of the bull queue, this name must match up exactly with what you've defined in bull.
    name: "x",
    // Hostname or queue prefix, you can put whatever you want.
    hostId: "Queue Manager",
    // Redis auth.
    redis,
  },
  {
    // Name of the bull queue, this name must match up exactly with what you've defined in bull.
    name: "xX",
    // Hostname or queue prefix, you can put whatever you want.
    hostId: "Queue Manager",
    // Redis auth.
    redis,
  },
];

module.exports = {x,xX,queues};