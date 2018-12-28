const fs = require('fs');
const pathing = require('path');
const pluginSystem = require('plugin-system');
const pluginBase = require('./plugin-base');

const processPlugins = (onComplete) => {
  return (plugins) => {
    const result = {};

    if (plugins.length === 0) {
      plugins.push(pluginBase());
    }

    plugins.forEach((plugin) => {
      if (!!result[plugin.type]) return;
      result[plugin.type] = plugin;
    });

    onComplete(result);
  }
};

module.exports = {
  init: (pluginFolder, onComplete) => {
    const resolvedPluginFolder = pathing.resolve(pluginFolder);
    if (!pluginFolder || (fs.existsSync(resolvedPluginFolder) && fs.readdirSync(resolvedPluginFolder).length === 0)) {
      processPlugins(onComplete)([]);
      return;
    }

    pluginSystem({
      paths: [ `${resolvedPluginFolder}/` ]
    })
    .then(processPlugins(onComplete))
    .catch((err) => {
      console.log(err);
    });
  }
}
