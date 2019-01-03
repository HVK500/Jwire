const express = require('express');
const opn = require('opn');
const routing = require('./routing');

module.exports = (port) => {
  const api = express();

  routing.setupResourceRoutes(require('../client/resource-map.json'), api);
  routing.setupApiRoutes(api);

  api.listen(port, () => {
    setTimeout(() => {
      opn(`http://localhost:${port}/`);
    }, 1000);
  });
};
