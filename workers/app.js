//coge el ID, descarga los archivos del object storage en una carpeta temporal y los ejecuta, lo guarda en la carpeta results
// y un archivo .sdtoud para la cola nats, cambiar estado del KV storage a in execution, done o error

const { connect, subscribe, StringCodec, StorageType } = require("nats");
const fs = require('fs');
const path = require("path");
const destinationFolder = 'temp'
const rimraf = require('rimraf');
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const { ReadableStream } = require('node:stream/web');

async function buscarDatos(id, kv,sc) {
  rimraf.sync(destinationFolder);
  const data = await kv.get(id);

  if (data) {
    keyValueChanges(id, kv, sc, "executing")
    try {
      const dataJSON = JSON.parse(sc.decode(data.value))
      const url = dataJSON.URL
      
      await execAsync(`git clone ${url} ${destinationFolder}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      saveResultToFile(id, error.message)
      keyValueChanges(id, kv, sc, "error")
    }
  }
  else {
      console.log("ID inválido")
  }
}

async function keyValueChanges(id, kv, sc, estadoParam) {
  let data = await kv.get(id);
  let existingState = JSON.parse(sc.decode(data.value))
  existingState.STATE = estadoParam
  finalState = JSON.stringify(existingState)
  await kv.put(id, sc.encode(finalState))
  console.log(finalState)
}

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

function obtenerExtension() {
  let extensionMain;
  for (const elem of fs.readdirSync(destinationFolder)) {
    const nombre = path.parse(elem).name;
    const extension = path.parse(elem).ext.substr(1); 
    if (nombre === 'main') {
      extensionMain = extension;
    }
  }
  return extensionMain
}

async function ejecutarScriptSegunExtension(extension, file, id, kv, sc, os) {
  switch (extension) {
    case 'py':
      return ejecutarPython(file + "." + extension, id, kv, sc,os);
    case 'cpp':
      return ejecutarCPP(file+"."+extension, id, kv, sc,os);
    case 'c':
    return ejecutarC(file+"."+extension, id, kv, sc,os);
      break;
    default:
      console.log(`Extensión no soportada: ${extension}`);
      saveResultToFile(id, `Extensión no soportada: ${extension}`)
      return Promise.resolve(null);
  }
}

async function ejecutarPython(scriptPath, id, kv, sc,os) {
  return new Promise(async (resolve, reject) => {
    try {
      const comando = `python3 ${path.join(destinationFolder, scriptPath)}`;
      const { stdout, stderr } = await execAsync(comando);

      if (stderr) {
        console.error(`Error al ejecutar el script de Python: ${stderr}`);
        reject(new Error(`Error al ejecutar el script de Python: ${stderr}`));
      } else {
        console.log(`Script de Python ejecutado correctamente: ${stdout}`);
        
        saveResultToFile(id, stdout);
        await guardarEnKV(id, kv, sc, stdout)
        await guardarEnOS(id, os, sc, stdout)
        
        resolve(stdout);

      }
    } catch (error) {
      console.error(`Error al ejecutar el script de Python: ${error.message}`);
      saveResultToFile(id, error)
      reject(error);
    }
  });
}

async function ejecutarCPP(scriptPath, id, kv, sc,os) {
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
        saveResultToFile(id, stdout)
        await guardarEnKV(id, kv, sc, stdout)
        await guardarEnOS(id, os, sc, stdout)
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C++: ${error.message}`);
      saveResultToFile(id, error.message);
      reject(error);
    }
  });
}

async function ejecutarC(scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      const ejecutablePath = path.join(destinationFolder, 'output');

      const compileCommand = `gcc ${path.join(destinationFolder, scriptPath)} -o ${ejecutablePath}`;
      const compileResult = await execAsync(compileCommand);

      if (compileResult.stderr) {
        console.error(`Error al compilar el código C: ${compileResult.stderr}`);
        reject(new Error(`Error al compilar el código C: ${compileResult.stderr}`));
        return;
      }

      const { stdout, stderr } = await execAsync(ejecutablePath);

      if (stderr) {
        console.error(`Error al ejecutar el código C: ${stderr}`);
        reject(new Error(`Error al ejecutar el código C: ${stderr}`));
      } else {
        console.log(`Código C ejecutado correctamente: ${stdout}`);
        saveResultToFile(id, stdout)
        await guardarEnKV(id, kv, sc, stdout)
        await guardarEnOS(id, os, sc, stdout)
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C: ${error.message}`);
      saveResultToFile(id, error.message);
      reject(error);
    }
  });
}

 async function guardarEnKV(id, kv, sc, stdout) {
  try {
    let estado = await kv.get(id);
    
    const dataJSON = JSON.parse(sc.decode(estado.value))
    dataJSON.RESULTS = stdout
    finalState = JSON.stringify(dataJSON)
    await kv.put(id, sc.encode(finalState))
    
  } catch (error) {
    console.error(`Error al leer o guardar el archivo: ${error.message}`);
  }
}

function readableStreamFrom(data) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
}

async function fromReadableStream(rs, sc) {
  result = ""
  const reader = rs.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value && value.length) {
      result += sc.decode(value);
    }
  }
  return result;
}

async function guardarEnOS(id, os, sc, stdout) {
  try {
    await os.put({
      name: id,
    }, readableStreamFrom(sc.encode(JSON.stringify(stdout))));
  const estado = await os.get(id);
  result = await fromReadableStream(estado.data, sc);
  } catch (error) {
    console.error(`Error al leer o guardar el archivo OS: ${error.message}`);
  }
}

async function run() {
  const sc = StringCodec();  
  //la tarea ya viene on queue
  //Ajustar la URL a la configuracion del NATS mediante docker inspect nats-q
  const natsUrl = '192.168.1.5';
  
  const nc = await connect({ servers: natsUrl });
  groupName  = 'group1'
  const sub = nc.subscribe('jobs_executors', {queue: groupName });
  // const res = nc.('job_results', {queue: groupName });
 
  const js = await nc.jetstream();
  const kv = await js.views.kv('testing', { history: 5 });
  const os = await js.views.os("testing", { storage: StorageType.File });
  
  //Le pasamos un ID de prueba, suponemos que le llega así
  if (kv.get("4558308c-4cb2-4194-a8c0-9f5539178a5e") != null) {
    await kv.delete("4558308c-4cb2-4194-a8c0-9f5539178a5e")
    await kv.create("4558308c-4cb2-4194-a8c0-9f5539178a5e", sc.encode(JSON.stringify({
      "URL": "https://github.com/joelruicar/basicPython",
      "STATE": "in_queue",
      "RESULTS": ""
    })))
  }

  if (kv.get("5558308c-4cb2-4194-a8c0-9f5539178a5e") != null) {
    await kv.delete("5558308c-4cb2-4194-a8c0-9f5539178a5e")
    await kv.create("5558308c-4cb2-4194-a8c0-9f5539178a5e", sc.encode(JSON.stringify({
      "URL": "https://github.com/joelruicar/basicCPP",
      "STATE": "in_queue",
      "RESULTS": ""
    })))
  }

  (async () => {
    for await (const m of sub) {
      let id= sc.decode(m.data)
      await buscarDatos(id, kv, sc)
      extensionMain = obtenerExtension()
      await ejecutarScriptSegunExtension(extensionMain ,"main", id, kv, sc,os);
      keyValueChanges(id, kv, sc, "done")
    }
  })();
  
  //lo que en teoria le llega al worker 
  await nc.publish("jobs_executors", sc.encode("4558308c-4cb2-4194-a8c0-9f5539178a5e"))
  await nc.publish("jobs_executors", sc.encode("5558308c-4cb2-4194-a8c0-9f5539178a5e"))
}

run().catch((err) => {
  console.error(err);
});