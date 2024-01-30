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
    await guardarEnOS(id, os, sc, "0s", "ID inválido");
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
      return ejecutarScript("python", file + "." + extension, id, kv, sc, os)
    case 'cpp':
      return ejecutarScript("cpp", file + "." + extension, id, kv, sc, os)
    case 'c':
      return ejecutarScript("c", file + "." + extension, id, kv, sc, os)
    case 'sh':
      return ejecutarScript("sh", file + "." + extension, id, kv, sc, os)
    default:
      console.log(`Extensión no soportada: ${extension}`);
      await guardarEnOS(id, os, sc, "0s", `Extensión no soportada: ${extension}`)
      await keyValueChanges(id, kv, sc, "error")
      return Promise.resolve(null);
  }
}

async function ejecutarScript(scriptType, scriptPath, id, kv, sc, os) {
  return new Promise(async (resolve, reject) => {
    try {
      // Registrar el tiempo de inicio
      const startTime = new Date();

      let comando;

      switch (scriptType) {
        case 'python':
          comando = `python3 ${path.join(destinationFolder, scriptPath)}`;
          break;
        case 'cpp':
          comando = `g++ ${path.join(destinationFolder, scriptPath)} -o ${path.join(destinationFolder, 'output')}`;
          break;
        case 'sh':
          comando = `cd ${destinationFolder} && bash ${scriptPath} -o 'output'`;
          break;
        case 'c':
          const ejecutablePath = path.join(destinationFolder, 'output');
          const compileCommand = `gcc ${path.join(destinationFolder, scriptPath)} -o ${ejecutablePath}`;
          const compileResult = await execAsync(compileCommand);

          if (compileResult.stderr) {
            console.error(`Error al compilar el código C: ${compileResult.stderr}`);
            await guardarEnOS(id, os, sc, "0s", compileResult.stderr);
            await keyValueChanges(id, kv, sc, "error");
            reject(new Error(`Error al compilar el código C: ${compileResult.stderr}`));
            return;
          }

          comando = ejecutablePath;
          break;
        default:
          reject(new Error('Tipo de script no válido'));
          return;
      }

      const { stdout, stderr } = await execAsync(comando);

      // Registrar el tiempo de finalización
      const endTime = new Date();

      // Calcular la diferencia de tiempo en milisegundos
      const tiempoDeEjecucion = (endTime - startTime) / 1000;

      if (stderr) {
        console.error(`Error al ejecutar el script: ${stderr}`);
        await guardarEnOS(id, os, sc, tiempoDeEjecucion + "s", stderr);
        await keyValueChanges(id, kv, sc, "error");
        reject(new Error(`Error al ejecutar el script: ${stderr}`));
      } else {
        console.log(`Script ejecutado correctamente: ${stdout}`);

        await guardarEnOS(id, os, sc, tiempoDeEjecucion + "s", stdout);
        await keyValueChanges(id, kv, sc, "done");

        resolve(stdout);
      }
    } catch (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      await guardarEnOS(id, os, sc, "0s", error.message);
      await keyValueChanges(id, kv, sc, "error");
      reject(error);
    }
  });
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

async function guardarEnOS(id, os, sc, tiempo, stdout) {
  try {
    let estado = await os.getBlob(id);
    let status = await os.status();

    let dataString = sc.decode(estado); // Convertir el buffer a una cadena
    let dataJSON = JSON.parse(dataString);  //Decodifica el JSON para manipularlo
    dataJSON.TIME = tiempo
    dataJSON.RESULTS = stdout

    const jsonData = JSON.stringify(dataJSON); // Convierto > JSON
    console.log('> Data stored in the OB Store: \n', jsonData);

    const bytes = new TextEncoder().encode(jsonData); // Convertir el JSON a Uint8Array
    let data = new Uint8Array(bytes);

    await os.putBlob({ name: id, description: "Contenido" }, data);
    console.log(
      `Se agregó una nueva entrada para ${id} (${finalState.length} bytes).\n`,
      `El Object Storage ahora ocupa: ${status.size} bytes.\n`
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