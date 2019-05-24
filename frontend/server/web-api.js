const express = require('express');
const open = require('open');
const routing = require('./routing');

module.exports = (port) => {
  const api = express();

  routing.setupResourceRoutes(require('../client/resource-map.json'), api);
  routing.setupApiRoutes(api);

  api.listen(port, () => {
    setTimeout(() => {
      open(`http://localhost:${port}/`);
    }, 1000);
  });
};
