const Arena = require("bull-arena");
const Bull = require("bull");

module.exports = (app,port, queues) => {

  const arenaConfig = Arena(
    {
      Bull,
      queues,
    },
  {
    // Make the arena dashboard become available at {my-site.com}/arena.
    basePath: '/arena',
    // Let express handle the listening.
    disableListen: true,
  });
  
  // Make arena's resources (js/css deps) available at the base app route
  app.use('/', arenaConfig);
  app.listen(port, () => {
    console.log('Server on port', port);
  });
}