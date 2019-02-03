const pathing = require('path');
const pluginManager = require('./manager');
const { attachFileSystemWatcher: attachWatcher, getDirectories, log } = require('../helpers');

const loaderFailed = (reason) => {
  log.error(reason);
};

module.exports = (pluginDirectory, disablePluginHotReload = false) => {
  pluginManager.hotReload(disablePluginHotReload);
  return getDirectories(pluginDirectory)
    .then((pluginDirectories) => {
      Promise.all(pluginDirectories.map((directory) => {
        return pluginManager.addPlugin(directory);
      })).then(() => {
        pluginManager.ensureMinimumPluginsLoaded();
      }).then(() => {
        // Avoid watching the plugins directory if the system will be used once
        if (disablePluginHotReload) return;
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
      }).catch(loaderFailed);
    }).catch(loaderFailed);
};