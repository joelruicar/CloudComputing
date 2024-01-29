// Coge el ID y busca la URL en el KV.
// Descarga los archivos del git en una carpeta temporal y los ejecuta. 
// Envía el resultado y tiempos a la cola NATS de resultados y al OS
// Mientras, va cambiando estado del KV storage a in execution, done o error
// El tiempo de ejecución se guarda tanto en el OS como en el KV 

const { connect, StringCodec, StorageType } = require("nats");
const fs = require('fs');
const path = require("path");
const destinationFolder = 'temp'
const rimraf = require('rimraf');
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const { ReadableStream } = require('node:stream/web');

async function buscarDatos(id, kv, sc, os) {
  rimraf.sync(destinationFolder);

  const data = await kv.get(id);
  if (data) {
    await keyValueChanges(id, kv, sc, "executing")
    try {
      const dataJSON = JSON.parse(sc.decode(data.value))
      const url = dataJSON.URL

      await execAsync(`git clone ${url} ${destinationFolder}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      await keyValueChanges(id, kv, sc, "error")
    }
  }
  else {
    console.log("ID inválido")
    await guardarEnOS(id, os, sc, "ID inválido")
    await keyValueChanges(id, kv, sc, "error")
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

async function ejecutarScriptSegunExtension(extension, file, id, kv, sc, os) {
  switch (extension) {
    case 'py':
      return ejecutarPython(file + "." + extension, id, kv, sc, os);
    case 'cpp':
      return ejecutarCPP(file + "." + extension, id, kv, sc, os);
    case 'c':
      return ejecutarC(file + "." + extension, id, kv, sc, os);
    case 'sh':
      return ejecutarSH(file + "." + extension, id, kv, sc, os);
    default:
      console.log(`Extensión no soportada: ${extension}`);
      await guardarEnOS(id, os, sc, `Extensión no soportada: ${extension}`)
      await keyValueChanges(id, kv, sc, "error")
      return Promise.resolve(null);
  }
}

async function ejecutarPython(scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      // Registrar el tiempo de inicio
      const startTime = new Date();

      const comando = `python3 ${path.join(destinationFolder, scriptPath)}`;
      const { stdout, stderr } = await execAsync(comando);

      // Registrar el tiempo de finalización
      const endTime = new Date();

      // Calcular la diferencia de tiempo en milisegundos
      const tiempoDeEjecucion = (endTime - startTime) / 1000;

      if (stderr) {
        console.error(`Error al ejecutar el script de Python: ${stderr}`);
        await guardarEnOS(id, os, sc, stderr, tiempoDeEjecucion + "s");
        keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al ejecutar el script de Python: ${stderr}`));
      } else {
        console.log(`Script de Python ejecutado correctamente: ${stdout}`);

        await guardarEnOS(id, os, sc, stdout, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "done");
        await guardarEnKV(id, kv, sc, tiempoDeEjecucion + "s", stdout)
        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el script de Python: ${error.message}`);
      await guardarEnOS(id, os, sc, error, tiempoDeEjecucion + "s");
      await keyValueChanges(id, kv, sc, "error");
      reject(error);
    }
  });
}


async function ejecutarCPP(scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      // Registrar el tiempo de inicio
      const startTime = new Date();

      const comando = `g++ ${path.join(destinationFolder, scriptPath)} -o ${path.join(destinationFolder, 'output')}`;
      const compileResult = await execAsync(comando);

      if (compileResult.stderr) {
        console.error(`Error al compilar el código C++: ${compileResult.stderr}`);
        await guardarEnOS(id, os, sc, compileResult.stderr);
        await keyValueChanges(id, kv, sc, "error");
        await reject(new Error(`Error al compilar el código C++: ${compileResult.stderr}`));
        return;
      }

      const ejecutable = path.join(destinationFolder, 'output');
      const { stdout, stderr } = await execAsync(ejecutable);

      // Registrar el tiempo de finalización
      const endTime = new Date();

      // Calcular la diferencia de tiempo en milisegundos
      const tiempoDeEjecucion = (endTime - startTime) / 1000;

      if (stderr) {
        console.error(`Error al ejecutar el código C++: ${stderr}`);
        await guardarEnOS(id, os, sc, stderr, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al ejecutar el código C++: ${stderr}`));
      } else {
        console.log(`Código C++ ejecutado correctamente: ${stdout}`);

        await guardarEnOS(id, os, sc, stdout, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "done");
        await guardarEnKV(id, kv, sc, tiempoDeEjecucion + "s", stdout)

        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C++: ${error.message}`);
      await guardarEnOS(id, os, sc, error.message);
      await keyValueChanges(id, kv, sc, "error");
      reject(error);
    }
  });
}

async function ejecutarSH(scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      // Registrar el tiempo de inicio
      const startTime = new Date();

      const comando = `cd ${destinationFolder} && bash ${scriptPath} -o 'output'`;
      const { stdout, stderr } = await execAsync(comando);

      // Registrar el tiempo de finalización
      const endTime = new Date();

      // Calcular la diferencia de tiempo en milisegundos
      const tiempoDeEjecucion = (endTime - startTime) / 1000;

      if (stderr) {
        console.error(`Error al ejecutar el sh: ${stderr}`);
        await guardarEnOS(id, os, sc, stderr, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al ejecutar el sh: ${stderr}`));
      } else {
        console.log(`Código sh ejecutado correctamente: ${stdout}`);

        await guardarEnOS(id, os, sc, stdout, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "done");
        await guardarEnKV(id, kv, sc, tiempoDeEjecucion + "s", stdout)

        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el sh: ${error.message}`);
      await guardarEnOS(id, os, sc, error.message);
      await keyValueChanges(id, kv, sc, "error");
      reject(error);
    }
  });
}

async function ejecutarC(scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      // Registrar el tiempo de inicio
      const startTime = new Date();

      const ejecutablePath = path.join(destinationFolder, 'output');
      const compileCommand = `gcc ${path.join(destinationFolder, scriptPath)} -o ${ejecutablePath}`;
      const compileResult = await execAsync(compileCommand);

      if (compileResult.stderr) {
        console.error(`Error al compilar el código C: ${compileResult.stderr}`);
        await guardarEnOS(id, os, sc, compileResult.stderr);
        await keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al compilar el código C: ${compileResult.stderr}`));
        return;
      }

      const { stdout, stderr } = await execAsync(ejecutablePath);

      // Registrar el tiempo de finalización
      const endTime = new Date();

      // Calcular la diferencia de tiempo en milisegundos
      const tiempoDeEjecucion = (endTime - startTime) / 1000;

      if (stderr) {
        console.error(`Error al ejecutar el código C: ${stderr}`);
        await guardarEnOS(id, os, sc, stderr, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al ejecutar el código C: ${stderr}`));
      } else {
        console.log(`Código C ejecutado correctamente: ${stdout}`);

        await guardarEnOS(id, os, sc, stdout, tiempoDeEjecucion + "s");
        await keyValueChanges(id, kv, sc, "done");
        await guardarEnKV(id, kv, sc, tiempoDeEjecucion + "s", stdout)

        resolve(stdout);
        return stdout
      }
    } catch (error) {
      console.error(`Error al ejecutar el código C: ${error.message}`);
      await guardarEnOS(id, os, sc, error.message);
      await keyValueChanges(id, kv, sc, "error");
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

async function fromReadableStream(ed, sc) {
  result = ""
  const reader = ed.getReader();
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

async function keyValueChanges(id, kv, sc, estadoParam) {
  let data = await kv.get(id);
  if (data) {
    let existingState = JSON.parse(sc.decode(data.value))

    existingState.STATE = estadoParam
    console.log(existingState)
    finalState = JSON.stringify(existingState)
    await kv.put(id, sc.encode(finalState))

  }
}

async function guardarEnKV(id, kv, sc, tiempo, stdout) {
  try {
    let estado = await kv.get(id);
    console.log('Contenido de la variable "id" en KV es:', estado);
    console.log('La variable "id" del KV es de tipo: ', typeof estado)

    const dataJSON = JSON.parse(sc.decode(estado.value))
    dataJSON.TIME = tiempo
    dataJSON.RESULTS = stdout
    const finalState = JSON.stringify(dataJSON)
    await kv.put(id, sc.encode(finalState))
    console.log(finalState)
    // Introducir un pequeño retraso antes de la siguiente operación
    await new Promise(resolve => setTimeout(resolve, 100));


  } catch (error) {
    console.error(`Error al leer o guardar el archivo: ${error.message}`);
  }
}

async function guardarEnOS(id, os, sc, tiempo, stdout) {
  try {
    let estado = await os.getBlob(id);
    let status = await os.status();
    console.log('Contenido de la variable "id" en Object Storage es:', estado);
    console.log('La variable "id" del OBStorage es de tipo: ', typeof estado)

    const dataJSON = JSON.parse(sc.decode(binaryData.value))  //Decodifica el JSON
    dataJSON.TIME = tiempo
    dataJSON.RESULTS = stdout

    const jsonData = JSON.stringify(dataJSON); // Convierto > JSON
    console.log('Data obtained from the "id" stored in the OBStorage', jsonData); 
    
    const bytes = new TextEncoder().encode(jsonData); // Convertir el JSON a Uint8Array
      let data = new Uint8Array(bytes);

      await os.putBlob({ name: id, description: "Contenido" }, data);
      console.log(
        `Se agregó una nueva entrada para ${id} (${finalState.length} bytes).`,
        `El Object Storage ahora tiene ${status.size} bytes.`
      );

    // Introducir un pequeño retraso antes de la siguiente operación
    await new Promise(resolve => setTimeout(resolve, 100));

  } catch (error) {
    console.error(`Error al guardar en el Object Storage: ${error.message}`);
  }
}


async function run() {
  const sc = StringCodec();
  //docker inspect nats-q
  const natsUrl = '192.168.1.5';

  const nc = await connect({ servers: natsUrl });
  const js = await nc.jetstream();
  const kv = await js.views.kv('jobs_In');
  const os = await js.views.os("configs");

  groupName = 'group1'
  const sub = nc.subscribe('cola', { queue: groupName });
  // const res = nc.('jobs_out', {queue: groupName });

  

  (async () => {
    for await (const m of sub) {

      let id = JSON.parse(sc.decode(m.data)).id
      await buscarDatos(id, kv, sc, os)
      extensionMain = obtenerExtension()
      await ejecutarScriptSegunExtension(extensionMain, "main", id, kv, sc, os);
    }
  })();

}

run().catch((err) => {
  console.error(err);
});