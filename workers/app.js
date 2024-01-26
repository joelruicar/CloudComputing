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

async function buscarDatos(id, kv,sc, os) {
  // rimraf.sync(destinationFolder);

  const data = await kv.get(id);
  if (data) {
    keyValueChanges(id, kv, sc, "executing")
    try {
      const dataJSON = JSON.parse(sc.decode(data.value))
      const url = dataJSON.URL
      
      await execAsync(`git clone ${url} ${destinationFolder}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      keyValueChanges(id, kv, sc, "error")
    }
  }
  else {
      console.log("ID inválido")
      await guardarEnOS(id, os, sc, "ID inválido")
      keyValueChanges(id, kv, sc, "error")
  }
}

async function keyValueChanges(id, kv, sc, estadoParam) {
  let data = await kv.get(id);
  console.log(data, id , "aqui")
  if (data) {
    let existingState = JSON.parse(sc.decode(data))
    existingState.STATE = estadoParam
    finalState = JSON.stringify(existingState)
    await kv.put(id, sc.encode(finalState))
  }
 
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

async function ejecutarScriptSegunExtension(extension, file, id, kv, sc, os, nc) {
  switch (extension) {
    case 'py':
      return ejecutarPython(file + "." + extension, id, kv, sc,os, nc);
    case 'cpp':
      return ejecutarCPP(file+"."+extension, id, kv, sc,os, nc);
    case 'c':
    return ejecutarC(file+"."+extension, id, kv, sc,os, nc);
      break;
    default:
      console.log(`Extensión no soportada: ${extension}`);
      await guardarEnOS(id, os, sc, `Extensión no soportada: ${extension}`)
      keyValueChanges(id, kv, sc, "error")
      return Promise.resolve(null);
  }
}

async function ejecutarPython(scriptPath, id, kv, sc,os, nc) {
  return new Promise(async (resolve, reject) => {
    try {
      const comando = `python3 ${path.join(destinationFolder, scriptPath)}`;
      const { stdout, stderr } = await execAsync(comando);

      if (stderr) {
        console.error(`Error al ejecutar el script de Python: ${stderr}`);
        await guardarEnOS(id, os, sc, stderr)
        keyValueChanges(id, kv, sc, "error")
        reject(new Error(`Error al ejecutar el script de Python: ${stderr}`));
      } else {
        console.log(`Script de Python ejecutado correctamente: ${stdout}`);
        
        await guardarEnOS(id, os, sc, stdout)
        keyValueChanges(id, kv, sc, "done")
         // const natsQueue = 'jobs_Out';
         nc.publish(natsQueue, sc.encode(JSON.stringify({
          id,
          result: stdout,
        })));
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el script de Python: ${error.message}`);
      await guardarEnOS(id, os, sc, error)
      keyValueChanges(id, kv, sc, "error")
      reject(error);
    }
  });
}

async function ejecutarCPP(scriptPath, id, kv, sc,os, nc) {
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
        await guardarEnOS(id, os, sc, stderr)
        keyValueChanges(id, kv, sc, "error")
        reject(new Error(`Error al ejecutar el código C++: ${stderr}`));
      } else {
        console.log(`Código C++ ejecutado correctamente: ${stdout}`);  
        
        await guardarEnOS(id, os, sc, stdout)
        keyValueChanges(id, kv, sc, "done")
        // const natsQueue = 'jobs_Out';
        nc.publish(natsQueue, sc.encode(JSON.stringify({
          id,
          result: stdout,
        })));
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C++: ${error.message}`);
      await guardarEnOS(id, os, sc, error.message)
      keyValueChanges(id, kv, sc, "error")
      reject(error);
    }
  });
}

async function ejecutarC(scriptPath, id, kv, sc, os, nc) {
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
        await guardarEnOS(id, os, sc, stdout)
        keyValueChanges(id, kv, sc, "done")
         // const natsQueue = 'jobs_Out';
         nc.publish(natsQueue, sc.encode(JSON.stringify({
          id,
          result: stdout,
        })));

        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C: ${error.message}`);
      reject(error);
    }
  });
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
  //crear cola para enviar resultados, ya no se guardan en KV
  const natsUrl = '192.168.1.5';
  
  const nc = await connect({ servers: natsUrl });
  const js = await nc.jetstream();
  const kv = await js.views.kv('jobs_In');

  groupName  = 'group1'
  const sub = nc.subscribe('cola', {queue: groupName });
  // const res = nc.('jobs_out', {queue: groupName });
 
  const os = await js.views.os("jobs_Out", { storage: StorageType.File });
 
  (async () => {
    for await (const m of sub) {
      let id= JSON.parse(sc.decode(m.data)).id
      await buscarDatos(id, kv, sc, os)
      extensionMain = obtenerExtension()
      await ejecutarScriptSegunExtension(extensionMain ,"main", id, kv, sc,os);
    }
  })();
}

run().catch((err) => {
  console.error(err);
});

