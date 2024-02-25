'use strict';

const App = require('./app');

const api = new App();
api.startWebServer()
  .catch((err) => {
    console.info(err);
  });
