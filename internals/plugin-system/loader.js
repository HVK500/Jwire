const pathing = require('path');
const pluginManager = require('./manager');
const { attachWatcher, getDirectories, log } = require('../helpers');

module.exports = (pluginDirectory, disablePluginHotReloading = false) => {
  return getDirectories(pluginDirectory)
    .then((pluginDirectories) => {
      Promise.all(pluginDirectories.map((directory) => {
        return pluginManager.addPlugin(directory);
      })).then(() => {
        if (pluginManager.numberOfPluginsLoaded() === 0) {
          throw `There are no plugins loaded, you need at least one plugin to execute a query.`;
        }
      }).then(() => {
        // Avoid watching the plugins directory if the system will be used once
        if (disablePluginHotReloading) return;
        attachWatcher(pluginDirectory, {
          ready: () => {
            log.info('Plugin-system watching for changes');
          },
          error: (error) => {
            log.error('error', error);
          },
          addDir: (directory) => {
            log.info(`Detected that addition of a plugin directory (${directory}), proceeding to load plugin.`);
            pluginManager.addPlugin(pathing.resolve(directory));
          },
          unlinkDir: (directory) => {
            log.info(`Detected that deletion of a plugin directory (${directory}), proceeding to remove plugin.`);
            pluginManager.removePlugin(pathing.resolve(directory));
          }
        });
      });
    }).catch((reason) => log.error(reason));
};