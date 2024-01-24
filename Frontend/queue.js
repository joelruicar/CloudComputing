const { connect, StringCodec } = require('nats');
const { v4: uuidv4 } = require('uuid'); 

let natsConnection;
let currentId;

const startCola = async () => {

    try{
        console.log("Start connection NATS");
        natsConnection = await connect({ servers: "localhost:4222"});
        console.log("Connected to nats\n");
    }

    catch (error){
        console.log("NATS error", error);
    }
}



const createWork = async (body ={})  => {
    try {
        const sc = StringCodec();
        body.id = uuidv4();
        currentId = body.id; // Almacenar el id actual
        const value = JSON.stringify(body);
        natsConnection.publish("cola", sc.encode(value));
        //console.log("Value to be published in NATS:", value); // PRUEBA oara validar ID
        //await kv.delete("kv.jobIn");
        //await kv.delete("kv.jobsId");

        //Almacenamiento en el KV
        const js = natsConnection.jetstream(); // L.  instancia de JetStream.
        const kv = await js.views.kv("jobs_In");
        let status = await kv.status();
        
        console.log("Trabajo almacenado en la base de datos:", status.streamInfo.config.name,"\n");
        info =  await kv.put("kv.jobIn", body.id);
        let entry = await kv.get("kv.jobIn");
        console.log("Recibido, en proceso de ejecucion:");
        console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}\n`);

         // ver historico de Storage
         let history = false;
         const iter = await kv.watch({
           key: "kv*",
           initializedFn: () => {
             history = true;
           },
         });
         (async () => {
           for await (const e of iter) {
         
             console.log(
               `${
                 history ? "History" : "Updated"
               } ${e.key} @ ${e.revision} -> ${e.string()}`,
             );
           }
         })();
         //

        return body.id;
    }
    catch (error) {
        console.log ("Error NATS");
    }
   
}

const exportKVstore = async (body ={})  => {
    try {
        const js = natsConnection.jetstream(); // L.  instancia de JetStream.
        const kv = await js.views.kv("jobs_Out");
        let status = await kv.status();
        
        //Agregar ajustes para que el id de la funcion createWork se aloje aqui
        //const sc = StringCodec();
        //body.id = uuidv4();
        //const value = JSON.stringify(body);
        
        console.log("Trabajo almacenado en la base de datos:", status.streamInfo.config.name);
        info =  await kv.put("kv.jobOut", currentId);
        let entry = await kv.get("kv.jobOut");
        console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}`);
          
        return currentId;
        }
        catch (error) {
            console.log (error);
        }
    }


/* const createKVstore = async (body ={})  => {
    try {
        const js = natsConnection.jetstream(); // L.  instancia de JetStream.
        const kv = await js.views.kv("jobs_In");
        let status = await kv.status();
       
        const sc = StringCodec();
        body.id = uuidv4();
        const value = JSON.stringify(body);
        
        console.log("Trabajo almacenado en la base de datos:", status.streamInfo.config.name);
        info =  await kv.put("kv.jobIn", body.id);
        let entry = await kv.get("kv.jobIn");
        console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}`);
          
        return body.id;
        }
        catch (error) {
            console.log (error);
        }
    } */

    

/* const createKVstore = async (body ={})  => {
    try {
        const js = natsConnection.jetstream(); // L.  instancia de JetStream.
        const os = await js.views.os("configs");
        let status = await os.status();
       
        console.log(`the object store has ${status.size} bytes`);
        const bytes = 10000000;
        let data = new Uint8Array(bytes);

        const sc = StringCodec();
        body.id = uuidv4();
        const value = JSON.stringify(body);
                
        info = await os.put(
            { name: "b", description: "PRUEBA UNO" }
          );
          console.log(
            `added entry ${info.name} (${info.size} bytes)- '${info.description}'`,
          );
                    
          const result = await os.get("b");
           console.log(`${result.info.name} has ${result.info.description} `);
          return body.id;
    }
    catch (error) {
        console.log (error);
    }
}
function readableStreamFrom(data) {
    return new ReadableStream({
      pull(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });
  } */



module.exports = {
    startCola,
    createWork,
    exportKVstore 

}


/* const { connect, StringCodec } = require('nats');
const { v4: uuidv4 } = require('uuid'); 

let natsConnection;

const startCola = async () => {

    try{
        console.log("Start connection NATS");
        natsConnection = await connect({ servers: "192.168.1.5"});
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
 */