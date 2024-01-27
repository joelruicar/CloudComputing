const { connect, StringCodec } = require('nats');
const { v4: uuidv4 } = require('uuid'); 

let natsConnection;
let currentId;

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
        currentId = body.id; // Almacenar el id actual
        const value = JSON.stringify(body);
        //console.log("Value to be published in NATS:", value); // PRUEBA para validar recepcion del ID

        //Almacenamiento en el KV
        const js = natsConnection.jetstream(); // L.  instancia de JetStream.
        const kv = await js.views.kv("jobs_In");
        let status = await kv.status();
        
        console.log("Trabajo almacenado en la base de datos:", status.streamInfo.config.name,"\n");
        info =  await kv.put("kv.jobIn", body.id);
        let entry = await kv.get("kv.jobIn");
        console.log("Recibido, en proceso de ejecucion:");
        console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}\n`);

        //Trabajo publicado en la cola
        natsConnection.publish("cola", sc.encode(value));
        
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

        return body.id;
    }
    catch (error) {
        console.log ("Error NATS");
    }
}

const exportKVstore = async (body ={})  => {
  try {
      const js = natsConnection.jetstream(); // L.  instancia de JetStream.
      const kv = await js.views.kv("User_list");
      let status = await kv.status();
      
      console.log("Usuario almacenado en la base de datos:", status.streamInfo.config.name);
      info =  await kv.put("kv.email", currentId);
      let entry = await kv.get("kv.email");
      console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}`);
        
      return currentId;
      }
      catch (error) {
          console.log (error);
      }
  }

module.exports = {
    startCola,
    createWork,
    exportKVstore
}
