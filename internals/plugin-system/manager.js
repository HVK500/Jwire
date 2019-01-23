const PluginModel = require('./plugin-model');
const { fileExists, log } = require('../helpers');
const pluginUtils = require('./utils');


const container = new Map();

module.exports = {
  addPlugin: (directory) => {
    // TODO: Ignore folders that start with underscore (disabled)

    fileExists(pluginUtils.getIndexPath(directory))
      .then(() => {
        const plugin = new PluginModel(directory);
        container.set(plugin.guid, plugin);
      }).catch((error) => {
        log.error(`Failed to create plugin - ${error}`);
      });
  },
  // getPlugins: () => {
  //   return container.values();
  // },
  removePlugin: (parentFolder) => {
    const plugin = container.get(parentFolder);

    if (plugin == null) {
      log.warn('Plugin does not exist in pool, skipping removal.');
      return;
    }

    plugin.dispose();
    container.delete(plugin.guid);
  }
};