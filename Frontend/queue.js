const { connect, StringCodec } = require('nats');
const { v4: uuidv4 } = require('uuid');

let currentId;

const startCola = async () => {

  try {
    console.log("CONNECTED TO NATS");
    natsConnection = await connect({ servers: "192.168.1.5" });
  }

  catch (error) {
    console.log("NATS error", error);
  }
}

const createWork = async (body = {}, username, user) => {
  try {
    const sc = StringCodec();
    body.id = uuidv4();
    currentId = body.id;
    const value = JSON.stringify(body);

    //Configuracion del KV
    const js = natsConnection.jetstream();
    const kv = await js.views.kv("jobs_In");
    let status = await kv.status();

    //Configuracion del OBStorage
    const os = await js.views.os("configs");
    let statusOBS = await os.status();

    //Obtener trabajo asociado
    const jobData = {
      "URL": body.URL,
      "STATE": "in_queue",
      "RESULTS": "",
      "TIME": "",
      "OWNER": user
    };

    const kvUser = await js.views.kv("users");

    try {
      await kvUser.create(username, sc.encode(user));
    } catch (err) {
      // Si da error es que ya existe
    }

    //Gestion de datos
    const jsonData = JSON.stringify(jobData); // > JSON
    const bufferData = Buffer.from(jsonData); // JSON > Buffer

    //Almacenamiento en el KV
    info = await kv.put(currentId, bufferData);
    let entry = await kv.get(currentId);
    console.log("Job Information:");
    console.log("> Work stored in the KeyValue Store:", status.streamInfo.config.name);
    console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}\n`);

    //Almacenamiento en la Cola
    natsConnection.publish("cola", sc.encode(value));
    console.log("> Data published in NATS:", "\n", JSON.parse(value), "\n");

    //Almacenamiento en el OBStorage
    const bytes = new TextEncoder().encode(jsonData); // Convertir el JSON a Uint8Array
    let data = new Uint8Array(bytes);
    let infoOB = await os.putBlob({ name: currentId, description: "Contenido" }, data);
    let entries = await os.list();
    console.log(`> The Object Store contains ${entries.length} entries`);
    console.log(`Received work: ${infoOB.name} (${infoOB.size} bytes)- '${infoOB.description}'`,
    );
    console.log(`The bucket has ${statusOBS.size} bytes`);
    console.log(`Client has a max payload of ${natsConnection.info?.max_payload} bytes \n`);

  return { infoOB, jobId: currentId, stateData: jobData };

  }

  catch (error) {
    console.log("Error NATS", error);
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
    console.log("> Results stored in the KV: ", "\n", jobData, "\n");
    return jobData;
  } catch (error) {
    throw new Error(`Error in returnWork: ${error.message}`);
  }
}

const returnAllWorks = async (user) => {
  try {
    const sc = StringCodec();
    const js = natsConnection.jetstream();
    const kv = await js.views.kv("jobs_In");

    const buf = [];
    const keys = await kv.keys();
    await (async () => {
      for await (const k of keys) {
        buf.push(k);
      }
    })();

    const array = []

    for (const key of buf) {
      let entry = await kv.get(key);
      const jobData = JSON.parse(sc.decode(entry.value))
      if (jobData.OWNER == user) {
        delete jobData.OWNER;
        array.push(jobData)
      }
    }

    if (array.length === 0)
      return "no records found for this user"

    return array
  } catch (error) {
    throw new Error(`Error in returnAllWorks: ${error.message}`);
  }
}

const returnWorkOB = async (body = {}) => {
  try {
    const sc = StringCodec();
    const currentId = body.id;
    const js = natsConnection.jetstream();
    const os = await js.views.os("configs");
    let entry = await os.getBlob(currentId);
    //console.log("returnWorkOB devuelve el id puro: ", entry); //id como Binario
    //console.log("Contenido del id comom String es:", entry.toString());//id como String

    const jsonData = JSON.parse(entry.toString());
    console.log("> Bucket in OB Storage:", jsonData, "\n");

    return jsonData;
  } catch (error) {
    throw new Error(`Error in return Work in OBS: ${error.message}`);
  }
}


//(EN PRUEBA) Creacion de KV para usuarios
const kvUsers = async (body = {}) => {
  try {
    const js = natsConnection.jetstream(); // L.  instancia de JetStream.
    const kv = await js.views.kv("User_list");
    let status = await kv.status();

    console.log("Usuario almacenado en la base de datos:", status.streamInfo.config.name);
    info = await kv.put("kv.email", currentId);
    let entry = await kv.get("kv.email");
    console.log(`${entry?.key} @ ${entry?.revision} -> ${entry?.string()}`);

    return currentId;
  }
  catch (error) {
    console.log(error);
  }
}

const observerRecords = async (user) => {
  try {
    const sc = StringCodec();
    const js = natsConnection.jetstream();
    const kvadmin = await js.views.kv("users");

    let admin = await kvadmin.get("useradmin");
    if (sc.decode(admin.value) != user) {
      return "Permission Denied"
    }

    const kv= await js.views.kv("Observer");

    const buf = [];
    const keys = await kv.keys();
    await (async () => {
      for await (const k of keys) {
        buf.push(k);
      }
    })();

    const array = []

    for (const key of buf) {
      let entry = await kv.get(key);
      const observerEntry = sc.decode(entry.value)
      var jsontmp = {}
      jsontmp[key] = observerEntry
      array.push(jsontmp)
    }

    if (array.length === 0)
      return "no events recorded from observer"

    return array.reverse()
  } catch (error) {
    throw new Error(`Error in observerRecords: ${error.message}`);
  }
}

module.exports = {
  startCola,
  createWork,
  kvUsers,
  returnWork,
  returnAllWorks,
  returnWorkOB,
  observerRecords
}
