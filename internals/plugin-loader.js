const pathing = require('path');
const pluginSystem = require('plugin-system');
const pluginBase = require('./plugin-base');

module.exports = {
  init: (pluginFolder, onComplete) => {
    pluginSystem({
      paths: [ pathing.resolve(pluginFolder) + '\\' ]
    })
    .then((plugins) => {
      const result = {};

      if (plugins.length === 0) {
        plugins.push(pluginBase());
      }

      plugins.forEach((plugin) => {
        if (!!result[plugin.type]) return;
        result[plugin.type] = plugin;
      });

      onComplete(result);
    })
    .catch((err) => {
      console.log(err);
    });
  }
}
