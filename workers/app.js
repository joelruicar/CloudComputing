//coge el ID, descarga los archivos del object storage en una carpeta temporal y los ejecuta, lo guarda en la carpeta results
// y un archivo .sdtoud para la cola nats, cambiar estado del KV storage a in execution, done o error

const { connect, subscribe, StringCodec } = require("nats");
const fs = require('fs');
const path = require("path");
const destinationFolder = 'temp'
const rimraf = require('rimraf');
const util = require('util');
const { NatsConnectionImpl } = require("nats/lib/nats-base-client/nats");
const execAsync = util.promisify(require('child_process').exec);

function saveResultToFile(id, data) {
  const resultFilePath = path.join('results', `${id}.stdoud`);

  fs.writeFile(resultFilePath, data, (err) => {
    if (err) {
      console.error(`Error al guardar el resultado en el archivo: ${err}`);
    } else {
      console.log(`Resultado guardado en el archivo: ${resultFilePath}`);
    }
  });
}

async function keyValueChanges(id, kv, sc, estadoParam) {
  let currentState;
  // Verificar si ya existe la clave en el KeyValue Store
  const existingState = await kv.get(id);

  if (existingState) {
    // Si la clave existe, decodificar el estado actual
    currentState = sc.decode(existingState);
  } else {
    // Si la clave no existe, crear un objeto con el atributo "estado"
    currentState = { estado: null }; // Puedes ajustar el valor inicial según tus necesidades
  }

  // Modificar solo el atributo "estado" del objeto currentState con el valor de estadoParam
  currentState.estado = estadoParam;

  await kv.put(id, sc.encode(currentState));
}

async function descargarRepositorio(id, sc) {
  // const js = nc.jetstream();
  // const kv = await js.views.kv("testing");
  rimraf.sync(destinationFolder);

  // keyValueChanges(id, kv, sc, "executing")
  try {
    await execAsync(`git clone https://github.com/joelruicar/basicPython ${destinationFolder}`);
   
    //obtener extension del repositorio descargado 
    let extensionMain;
    for (const elem of fs.readdirSync(destinationFolder)) {
      const nombre = path.parse(elem).name;
      const extension = path.parse(elem).ext.substr(1); 
      if (nombre === 'main') {
        extensionMain = extension;
      }
    }
    await ejecutarScriptSegunExtension(extensionMain ,"main");
   
    // keyValueChanges(id, kv, sc, "done")
  } catch (error) {
    console.error(`Error: ${error.message}`);
    saveResultToFile(id, error.message)
    // keyValueChanges(id, kv, sc, "error")
  }
}

async function ejecutarScriptSegunExtension(extension, file) {
  console.log(extension, "a")
  switch (extension) {
    case 'py':
      return ejecutarPython(file + "." + extension);
    case 'cpp':
      return ejecutarCPP(file+"."+extension);
      break;
    case 'c':

      break;
    default:
      console.log(`Extensión no soportada: ${extension}`);
      saveResultToFile("", `Extensión no soportada: ${extension}`)
      return Promise.resolve(null);
  }
}

async function ejecutarPython(scriptPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const comando = `python3 ${path.join(destinationFolder, scriptPath)}`;
      const { stdout, stderr } = await execAsync(comando);

      if (stderr) {
        console.error(`Error al ejecutar el script de Python: ${stderr}`);
        reject(new Error(`Error al ejecutar el script de Python: ${stderr}`));
      } else {
        console.log(`Script de Python ejecutado correctamente: ${stdout}`);
        
        saveResultToFile("", stdout);
        resolve(stdout);

      }
    } catch (error) {
      console.error(`Error al ejecutar el script de Python: ${error.message}`);
      saveResultToFile("id", stderr)
      reject(error);
    }
  });
}

async function ejecutarCPP(scriptPath) {
  return new Promise(async (resolve, reject) => {
    try {
    
      const comando = `g++ ${path.join(destinationFolder, scriptPath)} -o ${path.join(destinationFolder, 'output')}`;
      const compileResult = await execAsync(comando);
      if (compileResult.stderr) {
        console.error(`Error al compilar el código C++: ${compileResult.stderr}`);
        reject(new Error(`Error al compilar el código C++: ${compileResult.stderr}`));
        return;
      }
      const ejecutable = path.join(destinationFolder, 'output');
      const { stdout, stderr } = await execAsync(ejecutable);

      if (stderr) {
        console.error(`Error al ejecutar el código C++: ${stderr}`);
        reject(new Error(`Error al ejecutar el código C++: ${stderr}`));
      } else {
        console.log(`Código C++ ejecutado correctamente: ${stdout}`);  
        saveResultToFile("", stdout)
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C++: ${error.message}`);
      saveResultToFile("", error.message);
      reject(error);
    }
  });
}

async function run() {
  //la tarea ya viene on queue
  //Ajustar la URL a la configuracion del NATS
  const natskvUrl = 'nats://172.17.0.2:4222';

  const nc = await connect({ servers: [natskvUrl] });
  const sc = StringCodec();
  console.log(`connected to ${nc.getServer()}`);
  groupName  = 'group1'
  const sub = nc.subscribe('jobs_executors', {queue: groupName });
 
  // const js = await nc.jetstream();
  // const kv = await js.views.kv('testing', { history: 5 });
  // const os = await js.views.os("testing", { storage: NATS.StorageType.File });
  
  (async () => {
    for await (const m of sub) {
      descargarRepositorio("", sc);
      
    console.log(sc.decode(m.data));
    }
  })();

  await nc.publish("jobs_executors", sc.encode("{}") )
}

run().catch((err) => {
  console.error(err);
});