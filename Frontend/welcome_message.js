const { nc } = require("./frontend");

function welcome_message(req, res) {
  // Verificar que la conexión a NATS esté establecida antes de intentar publicar
  if (nc) {
    res.status(200).json({
      message:
        "Comandos disponibles: \n \
      submit-job [git URL] {name}: Crea un nuevo trabajo a partir de una URL. Recibe opcionalmente un nombre y devuelve la ID del trabajo \n \
      exec-job [ID|name]: Ejecuta el trabajo especificado \n \
      status-job [ID|name]: Estado en que se encuentra el trabajo (ready, running, done) \n \
      result-job [ID|name]: Output del trabajo\n \
      delete-job []ID|name]: Eliminación del trabajo \n \
       my-jobs: ID, nombre y estado de los trabajos del usuario",
    });
  } else {
    res.status(500).json({
      error: "Error.",
    });
  }
}

module.exports = {
  welcome_message,
};
