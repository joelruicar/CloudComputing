//coge el ID, descarga los archivos del object storage en una carpeta temporal y los ejecuta, lo guarda en la carpeta results
// y un archivo .sdtoud para la cola nats, cambiar estado del KV storage a in execution, done o error

const { connect, subscribe } = require("nats");
const { exec } = require("child_process");

function descargarRepositorio(url) {
  // Ejecuta el comando de clonación del repositorio
  exec(`git clone ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al clonar el repositorio: ${stderr}`);
    } else {
      console.log(`Repositorio clonado correctamente: ${stdout}`);
      // Agrega lógica adicional aquí, como ejecutar el script
    }
  });
}

async function run() {
  //Ajustar la URL a la configuracion del NATS
  const nc = await connect({ servers: "" });

  // Suscripción a un tema específico
  const subscription = subscribe("*");

  // Manejar los mensajes recibidos
  for await (const message of subscription) {
    console.log(`Mensaje recibido: ${message}`);
    // Agregar lógica para procesar mensajes
    descargarRepositorio(message.url);
  }

  nc.close();
}

run().catch((err) => {
  console.error(err);
});
