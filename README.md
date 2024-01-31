
<center>

---

#  Cloud  Computing - Servicio FaaS

---

</center>

<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\Faas.png" align="right" height="124px"/>



## Integrantes
* Roberto Alfonso Ruiz
* Joel Ruiz Carrillo
* Juan Camilo Jojoa Sanchez
* Lizet Valeria Chamorro Hernández

---
 
 
### Arquitectura general

 Plataforma que permite a los clientes desarrollar, ejecutar y administrar funcionalidades de aplicaciones sin la complejidad de construir y mantener la infraestructura asociada a una aplicación.
 

 Diagrama de flujo de los microservicios usados:
 
 <center>
 
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\diagrama.png"/>

</center>


###  Oauth-proxy 


 <center>
 
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\autenticacion.png"/>

 </center>

| Ficheros  | Descripción |
| ---------- | ---------------| 
|   cfg-keycloak    cfg-auth2 |Protege a los endpoints mediante autenticación con el proveedor Keycloak.  Permite la creación y gestión de tokens de acceso (JWT).



###  Frontend 



 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\frontend.png"/>
 </center>


 
| Script  | Path | Descripción |
| ---------- | --------| ---------------| 
| route.js  | Frontend/routes/route.js| Define un conjunto de endpoints que requiere el frontend utilizando Express.| 
|frontend.js|Frontend/frontend.js | Funcionalidad principal permitir la interacción del usuario con el backend para la petición y consulta de trabajos.


### Servicios NATs

 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\queue.png"/>
 </center>

| Script  | Path | Descripción |
| ---------- | --------| ------------|
| queue.js|Frontend/queue.js | Administración de solicitudes a través de un servicio de colas. NATS/JetStream se encuentra configurado para poner en cola la llegada de trabajos, almacena el estado del trabajo en el KV y resultados en el OBS.


###  Worker

 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\worker.png"/>
 </center>
 


| Script  | Path | Descripción |
| ---------- | --------| ------------|
| apps.js |Workers/app.js | Realiza la clonación y ejecución de repositorios dados, con cambios continuos en el estado de ejecución de la tarea.  |





###  Observer

<center>

<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\observer.png"/>

</center>


| Script  | Path | Descripción |
| ---------- | --------| ------------|
| observer.js|Observer/observer.js | Monitorea el estado de la cola NATS de trabajos lanzados. Evalúa la cantidad de mensajes pendientes en la cola y realiza acciones específicas en función de límites predefinidos.  |







