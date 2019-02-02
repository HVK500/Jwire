const PluginModel = require('./plugin-model');
const { fileExists, log } = require('../helpers');
const { getIndexPath } = require('./utils');

const container = new Map();

module.exports = {
  addPlugin: (directory) => {
    // TODO: Ignore folders that start with underscore (disabled)

    return fileExists(getIndexPath(directory))
      .then(() => {
        const plugin = new PluginModel(directory);
        container.set(plugin.id, plugin);
      }).catch((error) => {
        log.error(`Failed to create plugin - ${error}`);
      });
  },
  numberOfPluginsLoaded: () => {
    return container.size;
  },
  removePlugin: (parentFolder) => {
    const plugin = container.get(parentFolder);

    if (plugin == null) {
      log.warn('Plugin does not exist in pool, skipping removal.');
      return;
    }

    plugin.dispose();
    container.delete(plugin.id);
  }
};