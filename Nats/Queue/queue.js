const { connect, StringCodec } = require('nats');
const { v4: uuidv4 } = require('uuid'); 

let natsConnection;

const startCola = async () => {

    try{
        console.log("Start connection NATS");
        natsConnection = await connect({ service: "localhost:4222"});
        console.log("Connected to nats");
    }

    catch (error){
        console.log("NATS error", error);
    }
}

const createWork = async (body ={})  => {
    try {
        const sc = StringCodec();
        body.id = uuidv4();
        const value = JSON.stringify(body);
        natsConnection.publish("cola", sc.encode(value));
        return body.id;
    }
    catch (error) {
        console.log ("Error NATS");
    }
}

module.exports = {
    startCola,
    createWork
}
