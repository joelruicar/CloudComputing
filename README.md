
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
 

 Diagrama de flujo compuesto por los siguientes  microservicios :
 
 <center>
 
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\diagrama.png"/>

</center>


###  Oauth-proxy 


 <center>
 
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\autenticacion.png"/>

 </center>

| Script  | Path | Descripción |
| ---------- | --------| ---------------| 
| route.js  | Frontend/routes/route.js|



###  Frontend 



 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\frontend.png"/>
 </center>
Archivos

 
| Script  | Path | Descripción |
| ---------- | --------| ---------------| 
| route.js  | Frontend/routes/route.js| Define un conjunto de rutas API utilizando Express. Las rutas contenidas están relacionada con: la creación de trabajos, obtención de resultados que se almacenan en "Observer Storage" y "KV Store", la obtención de todos los trabajos de un usuario, y la obtención de registros de eventos producidos por el observador. |
| frontend.js|Frontend/frontend.js | Funcionalidad principal gestión de trabajos y  comunicación con NATS. Usa  Express, define rutas API, establece conexión con NATS, inicializa una cola de trabajos y responde a las solicitudes POST en la ruta principal.


### Queue

 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\queue.png"/>
 </center>

| Script  | Path | Descripción |
| ---------- | --------| ------------|
| queue.js|Frontend/queue.js | Las funciones que se utilizan se centran en la gestión de trabajos, almacenamiento en "KeyValue Store" y "Observer Storage" utilizando JetStream, y la obtención de información sobre trabajos y eventos. JetStream proporciona características avanzadas de mensajería, como persistencia y entrega garantizada de mensajes, que son fundamentales para aplicaciones distribuidas y resilientes|

###  Worker

 <center>
<img src="E:\1. MAESTRIA 9122023\4. Cloud Computing\ProyectoGit\CloudComputing\repositorio\worker.png"/>
 </center>
 


| Script  | Path | Descripción |
| ---------- | --------| ------------|
| apps.js |Workers/app.js | Procesa trabajos de manera distribuida y asíncrona en un entorno de microservicios.  Descarga los archivos del git en una carpeta temporal y los ejecuta. Envía el resultado y tiempos a la cola NATS de resultados y al Object Storage. Mientras, va cambiando estado del KV storage a in execution, done o error. El tiempo de ejecución se guarda tanto en el OS como en el KV .  |





### * Observer

<img src=/>

| Script  | Path | Descripción |
| ---------- | --------| ------------|
| observer.js|Observer/observer.js | Las  |


### * Object Store

<img src=/>

| Script  | Path | Descripción |
| ---------- | --------| ------------|
| queue.js|Frontend/queue.js | Las  |




