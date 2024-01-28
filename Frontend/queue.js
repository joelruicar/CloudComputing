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
    currentId = body.id; 
    const value = JSON.stringify(body);

    //Almacenamiento en el KV
    const js = natsConnection.jetstream(); 
    const kv = await js.views.kv("jobs_In");
    let status = await kv.status();
    
    //Obtener trabajo asociado
    const jobData = {
        "URL": "https://github.com/joelruicar/basicC",
        "STATE": "in_queue",
        "RESULTS": "",
        "TIME": ""
    };

    // Convertir a JSON
    const jsonData = JSON.stringify(jobData);

    // Convertir a objeto Buffer
    const bufferData = Buffer.from(jsonData);
    
    console.log("Trabajo almacenado en el KeyValue Store:", status.streamInfo.config.name,"\n");
    //info =  await kv.put("kv.jobIn", body.id);
    //let entry = await kv.get("kv.jobIn");
    info =  await kv.put(currentId, bufferData);
    let entry = await kv.get(currentId);
    console.log("Informacion del trabajo:");
    console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}\n`);

    //Trabajo publicado en la cola
    natsConnection.publish("cola", sc.encode(value));
    console.log("Value published in NATS:", "\n", value);
  
    //Historico

    return { jobId: currentId, stateData: jsonData };
}
  
  catch (error) {
    console.log ("Error NATS", error);
  }
}

const returnWork = async (body = {}) => {
  try {
    const sc = StringCodec();
    const currentId = body.id; 
    const js = natsConnection.jetstream(); 
    const kv = await js.views.kv("jobs_In");
    let entry = await kv.get(currentId);
    const jobData = JSON.parse(sc.decode(entry.value))
    console.log(jobData, "aqui"); 
    return jobData ;
  } catch (error) {
    throw new Error(`Error in returnWork: ${error.message}`);
  }
}

const createOStore = async (body ={})  => {
  try {
      const js = natsConnection.jetstream(); 
      const os = await js.views.os("configs");
      let status = await os.status();
     
      const bytes = 10000000;
      let data = new Uint8Array(bytes);

      const sc = StringCodec();
      body.id = uuidv4(); //Pasar ID de trabajo resultado
      const value = JSON.stringify(body);
              
      info = await os.put(
          { name: "OB Resultados", description: "Bodega de resultados" }
        );
        console.log(
          `added entry ${info.name} (${info.size} bytes)- '${info.description}'`,
          `the object store has ${status.size} bytes`
        );
                  
        const result = await os.get("OB Resultados");
         console.log(`${result.info.name} has ${result.info.description} `);
        return body.id;
  }
  catch (error) {
      console.log (error);
  }
}


//(EN PRUEBA) Creacion de KV para usuarios
const kvUsers = async (body ={})  => {
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
    kvUsers, 
    returnWork,
    createOStore
}
