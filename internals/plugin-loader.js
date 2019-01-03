const pathing = require('path');
const pluginSystem = require('plugin-system');
const helpers = require('./helpers');
const base = require('./plugin-base');

module.exports = (pluginFolder) => {
  pluginSystem.registerLogger(helpers.getLoggerContext());

  return Promise.all([
    pluginSystem({
      paths: [`${pathing.resolve(pluginFolder)}\\`]
    })
    .then((plugins) => {
      if (plugins.length === 0) {
        throw 'error';
      }

      plugins.forEach((plugin) => {
        plugin(base);
      });
    })
    .catch((err) => {
      throw `No plugins found or enabled. Plugins are required to output the resulting query data. - ${err}`;
    })
  ]);
};
