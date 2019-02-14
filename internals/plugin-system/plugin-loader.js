const pathing = require('path');
const pluginManager = require('./plugin-manager');
const { attachFileSystemWatcher, getDirectories, log } = require('../helpers');

const attachWatcher = (pluginDirectory) => {
  attachFileSystemWatcher(pluginDirectory, {
    ready: () => {
      log.info('Plugin-system watching for changes...');
    },
    error: (error) => {
      log.error(error);
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
};

module.exports = async (pluginDirectory, disablePluginHotReload = false) => {
  pluginManager.hotReload(disablePluginHotReload);

  try {
    const pluginDirectories = await getDirectories(pluginDirectory);

    await Promise.all(pluginDirectories.map((directory) => {
      return pluginManager.addPlugin(directory);
    }));

    // Throw an error if the plugin does not meet the minimum requirements
    pluginManager.throwIfMinimumPluginsNotMet();

    // Avoid watching the plugins directory if the system will be used once
    if (disablePluginHotReload) return;
    attachWatcher(pluginDirectory);
  } catch(reason) {
    log.error(reason);
  }
};